import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

export const dynamic = "force-dynamic";

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

function cleanContent(content: string): string {
  if (!content) return "";

  try {
    // Create a DOMParser-like environment in Node.js
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(content);
    const doc = dom.window.document;

    // Get all text content, removing scripts and styles
    const scripts = doc.getElementsByTagName("script");
    const styles = doc.getElementsByTagName("style");
    [...scripts, ...styles].forEach((el) => el.remove());

    // Get the cleaned text content
    const text = doc.body.textContent || doc.documentElement.textContent || "";

    // Clean up whitespace
    return text.replace(/\s+/g, " ").trim();
  } catch (error) {
    // Fallback if HTML parsing fails
    console.warn("HTML parsing failed, falling back to basic cleaning:", error);
    return content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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
      include: {
        author: true,
        comments: true, // Include comments
      },
    });

    const pages = await prisma.wordpressPage.findMany({
      where: { websiteId },
    });

    const products = await prisma.wordpressProduct.findMany({
      where: { websiteId },
      include: {
        reviews: true,
        categories: true,
      },
    });

    // Add posts to vector store
    for (const post of posts) {
      try {
        const cleanedTitle = cleanContent(post.title);
        const cleanedContent = cleanContent(post.content);

        const embedding = await createEmbedding(
          `${cleanedTitle}\n${cleanedContent}`
        );

        await index.namespace(websiteId).upsert([
          {
            id: `post-${post.wpId}`,
            values: embedding,
            metadata: {
              type: "post",
              title: cleanedTitle,
              content: cleanedContent,
              url: post.link,
              websiteId,
              dbId: post.id,
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

    // Add comments to vector store
    for (const post of posts) {
      for (const comment of post.comments) {
        try {
          const embedding = await createEmbedding(
            `Comment on post "${cleanContent(post.title)}": ${cleanContent(
              comment.content
            )}`
          );
          await index.namespace(websiteId).upsert([
            {
              id: `comment-${comment.wpId}`,
              values: embedding,
              metadata: {
                type: "comment",
                content: comment.content,
                authorName: comment.authorName,
                postTitle: post.title,
                postUrl: post.link,
                websiteId,
                postId: post.wpId,
                date: comment.date.toISOString(),
              },
            },
          ]);
          stats.added++;
          stats.details.added.push(`comment-${comment.wpId}`);
        } catch (error) {
          console.error(`Error vectorizing comment ${comment.wpId}:`, error);
          stats.errors++;
          stats.details.errors.push({
            id: `comment-${comment.wpId}`,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Add pages to vector store
    for (const page of pages) {
      try {
        const cleanedTitle = cleanContent(page.title);
        const cleanedContent = cleanContent(page.content);

        const embedding = await createEmbedding(
          `${cleanedTitle}\n${cleanedContent}`
        );
        await index.namespace(websiteId).upsert([
          {
            id: `page-${page.wpId}`,
            values: embedding,
            metadata: {
              type: "page",
              title: cleanedTitle,
              content: cleanedContent,
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
        const cleanedName = cleanContent(product.name);
        const cleanedDescription = cleanContent(product.description);
        const cleanedShortDescription = cleanContent(
          product.shortDescription || ""
        );

        const embedding = await createEmbedding(
          `${cleanedName}\n${cleanedDescription}\n${cleanedShortDescription}`
        );
        await index.namespace(websiteId).upsert([
          {
            id: `product-${product.wpId}`,
            values: embedding,
            metadata: {
              type: "product",
              name: cleanedName,
              description: cleanedDescription,
              shortDescription: cleanedShortDescription,
              url: product.permalink,
              websiteId,
              price: product.price,
              dbId: product.id,
              reviewIds: product.reviews.map((r) => `review-${r.wpId}`),
              categoryIds: product.categories.map((c) => `category-${c.wpId}`),
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

    // Add product reviews to vector store
    for (const product of products) {
      // Add reviews for this product
      for (const review of product.reviews) {
        try {
          const embedding = await createEmbedding(
            `Review of product "${cleanContent(product.name)}": ${cleanContent(
              review.review
            )}`
          );
          await index.namespace(websiteId).upsert([
            {
              id: `review-${review.wpId}`,
              values: embedding,
              metadata: {
                type: "review",
                content: review.review,
                rating: review.rating,
                reviewer: review.reviewer,
                productName: product.name,
                productUrl: product.permalink,
                websiteId,
                productId: product.wpId,
                verified: review.verified,
                date: review.date.toISOString(),
              },
            },
          ]);
          stats.added++;
          stats.details.added.push(`review-${review.wpId}`);
        } catch (error) {
          console.error(`Error vectorizing review ${review.wpId}:`, error);
          stats.errors++;
          stats.details.errors.push({
            id: `review-${review.wpId}`,
            error: error instanceof Error ? error.message : String(error),
          });
        }
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
