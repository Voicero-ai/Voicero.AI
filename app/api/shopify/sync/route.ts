import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cors } from "@/lib/cors";
import { PrismaClient, Prisma } from "@prisma/client";

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
  products?: ShopifyProductInput[];
  pages?: PageInput[];
  blogs?: BlogInput[];
  discounts?: {
    automaticDiscounts?: DiscountInput[];
    codeDiscounts?: DiscountInput[];
  };
}

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  console.log("=== Starting Shopify Sync (All Upserts, No Full Deletes) ===");
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

    // Find website
    const website = await prismaWithPool.website.findFirst({
      where: { accessKeys: { some: { key: accessKey } } },
    });
    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Website not found" }, { status: 404 })
      );
    }

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

    const {
      products = [],
      pages = [],
      blogs = [],
      discounts = { automaticDiscounts: [], codeDiscounts: [] },
    } = body;

    //----------------------------------------------------------------------
    // (A) Upsert PRODUCTS in Chunks
    //----------------------------------------------------------------------
    const productChunks = chunkArray<ShopifyProductInput>(products, 10);

    for (const chunk of productChunks) {
      await prismaWithPool.$transaction(
        async (tx) => {
          for (const product of chunk) {
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

            // delete old variants/media
            await tx.shopifyProductVariant.deleteMany({
              where: { productId: upsertedProduct.id },
            });
            await tx.shopifyMedia.deleteMany({
              where: { productId: upsertedProduct.id },
            });

            // create new variants
            if (Array.isArray(product.variants)) {
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

            // create new images
            if (Array.isArray(product.images)) {
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

    //----------------------------------------------------------------------
    // (B) Upsert PAGES, each in its own transaction, catching P2002
    //----------------------------------------------------------------------
    if (pages.length > 0) {
      // Deduplicate by shopifyId
      const uniquePagesMap = new Map<number, PageInput>();
      for (const p of pages) {
        uniquePagesMap.set(p.shopifyId, p);
      }
      const uniquePages = Array.from(uniquePagesMap.values());

      // Optionally chunk them if large
      const pageChunks = chunkArray<PageInput>(uniquePages, 10);

      for (const chunk of pageChunks) {
        // Instead of a single transaction for the whole chunk,
        // do each page in its own transaction to avoid collisions:
        for (const page of chunk) {
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
            // Catch unique constraint errors
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === "P2002"
            ) {
              console.warn(
                "P2002 conflict on page ",
                page.shopifyId,
                "– retrying update..."
              );
              // Possibly do an .update() call here, or just skip
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
    }

    //----------------------------------------------------------------------
    // (C) Upsert BLOGS & POSTS, each blog in its own transaction
    //----------------------------------------------------------------------
    if (blogs.length > 0) {
      // Deduplicate blogs by shopifyId
      const uniqueBlogsMap = new Map<number, BlogInput>();
      for (const b of blogs) {
        uniqueBlogsMap.set(b.shopifyId, b);
      }
      const uniqueBlogs = Array.from(uniqueBlogsMap.values());

      // Process each blog in its own transaction
      for (const blog of uniqueBlogs) {
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
                for (const post of blog.posts) {
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
          // Handle unique constraint errors
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
            throw err; // rethrow other errors
          }
        }
      }
    }

    //----------------------------------------------------------------------
    // (D) Upsert Discounts
    //----------------------------------------------------------------------
    if (
      (discounts?.automaticDiscounts?.length ?? 0) > 0 ||
      (discounts?.codeDiscounts?.length ?? 0) > 0
    ) {
      const allDiscounts = [
        ...(discounts?.automaticDiscounts || []).map((d) => ({
          ...d,
          type: "automatic",
        })),
        ...(discounts?.codeDiscounts || []).map((d) => ({
          ...d,
          type: "code",
        })),
      ];

      for (const discount of allDiscounts) {
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
          // Handle unique constraint errors
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
    }

    //----------------------------------------------------------------------
    // (D) Update lastSyncedAt
    //----------------------------------------------------------------------
    await prismaWithPool.$transaction(
      async (tx) => {
        await tx.website.update({
          where: { id: website.id },
          data: { lastSyncedAt: new Date() },
        });
      },
      { timeout: 30000 }
    );

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
