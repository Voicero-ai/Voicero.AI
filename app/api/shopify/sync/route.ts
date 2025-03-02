import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { cors } from "../../../../lib/cors";
import { PrismaClient, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// If you prefer using this new prismaWithPool client, that's fine,
// but ensure the DB URL and environment match exactly what is used
// by the rest of your app.
const prismaWithPool = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "error", "warn"],
});

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

interface ShopifyProductInput {
  shopifyId: string | number;
  title?: string;
  handle?: string;
  vendor?: string;
  productType?: string;
  description?: string;
  variants?: Array<{
    shopifyId: string | number;
    title?: string;
    price?: string | number;
    sku?: string;
    inventory?: number;
  }>;
  images?: Array<{
    shopifyId: string | number;
    url?: string;
    src?: string;
    altText?: string;
    alt?: string;
  }>;
}

interface PageInput {
  shopifyId: number;
  handle?: string;
  title?: string;
  content?: string;
}

interface BlogInput {
  shopifyId: number;
  handle?: string;
  title?: string;
  posts?: Array<{
    shopifyId: number;
    handle?: string;
    title?: string;
    content?: string;
    author?: string;
    image?: { src?: string };
  }>;
}

interface DiscountInput {
  shopifyId: number;
  title: string;
  code?: string; // Only for code discounts
  value: string;
  appliesTo?: string;
  startsAt: string;
  endsAt?: string;
  status?: string;
}

interface ShopifySyncBody {
  fullSync?: boolean;
  data?: {
    shop?: any;
    products?: ShopifyProductInput[];
    pages?: PageInput[];
    blogs?: BlogInput[];
    discounts?: {
      automaticDiscounts?: DiscountInput[];
      codeDiscounts?: DiscountInput[];
    };
  };
}

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  console.log("=== Starting Shopify Sync (All Upserts, No Full Deletes) ===");
  console.log("DATABASE_URL in production =>", process.env.DATABASE_URL);

  try {
    await prismaWithPool.$connect();
    console.log("Database connection established");

    // Authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return cors(
        request,
        NextResponse.json(
          { error: "Missing or invalid authorization header" },
          { status: 401 }
        )
      );
    }
    const accessKey = authHeader.split(" ")[1];

    // Find website by access key
    const website = await prismaWithPool.website.findFirst({
      where: { accessKeys: { some: { key: accessKey } } },
    });
    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Website not found" }, { status: 404 })
      );
    }
    console.log(
      "Website found =>",
      website.id,
      website.name,
      website.url,
      "Plan:",
      website.plan
    );

    // Parse request
    let body: ShopifySyncBody;
    try {
      const rawBody = await request.text();
      console.log("Raw request body:", rawBody);
      body = JSON.parse(rawBody) as ShopifySyncBody;
      console.log("Parsed request body:", body);
    } catch (err) {
      return cors(
        request,
        NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        )
      );
    }

    // Now we properly grab data from body.data rather than top-level body
    const dataBody = body.data || {};
    const {
      products = [],
      pages = [],
      blogs = [],
      discounts = { automaticDiscounts: [], codeDiscounts: [] },
    } = dataBody;

    // Just in case you need to check fullSync:
    const isFullSync = !!body.fullSync;
    console.log("fullSync? =>", isFullSync);

    //----------------------------------------------------------------------
    // (A) Upsert PRODUCTS in Chunks
    //----------------------------------------------------------------------
    if (products.length > 0) {
      console.log(`Processing ${products.length} total product(s)`);
      const productChunks = chunkArray<ShopifyProductInput>(products, 10);
      for (const chunk of productChunks) {
        console.log(`Processing product chunk of size: ${chunk.length}`);
        await prismaWithPool.$transaction(
          async (tx) => {
            for (const product of chunk) {
              console.log("Upserting product =>", {
                shopifyId: product.shopifyId,
                title: product.title,
              });

              const upsertedProduct = await tx.shopifyProduct.upsert({
                where: {
                  websiteId_shopifyId: {
                    websiteId: website.id,
                    shopifyId: BigInt(product.shopifyId),
                  },
                },
                create: {
                  websiteId: website.id,
                  shopifyId: BigInt(product.shopifyId),
                  title: product.title ?? "",
                  handle: product.handle ?? "",
                  vendor: product.vendor ?? "",
                  productType: product.productType ?? "",
                  description: product.description ?? "",
                },
                update: {
                  title: product.title ?? "",
                  handle: product.handle ?? "",
                  vendor: product.vendor ?? "",
                  productType: product.productType ?? "",
                  description: product.description ?? "",
                },
              });

              // Delete old variants/media
              await tx.shopifyProductVariant.deleteMany({
                where: { productId: upsertedProduct.id },
              });
              await tx.shopifyMedia.deleteMany({
                where: { productId: upsertedProduct.id },
              });

              // Create new variants
              if (Array.isArray(product.variants)) {
                console.log(
                  `  Creating ${product.variants.length} variants for product ${product.shopifyId}`
                );
                await tx.shopifyProductVariant.createMany({
                  data: product.variants.map((variant) => ({
                    productId: upsertedProduct.id,
                    shopifyId: BigInt(variant.shopifyId),
                    title: variant.title ?? "",
                    price: parseFloat(String(variant.price)) || 0,
                    sku: variant.sku ?? null,
                    inventory: variant.inventory ?? null,
                  })),
                  skipDuplicates: true,
                });
              }

              // Create new images
              if (Array.isArray(product.images)) {
                console.log(
                  `  Creating ${product.images.length} images for product ${product.shopifyId}`
                );
                await tx.shopifyMedia.createMany({
                  data: product.images.map((img) => ({
                    productId: upsertedProduct.id,
                    shopifyId: BigInt(img.shopifyId),
                    url: img.url || img.src || "",
                    altText: img.altText || img.alt || null,
                  })),
                  skipDuplicates: true,
                });
              }
            }
          },
          { timeout: 30000 }
        );
      }
    } else {
      console.log("No products to upsert.");
    }

    //----------------------------------------------------------------------
    // (B) Upsert PAGES
    //----------------------------------------------------------------------
    if (pages.length > 0) {
      console.log(`Processing ${pages.length} page(s)`);
      // Deduplicate by shopifyId
      const uniquePagesMap = new Map<number, PageInput>();
      for (const p of pages) {
        uniquePagesMap.set(p.shopifyId, p);
      }
      const uniquePages = Array.from(uniquePagesMap.values());

      // Optionally chunk them if large
      const pageChunks = chunkArray<PageInput>(uniquePages, 10);
      for (const chunk of pageChunks) {
        for (const page of chunk) {
          console.log("Upserting page =>", {
            shopifyId: page.shopifyId,
            title: page.title,
          });
          try {
            await prismaWithPool.$transaction(
              async (tx) => {
                await tx.shopifyPage.upsert({
                  where: {
                    websiteId_shopifyId: {
                      websiteId: website.id,
                      shopifyId: page.shopifyId,
                    },
                  },
                  create: {
                    websiteId: website.id,
                    shopifyId: page.shopifyId,
                    handle: page.handle ?? "",
                    title: page.title ?? "",
                    content: page.content ?? "",
                  },
                  update: {
                    handle: page.handle ?? "",
                    title: page.title ?? "",
                    content: page.content ?? "",
                  },
                });
              },
              { timeout: 30000 }
            );
          } catch (err: any) {
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === "P2002"
            ) {
              console.warn(
                "P2002 conflict on page ",
                page.shopifyId,
                "– retrying update..."
              );
              await prismaWithPool.shopifyPage.updateMany({
                where: {
                  websiteId: website.id,
                  shopifyId: page.shopifyId,
                },
                data: {
                  handle: page.handle ?? "",
                  title: page.title ?? "",
                  content: page.content ?? "",
                },
              });
            } else {
              throw err; // rethrow other errors
            }
          }
        }
      }
    } else {
      console.log("No pages to upsert.");
    }

    //----------------------------------------------------------------------
    // (C) Upsert BLOGS & POSTS
    //----------------------------------------------------------------------
    if (blogs.length > 0) {
      console.log(`Processing ${blogs.length} blog(s)`);
      // Deduplicate blogs by shopifyId
      const uniqueBlogsMap = new Map<number, BlogInput>();
      for (const b of blogs) {
        uniqueBlogsMap.set(b.shopifyId, b);
      }
      const uniqueBlogs = Array.from(uniqueBlogsMap.values());

      for (const blog of uniqueBlogs) {
        console.log("Upserting blog =>", {
          shopifyId: blog.shopifyId,
          title: blog.title,
        });
        try {
          await prismaWithPool.$transaction(
            async (tx) => {
              const upsertedBlog = await tx.shopifyBlog.upsert({
                where: {
                  websiteId_shopifyId: {
                    websiteId: website.id,
                    shopifyId: blog.shopifyId,
                  },
                },
                create: {
                  websiteId: website.id,
                  shopifyId: blog.shopifyId,
                  handle: blog.handle ?? "",
                  title: blog.title ?? "",
                },
                update: {
                  handle: blog.handle ?? "",
                  title: blog.title ?? "",
                },
              });

              // Handle posts for this blog
              if (Array.isArray(blog.posts)) {
                console.log(
                  `  Creating or updating ${blog.posts.length} post(s) for blog ${blog.shopifyId}`
                );
                for (const post of blog.posts) {
                  console.log("   Upserting blog post =>", {
                    shopifyId: post.shopifyId,
                    title: post.title,
                  });
                  await tx.shopifyBlogPost.upsert({
                    where: {
                      websiteId_shopifyId: {
                        websiteId: website.id,
                        shopifyId: post.shopifyId,
                      },
                    },
                    create: {
                      websiteId: website.id,
                      blogId: upsertedBlog.id,
                      shopifyId: post.shopifyId,
                      handle: post.handle ?? "",
                      title: post.title ?? "",
                      content: post.content ?? "",
                      author: post.author ?? "",
                      image: post.image?.src ?? null,
                    },
                    update: {
                      handle: post.handle ?? "",
                      title: post.title ?? "",
                      content: post.content ?? "",
                      author: post.author ?? "",
                      image: post.image?.src ?? null,
                    },
                  });
                }
              }
            },
            { timeout: 30000 }
          );
        } catch (err: any) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            console.warn(
              "P2002 conflict on blog",
              blog.shopifyId,
              "– retrying update..."
            );
            // Retry with direct update
            const existingBlog = await prismaWithPool.shopifyBlog.findFirst({
              where: {
                websiteId: website.id,
                shopifyId: blog.shopifyId,
              },
            });
            if (existingBlog) {
              // Update blog
              await prismaWithPool.shopifyBlog.update({
                where: { id: existingBlog.id },
                data: {
                  handle: blog.handle ?? "",
                  title: blog.title ?? "",
                },
              });
              // Update posts
              if (Array.isArray(blog.posts)) {
                for (const post of blog.posts) {
                  console.log("   Upserting blog post =>", {
                    shopifyId: post.shopifyId,
                    title: post.title,
                  });
                  await prismaWithPool.shopifyBlogPost.upsert({
                    where: {
                      websiteId_shopifyId: {
                        websiteId: website.id,
                        shopifyId: post.shopifyId,
                      },
                    },
                    create: {
                      websiteId: website.id,
                      blogId: existingBlog.id,
                      shopifyId: post.shopifyId,
                      handle: post.handle ?? "",
                      title: post.title ?? "",
                      content: post.content ?? "",
                      author: post.author ?? "",
                      image: post.image?.src ?? null,
                    },
                    update: {
                      handle: post.handle ?? "",
                      title: post.title ?? "",
                      content: post.content ?? "",
                      author: post.author ?? "",
                      image: post.image?.src ?? null,
                    },
                  });
                }
              }
            }
          } else {
            throw err;
          }
        }
      }
    } else {
      console.log("No blogs to upsert.");
    }

    //----------------------------------------------------------------------
    // (D) Upsert Discounts
    //----------------------------------------------------------------------
    const { automaticDiscounts = [], codeDiscounts = [] } = discounts;
    const allDiscounts = [
      ...(automaticDiscounts || []).map((d) => ({ ...d, type: "automatic" })),
      ...(codeDiscounts || []).map((d) => ({ ...d, type: "code" })),
    ];

    if (allDiscounts.length > 0) {
      console.log(`Processing ${allDiscounts.length} discount(s)`);
      for (const discount of allDiscounts) {
        console.log("Upserting discount =>", {
          shopifyId: discount.shopifyId,
          title: discount.title,
          code: discount.code,
          type: discount.type,
        });
        try {
          await prismaWithPool.$transaction(
            async (tx) => {
              await tx.shopifyDiscount.upsert({
                where: {
                  websiteId_shopifyId: {
                    websiteId: website.id,
                    shopifyId: discount.shopifyId,
                  },
                },
                create: {
                  shopifyId: discount.shopifyId,
                  title: discount.title,
                  code: discount.code || null,
                  type: discount.type,
                  value: discount.value || "0",
                  appliesTo: discount.appliesTo || null,
                  startsAt: new Date(discount.startsAt),
                  endsAt: discount.endsAt ? new Date(discount.endsAt) : null,
                  status: discount.status || "ACTIVE",
                  website: {
                    connect: { id: website.id },
                  },
                },
                update: {
                  title: discount.title,
                  code: discount.code || null,
                  value: discount.value || "0",
                  appliesTo: discount.appliesTo || null,
                  startsAt: new Date(discount.startsAt),
                  endsAt: discount.endsAt ? new Date(discount.endsAt) : null,
                  status: discount.status || "ACTIVE",
                },
              });
            },
            { timeout: 30000 }
          );
        } catch (err: any) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            console.warn(
              "P2002 conflict on discount",
              discount.shopifyId,
              "– retrying update..."
            );
            await prismaWithPool.shopifyDiscount.updateMany({
              where: {
                websiteId: website.id,
                shopifyId: discount.shopifyId,
              },
              data: {
                title: discount.title,
                code: discount.code || null,
                value: discount.value || "0",
                appliesTo: discount.appliesTo || null,
                startsAt: new Date(discount.startsAt),
                endsAt: discount.endsAt ? new Date(discount.endsAt) : null,
                status: discount.status || "ACTIVE",
              },
            });
          } else {
            throw err;
          }
        }
      }
    } else {
      console.log("No discounts to upsert.");
    }

    //----------------------------------------------------------------------
    // (E) Update lastSyncedAt
    //----------------------------------------------------------------------
    console.log("Updating lastSyncedAt for website:", website.id);
    await prismaWithPool.$transaction(
      async (tx) => {
        await tx.website.update({
          where: { id: website.id },
          data: { lastSyncedAt: new Date() },
        });
      },
      { timeout: 30000 }
    );

    console.log("=== Shopify Sync Complete ===");
    return cors(
      request,
      NextResponse.json({
        success: true,
        message: "Content upserted successfully",
      })
    );
  } catch (error: any) {
    console.error("Sync error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    return cors(
      request,
      NextResponse.json({ error: "Failed to sync content" }, { status: 500 })
    );
  } finally {
    await prismaWithPool.$disconnect();
  }
}
