import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

const prisma = new PrismaClient();
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-large",
});

const index = pinecone.index(process.env.PINECONE_INDEX!);

interface VectorizeStats {
  added: number;
  errors: number;
  details: {
    added: string[];
    errors: Array<{
      id: string;
      error: string;
    }>;
  };
}

async function createEmbedding(text: string) {
  const [embedding] = await embeddings.embedDocuments([text]);
  return embedding;
}

async function deleteWebsiteVectors(websiteId: string) {
  try {
    // First check default namespace for legacy vectors
    const defaultQuery = await index.query({
      vector: Array(3072).fill(0),
      topK: 100,
      filter: { websiteId: { $eq: websiteId } },
      includeMetadata: true,
    });

    // Delete legacy vectors by ID if found
    if (defaultQuery.matches.length > 0) {
      const vectorIds = defaultQuery.matches.map((match) => match.id);
      await index.deleteMany(vectorIds);
      console.log(
        `✅ Deleted ${vectorIds.length} legacy vectors from default namespace for website ${websiteId}`
      );
    }

    // Then check website-specific namespace
    const namespaceQuery = await index.namespace(websiteId).query({
      vector: Array(3072).fill(0),
      topK: 1,
      includeMetadata: true,
    });

    if (namespaceQuery.matches.length > 0) {
      await index.namespace(websiteId).deleteAll();
      console.log(`✅ Deleted vectors from website namespace ${websiteId}`);
    }

    console.log(`✅ Vector cleanup completed for website ${websiteId}`);
  } catch (error) {
    console.error(`⚠️ Error during vector cleanup:`, error);
  }
}

async function addToVectorStore(websiteId: string): Promise<VectorizeStats> {
  const stats: VectorizeStats = {
    added: 0,
    errors: 0,
    details: {
      added: [],
      errors: [],
    },
  };

  try {
    // Delete old vectors first
    await deleteWebsiteVectors(websiteId);

    // Get all WordPress content for this website
    const posts = await prisma.wordpressPost.findMany({
      where: { websiteId },
      include: { author: true },
    });

    const pages = await prisma.wordpressPage.findMany({
      where: { websiteId },
    });

    const products = await prisma.wordpressProduct.findMany({
      where: { websiteId },
      include: { reviews: true, categories: true },
    });

    // Add posts to vector store
    for (const post of posts) {
      try {
        const embedding = await createEmbedding(
          `${post.title}\n${post.content}`
        );
        await index.namespace(websiteId).upsert([
          {
            id: `post-${post.wpId}`,
            values: embedding,
            metadata: {
              type: "post",
              title: post.title,
              url: post.link,
              websiteId,
              dbId: post.id,
              ...(post.excerpt && { excerpt: post.excerpt }),
              ...(post.authorId && { authorId: post.authorId }),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`post-${post.wpId}`);
      } catch (error) {
        console.error(`Error vectorizing post ${post.wpId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `post-${post.wpId}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Add pages to vector store
    for (const page of pages) {
      try {
        const embedding = await createEmbedding(
          `${page.title}\n${page.content}`
        );
        await index.namespace(websiteId).upsert([
          {
            id: `page-${page.wpId}`,
            values: embedding,
            metadata: {
              type: "page",
              title: page.title,
              url: page.link,
              websiteId,
              dbId: page.id,
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`page-${page.wpId}`);
      } catch (error) {
        console.error(`Error vectorizing page ${page.wpId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `page-${page.wpId}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Add products to vector store
    for (const product of products) {
      try {
        const embedding = await createEmbedding(
          `${product.name}\n${product.description}\n${
            product.shortDescription || ""
          }`
        );
        await index.namespace(websiteId).upsert([
          {
            id: `product-${product.wpId}`,
            values: embedding,
            metadata: {
              type: "product",
              name: product.name,
              url: product.permalink,
              websiteId,
              price: product.price,
              dbId: product.id,
              reviewIds: product.reviews.map((r) => `review-${r.wpId}`),
              categoryIds: product.categories.map((c) => `category-${c.wpId}`),
              ...(product.shortDescription && {
                shortDescription: product.shortDescription,
              }),
              ...(product.regularPrice && {
                regularPrice: product.regularPrice,
              }),
              ...(product.salePrice && { salePrice: product.salePrice }),
              ...(product.stockQuantity && {
                stockQuantity: product.stockQuantity,
              }),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`product-${product.wpId}`);
      } catch (error) {
        console.error(`Error vectorizing product ${product.wpId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `product-${product.wpId}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Update VectorDbConfig
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        VectorDbConfig: {
          upsert: {
            create: {
              namespace: websiteId,
            },
            update: {
              namespace: websiteId,
            },
          },
        },
      },
    });

    return stats;
  } catch (error) {
    console.error("Error vectorizing website content:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the access key
    const accessKey = authHeader.split(" ")[1];
    if (!accessKey) {
      return NextResponse.json(
        { error: "No access key provided" },
        { status: 401 }
      );
    }

    // Find the website associated with this access key
    const website = await prisma.website.findFirst({
      where: {
        accessKeys: {
          some: {
            key: accessKey,
          },
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Invalid access key" },
        { status: 401 }
      );
    }

    // Add content to vector store
    const stats = await addToVectorStore(website.id);

    return NextResponse.json({
      success: true,
      message: "WordPress content vectorized",
      stats,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("Vectorization error:", error);
    return NextResponse.json(
      { error: "Vectorization failed", details: error.message },
      { status: 500 }
    );
  }
}
