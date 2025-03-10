import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { cors } from "../../../../lib/cors";

// Remove Edge Runtime directive
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

// Add a new function to process data in chunks
async function processInChunks<T>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processor));
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

    // Process products in chunks of 5 at a time (adjust as needed)
    const processProduct = async (product: any) => {
      try {
        const variantInfo = product.variants
          .map(
            (v: any) =>
              `${v.title}: $${v.price}${v.sku ? ` (SKU: ${v.sku})` : ""}`
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
                product.variants.map((v: any) => ({
                  title: v.title,
                  price: v.price,
                  sku: v.sku,
                }))
              ),
              websiteId,
              dbId: product.id,
              productId: product.shopifyId.toString(),
              reviewIds: product.reviews.map(
                (r: any) => `review-${r.shopifyId}`
              ),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`product-${product.shopifyId}`);
      } catch (error: any) {
        console.error(`Error vectorizing product ${product.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `product-${product.shopifyId}`,
          error: error.message,
        });
      }
    };

    // Process in chunks
    await processInChunks(products, 5, processProduct);

    // Process reviews in chunks
    const allReviews = products.flatMap((product) =>
      product.reviews.map((review) => ({ review, product }))
    );

    const processReview = async ({
      review,
      product,
    }: {
      review: any;
      product: any;
    }) => {
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
      } catch (error: any) {
        console.error(`Error vectorizing review ${review.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `review-${review.shopifyId}`,
          error: error.message,
        });
      }
    };

    await processInChunks(allReviews, 10, processReview);

    // Process pages in chunks
    const processPage = async (page: any) => {
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
              pageId: page.shopifyId.toString(),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`page-${page.shopifyId}`);
      } catch (error: any) {
        console.error(`Error vectorizing page ${page.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `page-${page.shopifyId}`,
          error: error.message,
        });
      }
    };

    await processInChunks(pages, 5, processPage);

    // Process blog posts in chunks
    // First, flatten the blog posts
    const allBlogPosts = blogs.flatMap((blog) =>
      blog.posts.map((post) => ({ post, blog }))
    );

    const processBlogPost = async ({
      post,
      blog,
    }: {
      post: any;
      blog: any;
    }) => {
      try {
        const postText = `${blog.title} - ${post.title}\n${post.content}`;
        const embedding = await createEmbedding(postText);

        await index.namespace(websiteId).upsert([
          {
            id: `post-${post.shopifyId}`,
            values: embedding,
            metadata: {
              type: "post",
              blogTitle: blog.title,
              blogHandle: blog.handle,
              title: post.title,
              content: cleanContent(post.content),
              author: post.author,
              handle: post.handle,
              websiteId,
              dbId: post.id,
              postId: post.shopifyId.toString(),
              blogId: blog.shopifyId.toString(),
              commentIds: post.comments.map(
                (c: any) => `comment-${c.shopifyId}`
              ),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`post-${post.shopifyId}`);
      } catch (error: any) {
        console.error(`Error vectorizing post ${post.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `post-${post.shopifyId}`,
          error: error.message,
        });
      }
    };

    await processInChunks(allBlogPosts, 5, processBlogPost);

    // Process blog comments in chunks
    const allComments = allBlogPosts.flatMap(({ post, blog }) =>
      post.comments.map((comment) => ({ comment, post, blog }))
    );

    const processComment = async ({
      comment,
      post,
      blog,
    }: {
      comment: any;
      post: any;
      blog: any;
    }) => {
      try {
        const commentText = `Comment on ${blog.title} - ${post.title}: ${comment.content}`;
        const embedding = await createEmbedding(commentText);

        await index.namespace(websiteId).upsert([
          {
            id: `comment-${comment.shopifyId}`,
            values: embedding,
            metadata: {
              type: "comment",
              blogTitle: blog.title,
              postTitle: post.title,
              content: cleanContent(comment.content),
              author: comment.author,
              email: comment.email,
              websiteId,
              dbId: comment.id,
              commentId: comment.shopifyId.toString(),
              postId: post.shopifyId.toString(),
              blogId: blog.shopifyId.toString(),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`comment-${comment.shopifyId}`);
      } catch (error: any) {
        console.error(`Error vectorizing comment ${comment.shopifyId}:`, error);
        stats.errors++;
        stats.details.errors.push({
          id: `comment-${comment.shopifyId}`,
          error: error.message,
        });
      }
    };

    await processInChunks(allComments, 10, processComment);

    // Process discounts in chunks
    const processDiscount = async (discount: any) => {
      try {
        const discountText = `${discount.title}\n${discount.summary}\nCode: ${discount.code}`;
        const embedding = await createEmbedding(discountText);

        await index.namespace(websiteId).upsert([
          {
            id: `discount-${discount.shopifyId}`,
            values: embedding,
            metadata: {
              type: "discount",
              title: discount.title,
              summary: discount.summary,
              code: discount.code,
              websiteId,
              dbId: discount.id,
              discountId: discount.shopifyId.toString(),
            },
          },
        ]);
        stats.added++;
        stats.details.added.push(`discount-${discount.shopifyId}`);
      } catch (error: any) {
        console.error(
          `Error vectorizing discount ${discount.shopifyId}:`,
          error
        );
        stats.errors++;
        stats.details.errors.push({
          id: `discount-${discount.shopifyId}`,
          error: error.message,
        });
      }
    };

    await processInChunks(discounts, 5, processDiscount);

    console.log(`✅ Added ${stats.added} vectors for website ${websiteId}`);
    if (stats.errors > 0) {
      console.log(`⚠️ Encountered ${stats.errors} errors during vectorization`);
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
  let response;

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      response = NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    } else {
      const accessKey = authHeader.split(" ")[1];
      if (!accessKey) {
        response = NextResponse.json(
          { error: "No access key provided" },
          { status: 401 }
        );
      } else {
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
          response = NextResponse.json(
            { error: "Invalid access key" },
            { status: 401 }
          );
        } else {
          const stats = await addToVectorStore(website.id);
          response = NextResponse.json({
            success: true,
            message: "Shopify content vectorized",
            stats,
            timestamp: new Date(),
          });
        }
      }
    }
  } catch (error: any) {
    response = NextResponse.json(
      { error: "Vectorization failed", details: error.message },
      { status: 500 }
    );
  }

  // Apply CORS headers to the response
  return cors(request, response);
}
