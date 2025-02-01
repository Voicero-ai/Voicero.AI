import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SyncStats {
  created: number;
  updated: number;
  errors: number;
  details: {
    categories?: Array<{
      id: number;
      error: string;
    }>;
    posts?: Array<{
      id: number;
      error: string;
    }>;
    pages?: Array<{
      id: number;
      error: string;
    }>;
    products?: Array<{
      id: number;
      error: string;
    }>;
  };
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

  try {
    // Sync Posts
    if (data.posts) {
      for (const post of data.posts) {
        try {
          await prisma.wordpressPost.upsert({
            where: { wpId: post.id },
            update: {
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              slug: post.slug,
              link: post.link,
              websiteId,
              authorId: post.author,
              updatedAt: new Date(),
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
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing post:", error);
          stats.errors++;
        }
      }
    }

    // Sync Comments
    if (data.comments) {
      // First, sort comments so parents come before children
      const sortedComments = [...data.comments].sort((a, b) => {
        // If a has no parent and b has a parent, a comes first
        if (!a.parent_id && b.parent_id) return -1;
        // If b has no parent and a has a parent, b comes first
        if (a.parent_id && !b.parent_id) return 1;
        // If both have parents or both don't have parents, maintain original order
        return 0;
      });

      for (const comment of sortedComments) {
        try {
          await prisma.wordpressComment.upsert({
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
          stats.created++;
        } catch (error) {
          console.error("Error syncing comment:", {
            commentId: comment.id,
            postId: comment.post_id,
            parentId: comment.parent_id,
            error: error instanceof Error ? error.message : String(error),
          });
          stats.errors++;
        }
      }
    }

    // Sync Pages
    if (data.pages) {
      for (const page of data.pages) {
        try {
          await prisma.wordpressPage.upsert({
            where: { wpId: page.id },
            update: {
              title: page.title,
              content: page.content,
              slug: page.slug,
              link: page.link,
              websiteId,
              updatedAt: new Date(),
            },
            create: {
              wpId: page.id,
              title: page.title,
              content: page.content,
              slug: page.slug,
              link: page.link,
              websiteId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing page:", error);
          stats.errors++;
        }
      }
    }

    // Sync Products
    if (data.products) {
      console.log("Syncing products:", data.products.length);
      for (const product of data.products) {
        try {
          console.log("Processing product:", {
            id: product.id,
            name: product.name,
            link: product.link,
          });
          await prisma.wordpressProduct.upsert({
            where: { wpId: product.id },
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
              updatedAt: new Date(),
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
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          stats.created++;
        } catch (error) {
          console.error("Error syncing product:", {
            productId: product.id,
            productName: product.name,
            error: error instanceof Error ? error.message : String(error),
          });
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
            where: { wpId: category.id },
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

    // Update website's last sync time
    await prisma.website.update({
      where: { id: websiteId },
      data: { lastSyncedAt: new Date() },
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
