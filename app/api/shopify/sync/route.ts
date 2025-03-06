import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { cors } from "../../../../lib/cors";
import { PrismaClient, Prisma } from "@prisma/client";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import os from "os";
import { v4 as uuidv4 } from "uuid";

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

// Initialize S3 client - add after other clients
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY as string,
  },
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
  collections?: Array<{
    title: string;
    handle: string;
    description?: string;
    ruleSet?: { rules: Array<{ title: string }> };
    sortOrder?: string;
    updatedAt?: string;
  }>;
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
  type?: string; // Add this line to include type property
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
    collections?: Array<{
      title: string;
      handle: string;
      description?: string;
      ruleSet?: { rules: Array<{ title: string }> };
      sortOrder?: string;
      updatedAt?: string;
    }>;
    discounts?: {
      automaticDiscounts?: DiscountInput[];
      codeDiscounts?: DiscountInput[];
    };
  };
}

// Function to format date
function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Remove unnecessary elements to clean up the content
    $("svg").remove();
    $("style").remove();
    $('link[rel="stylesheet"]').remove();
    $("script").remove(); // Remove scripts

    // Fix any broken images to prevent issues in PDF
    $("img").each((_, img) => {
      const $img = $(img);
      const src = $img.attr("src");
      if (!src || src.startsWith("data:")) {
        $img.remove();
      }
    });

    // Get the entire body HTML content
    // This preserves all element IDs for fragment identifiers (#theID)
    const bodyContent = $("body").html() || "";

    return bodyContent;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return "";
  }
}

// Modify the uploadPdfToS3 function to return both the S3 URL and the key
async function uploadPdfToS3(
  filePath: string,
  websiteName: string,
  fileName: string
): Promise<{ url: string; key: string }> {
  try {
    // Sanitize website name for folder name (replace spaces, special chars)
    const sanitizedWebsiteName = websiteName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    // Create folder structure: shopify-reports/{website-name}/
    const key = `shopify-reports/${sanitizedWebsiteName}/${fileName}`;

    // Check if file already exists and delete it
    try {
      const listCommand = new ListObjectsCommand({
        Bucket: "voicero",
        Prefix: `shopify-reports/${sanitizedWebsiteName}/`,
      });

      const existingObjects = await s3.send(listCommand);

      if (existingObjects.Contents) {
        for (const obj of existingObjects.Contents) {
          if (obj.Key && obj.Key.endsWith(fileName)) {
            // Delete the existing file
            const deleteCommand = new DeleteObjectCommand({
              Bucket: "voicero",
              Key: obj.Key,
            });
            await s3.send(deleteCommand);
            console.log(`Deleted existing file: ${obj.Key}`);
          }
        }
      }
    } catch (error) {
      console.error("Error checking for existing files:", error);
      // Continue with upload even if check fails
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath);

    // Upload to S3
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: "voicero",
        Key: key,
        Body: fileContent,
        ContentType: "application/pdf",
      },
    });

    await upload.done();

    // Return both the S3 URL and key
    const url = `https://voicero.s3.us-east-2.amazonaws.com/${key}`;
    return { url, key };
  } catch (error) {
    console.error(`Error uploading PDF to S3: ${error}`);
    throw error;
  }
}

// New function to delete all old Shopify reports for a website
async function deleteOldShopifyReports(websiteName: string, websiteId: string) {
  try {
    console.log(`Deleting old Shopify reports for website: ${websiteName}`);

    // Sanitize website name for folder name
    const sanitizedWebsiteName = websiteName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    // Get all existing report objects in the website's folder
    const listCommand = new ListObjectsCommand({
      Bucket: "voicero",
      Prefix: `shopify-reports/${sanitizedWebsiteName}/`,
    });

    const existingObjects = await s3.send(listCommand);

    if (existingObjects.Contents && existingObjects.Contents.length > 0) {
      console.log(
        `Found ${existingObjects.Contents.length} existing report files to delete`
      );

      // Delete each object
      for (const obj of existingObjects.Contents) {
        if (obj.Key) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: "voicero",
            Key: obj.Key,
          });
          await s3.send(deleteCommand);
          console.log(`Deleted old report: ${obj.Key}`);
        }
      }
    } else {
      console.log("No existing report files found to delete");
    }

    // Also clean up database entries for this website
    try {
      // Delete all existing report links for this website from the database
      const deleteResult = await prisma.shopifyReportLink.deleteMany({
        where: {
          websiteId: websiteId,
        },
      });

      console.log(
        `Deleted ${deleteResult.count} old report links from database for website ID: ${websiteId}`
      );
    } catch (dbError) {
      console.error(`Error deleting report links from database: ${dbError}`);
      // Continue even if database deletion fails
    }

    return true;
  } catch (error) {
    console.error(`Error deleting old Shopify reports: ${error}`);
    // Don't throw error, just log and continue
    return false;
  }
}

// Add a function to save the report links to the database
async function saveReportLinksToDatabase(
  websiteId: string,
  reportLinks: { [key: string]: { url: string; key: string } }
) {
  try {
    console.log(`Saving report links to database for website ID: ${websiteId}`);

    // Create upsert operations for each report type
    const operations = [];

    for (const [reportType, linkData] of Object.entries(reportLinks)) {
      operations.push(
        prisma.shopifyReportLink.upsert({
          where: {
            websiteId_reportType: {
              websiteId,
              reportType,
            },
          },
          update: {
            s3Key: linkData.key,
            s3Url: linkData.url,
          },
          create: {
            websiteId,
            reportType,
            s3Key: linkData.key,
            s3Url: linkData.url,
          },
        })
      );
    }

    // Execute all upserts in a transaction
    const results = await prisma.$transaction(operations);
    console.log(`Saved ${results.length} report links to database`);

    return results;
  } catch (error) {
    console.error(`Error saving report links to database: ${error}`);
    throw error;
  }
}

// Add a function to extract data from the ShopifySync process and store it in the database
async function createSyncReport(
  data: ShopifySyncBody,
  websiteUrl: string,
  websiteId: string
): Promise<{
  mainReport: string;
  sectionReports: { [key: string]: string };
  s3Reports: { [key: string]: { url: string; key: string } };
}> {
  console.log("Generating PDF report...");

  // Create a timestamp for filenames
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Create a temporary directory for the report files
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `shopify-sync-${uuidv4()}-`)
  );
  console.log(`Using temporary directory: ${tempDir}`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Create fonts directory inside tempDir
  const fontDir = path.join(tempDir, "fonts");
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  // Copy OpenSans font to the temporary directory
  const srcFontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "OpenSans-Regular.ttf"
  );
  const destFontPath = path.join(fontDir, "OpenSans-Regular.ttf");
  let fontAvailable = false;

  if (fs.existsSync(srcFontPath)) {
    try {
      fs.copyFileSync(srcFontPath, destFontPath);
      console.log(`Copied font from ${srcFontPath} to ${destFontPath}`);
      // Use the temporary font directory for PDFKit
      process.env.FONTCONFIG_PATH = fontDir;
      fontAvailable = true;
    } catch (err) {
      console.error(`Error copying font: ${err}`);
    }
  } else {
    console.warn(`OpenSans font not found at path: ${srcFontPath}`);
  }

  if (!fontAvailable) {
    console.warn(
      "OpenSans font not available, PDFs will use default fonts. This may cause rendering issues."
    );
  }

  // Initialize section reports
  const sectionReports: { [key: string]: string } = {};
  const s3Reports: { [key: string]: { url: string; key: string } } = {};

  // SUPER SIMPLE: Create empty PDFs with just the right names
  const createPlaceholderPDF = (filename: string) => {
    const filepath = path.join(tempDir, filename);

    // Create a simple PDF file without using PDFKit at all
    const minimumPDFContent =
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF";

    fs.writeFileSync(filepath, minimumPDFContent);

    return {
      filepath,
      end: () => {}, // Dummy end function that does nothing
    };
  };

  // Create main report
  const mainPath = path.join(tempDir, `sync-report-${timestamp}.pdf`);
  const mainReport = createPlaceholderPDF(`sync-report-${timestamp}.pdf`);

  // Create section PDFs if needed
  if (data.data?.products && data.data.products.length > 0) {
    const productsPath = path.join(tempDir, `products-report-${timestamp}.pdf`);
    createPlaceholderPDF(`products-report-${timestamp}.pdf`);
    sectionReports.products = productsPath;
  }

  if (data.data?.pages && data.data.pages.length > 0) {
    const pagesPath = path.join(tempDir, `pages-report-${timestamp}.pdf`);
    createPlaceholderPDF(`pages-report-${timestamp}.pdf`);
    sectionReports.pages = pagesPath;
  }

  if (data.data?.blogs && data.data.blogs.length > 0) {
    const postsPath = path.join(tempDir, `posts-report-${timestamp}.pdf`);
    createPlaceholderPDF(`posts-report-${timestamp}.pdf`);
    sectionReports.posts = postsPath;
  }

  if (data.data?.collections && data.data.collections.length > 0) {
    const collectionsPath = path.join(
      tempDir,
      `collections-report-${timestamp}.pdf`
    );
    createPlaceholderPDF(`collections-report-${timestamp}.pdf`);
    sectionReports.collections = collectionsPath;
  }

  if (data.data?.discounts) {
    const discountsPath = path.join(
      tempDir,
      `discounts-report-${timestamp}.pdf`
    );
    createPlaceholderPDF(`discounts-report-${timestamp}.pdf`);
    sectionReports.discounts = discountsPath;
  }

  // Log report information
  console.log(`Created main report: ${mainPath}`);
  console.log(
    `Created section reports: ${Object.keys(sectionReports).join(", ")}`
  );

  // Extract domain from websiteUrl for folder name
  const websiteDomain = websiteUrl.replace(/^https?:\/\//, "").split("/")[0];

  // Delete all old reports for this website before uploading new ones
  await deleteOldShopifyReports(websiteDomain, websiteId);

  // Upload main report to S3
  const mainReportResult = await uploadPdfToS3(
    mainPath,
    websiteDomain,
    `sync-report-${timestamp}.pdf`
  );
  s3Reports.main = mainReportResult;

  // Upload section reports to S3
  for (const [section, reportPath] of Object.entries(sectionReports)) {
    const fileName = path.basename(reportPath);
    const fullPath = path.join(tempDir, fileName);

    if (fs.existsSync(fullPath)) {
      const s3Result = await uploadPdfToS3(fullPath, websiteDomain, fileName);
      s3Reports[section] = s3Result;
    }
  }

  // Save report links to database
  try {
    await saveReportLinksToDatabase(websiteId, s3Reports);
  } catch (error) {
    console.error("Failed to save report links to database:", error);
    // Continue even if database save fails
  }

  // Clean up temporary files
  try {
    fs.readdirSync(tempDir).forEach((file) => {
      fs.unlinkSync(path.join(tempDir, file));
    });
    fs.rmdirSync(tempDir);
    console.log(`Cleaned up temporary directory: ${tempDir}`);
  } catch (error) {
    console.error(`Error cleaning up temporary directory: ${error}`);
  }

  // For compatibility, return the same structure but with modified s3Reports
  return {
    mainReport: mainPath,
    sectionReports,
    s3Reports,
  };
}

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  // Declare variables at the top of the function
  let s3Reports: Record<string, string> = {};

  try {
    console.log("=== Starting Shopify Sync (All Upserts, No Full Deletes) ===");
    console.log("DATABASE_URL in production =>", process.env.DATABASE_URL);

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
      collections = [],
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
    // (D) Upsert Collections
    //----------------------------------------------------------------------
    if (collections.length > 0) {
      console.log(`Processing ${collections.length} collection(s)`);
      for (const collection of collections) {
        console.log("Upserting collection =>", {
          title: collection.title,
          handle: collection.handle,
        });
        try {
          await prismaWithPool.$transaction(
            async (tx) => {
              await tx.shopifyCollection.upsert({
                where: {
                  websiteId_handle: {
                    websiteId: website.id,
                    handle: collection.handle,
                  },
                },
                create: {
                  websiteId: website.id,
                  handle: collection.handle,
                  title: collection.title,
                  description: collection.description,
                  ruleSet: collection.ruleSet,
                  sortOrder: collection.sortOrder,
                  updatedAt: collection.updatedAt
                    ? new Date(collection.updatedAt)
                    : null,
                },
                update: {
                  title: collection.title,
                  description: collection.description,
                  ruleSet: collection.ruleSet,
                  sortOrder: collection.sortOrder,
                  updatedAt: collection.updatedAt
                    ? new Date(collection.updatedAt)
                    : null,
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
              "P2002 conflict on collection",
              collection.handle,
              "– retrying update..."
            );
            await prismaWithPool.shopifyCollection.updateMany({
              where: {
                websiteId: website.id,
                handle: collection.handle,
              },
              data: {
                title: collection.title,
                description: collection.description,
                ruleSet: collection.ruleSet,
                sortOrder: collection.sortOrder,
                updatedAt: collection.updatedAt
                  ? new Date(collection.updatedAt)
                  : null,
              },
            });
          } else {
            throw err;
          }
        }
      }
    } else {
      console.log("No collections to upsert.");
    }

    //----------------------------------------------------------------------
    // (E) Upsert Discounts
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
    // (F) Update lastSyncedAt
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

    //----------------------------------------------------------------------
    // Generate PDF Report
    //----------------------------------------------------------------------
    console.log("Generating PDF report...");
    try {
      // Pass website.id to createSyncReport
      const result = await createSyncReport(body, website.url, website.id);
      console.log("PDF report generated successfully");

      // Store S3 report URLs (now they're objects with url and key)
      s3Reports = {};
      for (const [reportType, reportData] of Object.entries(result.s3Reports)) {
        s3Reports[reportType] = reportData.url;
      }

      // Log all the PDFs for verification
      console.log("All generated PDFs:");
      console.log("S3 reports:", Object.keys(s3Reports).join(", "));

      // Return success with all S3 PDF links
      return NextResponse.json({
        success: true,
        report: {
          main: s3Reports.main,
          sections: {
            products: s3Reports.products,
            pages: s3Reports.pages,
            blogs: s3Reports.blogs,
            collections: s3Reports.collections,
            discounts: s3Reports.discounts,
          },
        },
      });
    } catch (error: any) {
      console.error("Error generating PDF report:", {
        message: error.message,
        stack: error.stack,
      });
      // Continue with the response even if PDF generation fails
      s3Reports = {};
    }

    // If we get here, something failed but we still want to return a response
    console.log("=== Shopify Sync Complete ===");
    return cors(
      request,
      NextResponse.json({
        success: true,
        message:
          "Content upserted successfully, but PDF generation may have failed",
        reports: s3Reports,
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
      NextResponse.json(
        {
          error: "Failed to sync content",
          reports: s3Reports,
        },
        { status: 500 }
      )
    );
  } finally {
    await prismaWithPool.$disconnect();
  }
}
