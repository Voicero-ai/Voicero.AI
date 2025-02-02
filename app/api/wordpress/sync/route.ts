import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SyncStats {
  created: number;
  updated: number;
  errors: number;
  details: {
    categories?: Array<{ id: number; error: string }>;
    posts?: Array<{ id: number; error: string }>;
    pages?: Array<{ id: number; error: string }>;
    products?: Array<{ id: number; error: string }>;
  };
}

async function fetchWordPressData(baseUrl: string) {
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
    results.posts = data.posts;
    results.pages = data.pages;
    results.products = data.products;
    results.categories = data.categories;
    results.tags = data.tags;
    results.media = data.media;
    results.productCategories = data.productCategories;
    results.productTags = data.productTags;

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

  const now = new Date();

  try {
    // Sync Posts
    if (data.posts) {
      for (const post of data.posts) {
        try {
          await prisma.wordpressPost.upsert({
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
          await prisma.wordpressPage.upsert({
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
          await prisma.wordpressProduct.upsert({
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
          stats.created++;
        } catch (error) {
          console.error("Error syncing product:", error);
          stats.errors++;
        }
      }
    }

    // Update last sync time
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        lastSyncedAt: now,
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
      message: "WordPress sync completed",
      stats,
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
