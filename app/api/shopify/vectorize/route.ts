import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { cors } from "../../../../lib/cors";

// Add edge runtime configuration to use Vercel Edge Functions
export const runtime = "edge";
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

    if (defaultQuery.matches.length > 0) {
      const vectorIds = defaultQuery.matches.map((match) => match.id);
      await index.deleteMany(vectorIds);
      console.log(
        `✅ Deleted ${vectorIds.length} legacy vectors for website ${websiteId}`
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
  } catch (error) {
    console.error(`⚠️ Error during vector cleanup:`, error);
  }
}

function cleanContent(content: string): string {
  if (!content) return "";
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

    // Get all Shopify content for this website
    const products = await prisma.shopifyProduct.findMany({
      where: { websiteId },
      include: {
        variants: true,
        reviews: true,
        images: true,
      },
    });

    const pages = await prisma.shopifyPage.findMany({
      where: { websiteId },
    });

    const blogs = await prisma.shopifyBlog.findMany({
      where: { websiteId },
      include: {
        posts: {
          include: {
            comments: true,
          },
        },
      },
    });

    const discounts = await prisma.shopifyDiscount.findMany({
      where: { websiteId },
    });

    // Add products to vector store
    for (const product of products) {
      try {
        const variantInfo = product.variants
          .map(
            (v) => `${v.title}: $${v.price}${v.sku ? ` (SKU: ${v.sku})` : ""}`
          )
          .join("\n");

        const productText = `
          ${product.title}
          ${product.description}
          Product Type: ${product.productType}
          Vendor: ${product.vendor}
          Variants:\n${variantInfo}
        `.trim();

        const embedding = await createEmbedding(productText);

        await index.namespace(websiteId).upsert([
          {
            id: `product-${product.shopifyId}`,
            values: embedding,
            metadata: {
              type: "product",
              title: product.title,
              description: product.description,
              handle: product.handle,
              vendor: product.vendor,
              productType: product.productType,
              variants: JSON.stringify(
                product.variants.map((v) => ({
                  title: v.title,
                  price: v.price,
                  sku: v.sku,
                }))
              ),
              websiteId,
              dbId: product.id,
              productId: product.shopifyId.toString(),
              reviewIds: product.reviews.map((r) => `review-${r.shopifyId}`),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`product-${product.shopifyId}`);
      } catch (error) {
        console.error(`Error vectorizing product ${product.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `product-${product.shopifyId}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Add product reviews
    for (const product of products) {
      for (const review of product.reviews) {
        try {
          const reviewText = `Review of ${product.title}: ${review.title}\n${review.body}`;
          const embedding = await createEmbedding(reviewText);

          await index.namespace(websiteId).upsert([
            {
              id: `review-${review.shopifyId}`,
              values: embedding,
              metadata: {
                type: "review",
                productTitle: product.title,
                productId: product.shopifyId.toString(),
                reviewer: review.reviewer,
                rating: review.rating,
                title: review.title,
                body: review.body,
                verified: review.verified,
                websiteId,
                createdAt: review.createdAt.toISOString(),
              },
            },
          ]);
          stats.added++;
          stats.details.added.push(`review-${review.shopifyId}`);
        } catch (error) {
          console.error(`Error vectorizing review ${review.shopifyId}:`, error);
          stats.errors++;
          stats.details.errors.push({
            id: `review-${review.shopifyId}`,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Add pages
    for (const page of pages) {
      try {
        const embedding = await createEmbedding(
          `${page.title}\n${page.content}`
        );

        await index.namespace(websiteId).upsert([
          {
            id: `page-${page.shopifyId}`,
            values: embedding,
            metadata: {
              type: "page",
              title: page.title,
              content: cleanContent(page.content),
              handle: page.handle,
              websiteId,
              dbId: page.id,
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`page-${page.shopifyId}`);
      } catch (error) {
        console.error(`Error vectorizing page ${page.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `page-${page.shopifyId}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Add blog posts and comments
    for (const blog of blogs) {
      for (const post of blog.posts) {
        try {
          const embedding = await createEmbedding(
            `${post.title}\n${post.content}`
          );

          await index.namespace(websiteId).upsert([
            {
              id: `blog-post-${post.shopifyId}`,
              values: embedding,
              metadata: {
                type: "blog-post",
                title: post.title,
                content: cleanContent(post.content),
                handle: post.handle,
                author: post.author,
                blogTitle: blog.title,
                websiteId,
                dbId: post.id,
                blogId: blog.id,
                image: post.image || "",
              },
            },
          ]);
          stats.added++;
          stats.details.added.push(`blog-post-${post.shopifyId}`);

          // Add comments for this post
          for (const comment of post.comments) {
            try {
              const commentEmbedding = await createEmbedding(
                `Comment on "${post.title}": ${comment.body}`
              );

              await index.namespace(websiteId).upsert([
                {
                  id: `comment-${comment.shopifyId}`,
                  values: commentEmbedding,
                  metadata: {
                    type: "comment",
                    content: comment.body,
                    author: comment.author,
                    postTitle: post.title,
                    blogTitle: blog.title,
                    websiteId,
                    postId: post.shopifyId,
                    status: comment.status,
                    createdAt: comment.createdAt.toISOString(),
                  },
                },
              ]);
              stats.added++;
              stats.details.added.push(`comment-${comment.shopifyId}`);
            } catch (error) {
              console.error(
                `Error vectorizing comment ${comment.shopifyId}:`,
                error
              );
              stats.errors++;
              stats.details.errors.push({
                id: `comment-${comment.shopifyId}`,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        } catch (error) {
          console.error(
            `Error vectorizing blog post ${post.shopifyId}:`,
            error
          );
          stats.errors++;
          stats.details.errors.push({
            id: `blog-post-${post.shopifyId}`,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Add discounts
    for (const discount of discounts) {
      try {
        const discountText = `
          ${discount.title}
          Type: ${discount.type}
          Code: ${discount.code || "Automatic"}
          Value: ${discount.value}
          ${discount.appliesTo ? `Applies to: ${discount.appliesTo}` : ""}
        `.trim();

        const embedding = await createEmbedding(discountText);

        await index.namespace(websiteId).upsert([
          {
            id: `discount-${discount.shopifyId}`,
            values: embedding,
            metadata: {
              type: "discount",
              title: discount.title,
              code: discount.code || "",
              discountType: discount.type,
              value: discount.value,
              appliesTo: discount.appliesTo || "",
              status: discount.status,
              websiteId,
              dbId: discount.id,
              startsAt: discount.startsAt.toISOString(),
              endsAt: discount.endsAt?.toISOString() || "",
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`discount-${discount.shopifyId}`);
      } catch (error) {
        console.error(
          `Error vectorizing discount ${discount.shopifyId}:`,
          error
        );
        stats.errors++;
        stats.details.errors.push({
          id: `discount-${discount.shopifyId}`,
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

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessKey = authHeader.split(" ")[1];
    if (!accessKey) {
      return NextResponse.json(
        { error: "No access key provided" },
        { status: 401 }
      );
    }

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

    // Use streaming response for Edge Functions
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "started",
                message: "Vectorization process started",
                timestamp: new Date(),
              }) + "\n"
            )
          );

          // Run the vectorization process
          const stats = await addToVectorStore(website.id);

          // Send final message with stats
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "completed",
                message: "Shopify content vectorized",
                stats,
                timestamp: new Date(),
              }) + "\n"
            )
          );

          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "error",
                message: error.message,
                timestamp: new Date(),
              }) + "\n"
            )
          );
          controller.close();
        }
      },
    });

    // Return the stream response
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
