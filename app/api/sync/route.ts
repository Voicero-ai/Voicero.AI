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

async function createEmbedding(text: string) {
  const [embedding] = await embeddings.embedDocuments([text]);
  return embedding;
}

interface SyncStats {
  created: number;
  updated: number;
  errors: number;
  details: {
    categories?: Array<{ id: number; error: string }>;
    posts?: Array<{ id: number; error: string }>;
    pages?: Array<{ id: number; error: string }>;
    products?: Array<{ id: number; error: string }>;
    comments?: Array<{ id: number; error: string }>;
    vectorStore?: {
      added: Array<string>;
      errors: Array<{ id: string; error: string }>;
    };
  };
}

async function addToPinecone(
  id: string,
  type: "post" | "page" | "product" | "comment" | "review",
  content: string,
  metadata: any,
  stats: SyncStats
) {
  try {
    const embedding = await createEmbedding(content);
    await index.namespace(metadata.websiteId).upsert([
      {
        id,
        values: embedding,
        metadata: {
          type,
          ...metadata,
        },
      },
    ]);
    stats.details.vectorStore = stats.details.vectorStore || {
      added: [],
      errors: [],
    };
    stats.details.vectorStore.added.push(`${type}-${id}`);
  } catch (error) {
    console.error(`Error adding to vector store: ${type}-${id}`, error);
    stats.details.vectorStore = stats.details.vectorStore || {
      added: [],
      errors: [],
    };
    stats.details.vectorStore.errors.push({
      id: `${type}-${id}`,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function fetchWordPressData(baseUrl: string, request: Request) {
  const results: any = {};
  const errors: any = {};

  try {
    const response = await fetch(
      `${baseUrl}/wp-json/my-plugin/v1/all-content`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Map the response data to our results object
    results.posts = data.posts;
    results.pages = data.pages;
    results.products = data.products;
    results.categories = data.categories;
    results.tags = data.tags;
    results.media = data.media;
    results.productCategories = data.productCategories;
    results.productTags = data.productTags;

    // Log what we got
    Object.entries(data).forEach(([key, value]) => {
      console.log(
        `✅ Fetched ${key}: ${Array.isArray(value) ? value.length : 1} items`
      );
    });
  } catch (error: any) {
    console.error("❌ Error fetching WordPress data:", error);
    errors.all = error.message;
  }

  return { results, errors };
}

async function deleteWebsiteVectors(websiteId: string) {
  try {
    // First check default namespace for legacy vectors
    const defaultQuery = await index.query({
      vector: Array(3072).fill(0),
      topK: 100, // Get a batch of vectors to check
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
    // Log error but don't throw - allow sync to proceed
    console.error(`⚠️ Error during vector cleanup:`, error);
  }
}

async function syncToDatabase(
  websiteId: string,
  websiteUrl: string,
  data: any
): Promise<SyncStats> {
  const stats: SyncStats = {
    created: 0,
    updated: 0,
    errors: 0,
    details: {},
  };

  const now = new Date();

  try {
    // Delete old vectors before syncing new ones
    await deleteWebsiteVectors(websiteId);

    // Sync Posts
    if (data.posts) {
      for (const post of data.posts) {
        try {
          // Store in MySQL
          const dbPost = await prisma.wordpressPost.upsert({
            where: {
              wpId: post.id,
            },
            update: {
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              slug: post.slug,
              link: post.link,
              websiteId,
              authorId: post.author,
              updatedAt: now,
            },
            create: {
              wpId: post.id,
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              slug: post.slug,
              link: post.link,
              websiteId,
              authorId: post.author,
              createdAt: now,
              updatedAt: now,
            },
          });

          // Store in Pinecone
          await addToPinecone(
            `post-${post.id}`,
            "post",
            `${post.title}\n${post.content}`,
            {
              title: post.title,
              url: post.link,
              websiteId,
              excerpt: post.excerpt,
              authorId: post.author,
              dbId: dbPost.id,
              commentIds:
                post.comments?.map((c: any) => `comment-${c.id}`) || [],
            },
            stats
          );

          stats.created++;
        } catch (error) {
          console.error("Error syncing post:", error);
          stats.errors++;
        }
      }
    }

    // Sync Pages
    if (data.pages) {
      for (const page of data.pages) {
        try {
          // Store in MySQL
          const dbPage = await prisma.wordpressPage.upsert({
            where: {
              wpId: page.id,
            },
            update: {
              title: page.title,
              content: page.content,
              slug: page.slug,
              link: page.link,
              websiteId,
              updatedAt: now,
            },
            create: {
              wpId: page.id,
              title: page.title,
              content: page.content,
              slug: page.slug,
              link: page.link,
              websiteId,
              createdAt: now,
              updatedAt: now,
            },
          });

          // Store in Pinecone
          await addToPinecone(
            `page-${page.id}`,
            "page",
            `${page.title}\n${page.content}`,
            {
              title: page.title,
              url: page.link,
              websiteId,
              dbId: dbPage.id,
            },
            stats
          );

          stats.created++;
        } catch (error) {
          console.error("Error syncing page:", error);
          stats.errors++;
        }
      }
    }

    // Sync Products
    if (data.products) {
      for (const product of data.products) {
        try {
          // Store in MySQL
          const dbProduct = await prisma.wordpressProduct.upsert({
            where: {
              wpId: product.id,
            },
            update: {
              name: product.name,
              slug: product.slug,
              permalink: product.link,
              description: product.description,
              shortDescription: product.short_description,
              price: parseFloat(product.price || "0"),
              regularPrice: product.regular_price
                ? parseFloat(product.regular_price)
                : null,
              salePrice: product.sale_price
                ? parseFloat(product.sale_price)
                : null,
              stockQuantity: product.stock_quantity || null,
              websiteId,
              updatedAt: now,
            },
            create: {
              wpId: product.id,
              name: product.name,
              slug: product.slug,
              permalink: product.link,
              description: product.description,
              shortDescription: product.short_description,
              price: parseFloat(product.price || "0"),
              regularPrice: product.regular_price
                ? parseFloat(product.regular_price)
                : null,
              salePrice: product.sale_price
                ? parseFloat(product.sale_price)
                : null,
              stockQuantity: product.stock_quantity || null,
              websiteId,
              createdAt: now,
              updatedAt: now,
            },
          });

          // Store in Pinecone
          await addToPinecone(
            `product-${product.id}`,
            "product",
            `${product.name}\n${product.description}\n${
              product.short_description || ""
            }`,
            {
              name: product.name,
              url: product.link,
              websiteId,
              price: parseFloat(product.price || "0"),
              dbId: dbProduct.id,
              reviewIds:
                product.reviews?.map((r: any) => `review-${r.id}`) || [],
              categoryIds:
                product.categories?.map((c: any) => `category-${c.id}`) || [],
            },
            stats
          );

          stats.created++;
        } catch (error) {
          console.error("Error syncing product:", error);
          stats.errors++;
        }
      }
    }

    // Sync Comments
    if (data.comments) {
      for (const comment of data.comments) {
        try {
          // Store in MySQL
          const dbComment = await prisma.wordpressComment.upsert({
            where: { wpId: parseInt(comment.id) },
            update: {
              authorName: comment.author,
              authorEmail: comment.author_email,
              content: comment.content,
              date: new Date(comment.date),
              status: comment.status || "approved",
              parentId:
                comment.parent_id && comment.parent_id !== "0"
                  ? parseInt(comment.parent_id)
                  : null,
              postId: parseInt(comment.post_id),
            },
            create: {
              wpId: parseInt(comment.id),
              authorName: comment.author,
              authorEmail: comment.author_email,
              content: comment.content,
              date: new Date(comment.date),
              status: comment.status || "approved",
              parentId:
                comment.parent_id && comment.parent_id !== "0"
                  ? parseInt(comment.parent_id)
                  : null,
              postId: parseInt(comment.post_id),
            },
          });

          // Store in Pinecone
          await addToPinecone(
            `comment-${comment.id}`,
            "comment",
            comment.content,
            {
              author: comment.author,
              postId: `post-${comment.post_id}`,
              websiteId,
              date: comment.date,
              dbId: dbComment.id,
              ...(comment.parent_id && comment.parent_id !== "0"
                ? {
                    parentId: `comment-${comment.parent_id}`,
                  }
                : {}),
            },
            stats
          );

          stats.created++;
        } catch (error) {
          console.error("Error syncing comment:", error);
          stats.errors++;
        }
      }
    }

    // Sync Reviews
    if (data.reviews) {
      for (const review of data.reviews) {
        try {
          await prisma.wordpressReview.upsert({
            where: { wpId: parseInt(review.id) },
            update: {
              reviewer: review.reviewer,
              reviewerEmail: review.reviewer_email,
              review: review.review,
              rating: review.rating,
              date: new Date(review.date),
              verified: review.verified,
              product: {
                connect: {
                  wpId: parseInt(review.product_id),
                },
              },
            },
            create: {
              wpId: parseInt(review.id),
              reviewer: review.reviewer,
              reviewerEmail: review.reviewer_email,
              review: review.review,
              rating: review.rating,
              date: new Date(review.date),
              verified: review.verified,
              product: {
                connect: {
                  wpId: parseInt(review.product_id),
                },
              },
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing review:", {
            reviewId: review.id,
            productId: review.product_id,
            error: error instanceof Error ? error.message : String(error),
          });
          stats.errors++;
        }
      }
    }

    // Sync Categories
    if (data.categories) {
      stats.details.categories = [];
      for (const category of data.categories) {
        try {
          await prisma.wordpressCategory.upsert({
            where: {
              wpId: category.id,
            },
            update: {
              name: category.name,
              slug: category.slug,
              description: category.description,
              websiteId,
            },
            create: {
              wpId: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              websiteId,
            },
          });
          stats.created++;
        } catch (error: any) {
          console.error("Error syncing category:", error);
          stats.errors++;
          stats.details.categories.push({
            id: category.id,
            error: error.message,
          });
        }
      }
    }

    // Sync Authors
    if (data.authors) {
      for (const author of data.authors) {
        try {
          await prisma.wordpressAuthor.upsert({
            where: { wpId: author.id },
            update: {
              name: author.name,
              email: author.email,
              url: author.url,
              bio: author.bio,
              avatarUrl: author.avatar,
              websiteId,
              updatedAt: new Date(),
            },
            create: {
              wpId: author.id,
              name: author.name,
              email: author.email,
              url: author.url,
              bio: author.bio,
              avatarUrl: author.avatar,
              websiteId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing author:", error);
          stats.errors++;
        }
      }
    }

    // Sync Media
    if (data.media) {
      for (const media of data.media) {
        try {
          await prisma.wordpressMedia.upsert({
            where: { wpId: media.id },
            update: {
              title: media.title,
              url: media.url,
              alt: media.alt,
              description: media.description,
              caption: media.caption,
              mimeType: media.mime_type,
              metadata: media.metadata,
              websiteId,
              updatedAt: new Date(),
            },
            create: {
              wpId: media.id,
              title: media.title,
              url: media.url,
              alt: media.alt,
              description: media.description,
              caption: media.caption,
              mimeType: media.mime_type,
              metadata: media.metadata,
              websiteId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing media:", error);
          stats.errors++;
        }
      }
    }

    // Sync Custom Fields
    if (data.customFields) {
      for (const customField of data.customFields) {
        try {
          let relatedPost;
          if (customField.postType === "product") {
            relatedPost = await prisma.wordpressProduct.findUnique({
              where: { wpId: customField.postId },
            });
          } else {
            relatedPost = await prisma.wordpressPost.findUnique({
              where: { wpId: customField.postId },
            });
          }

          if (!relatedPost) {
            console.log(
              `Skipping custom field - no related ${customField.postType} found with wpId: ${customField.postId}`
            );
            continue;
          }

          await prisma.wordpressCustomField.upsert({
            where: {
              postId_metaKey: {
                postId: relatedPost.id,
                metaKey: customField.metaKey,
              },
            },
            update: {
              metaValue: customField.metaValue,
              postType: customField.postType,
              websiteId,
              updatedAt: now,
              ...(customField.postType === "product"
                ? { wordpressProductId: relatedPost.id }
                : { postId: relatedPost.id }),
            },
            create: {
              metaKey: customField.metaKey,
              metaValue: customField.metaValue,
              postType: customField.postType,
              websiteId,
              createdAt: now,
              updatedAt: now,
              ...(customField.postType === "product"
                ? { wordpressProductId: relatedPost.id }
                : { postId: relatedPost.id }),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing custom field:", {
            customField,
            error: error instanceof Error ? error.message : String(error),
          });
          stats.errors++;
        }
      }
    }

    // Sync Product Categories
    if (data.productCategories) {
      for (const category of data.productCategories) {
        try {
          await prisma.wordpressProductCategory.upsert({
            where: { wpId: category.id },
            update: {
              name: category.name,
              slug: category.slug,
              parent: category.parent || null,
              count: category.count,
              imageUrl: category.image,
              websiteId,
              updatedAt: new Date(),
            },
            create: {
              wpId: category.id,
              name: category.name,
              slug: category.slug,
              parent: category.parent || null,
              count: category.count,
              imageUrl: category.image,
              websiteId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing product category:", error);
          stats.errors++;
        }
      }
    }

    // Sync Product Tags
    if (data.productTags) {
      for (const tag of data.productTags) {
        try {
          await prisma.wordpressProductTag.upsert({
            where: { wpId: tag.id },
            update: {
              name: tag.name,
              slug: tag.slug,
              description: tag.description,
              count: tag.count,
              websiteId,
              updatedAt: new Date(),
            },
            create: {
              wpId: tag.id,
              name: tag.name,
              slug: tag.slug,
              description: tag.description,
              count: tag.count,
              websiteId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing product tag:", error);
          stats.errors++;
        }
      }
    }

    // Sync Tags
    if (data.tags) {
      for (const tag of data.tags) {
        try {
          await prisma.wordpressTag.upsert({
            where: {
              wpId: tag.id,
            },
            update: {
              name: tag.name,
              slug: tag.slug,
              website: { connect: { id: websiteId } },
              updatedAt: now,
            },
            create: {
              wpId: tag.id,
              name: tag.name,
              slug: tag.slug,
              website: { connect: { id: websiteId } },
              createdAt: now,
              updatedAt: now,
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing tag:", error);
          stats.errors++;
        }
      }
    }

    // Store Pinecone connection info in Website record
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        lastSyncedAt: now,
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
  } catch (error: any) {
    console.error("Database sync error:", error);
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

    // Get the data directly from the request body
    const data = await request.json();
    console.log("Received data:", {
      dataTypes: Object.keys(data),
      productsCount: data.products?.length,
      pagesCount: data.pages?.length,
      postsCount: data.posts?.length,
    });

    // Sync to database
    const stats = await syncToDatabase(website.id, website.url, data);

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      stats: {
        ...stats,
      },
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error.message },
      { status: 500 }
    );
  }
}
