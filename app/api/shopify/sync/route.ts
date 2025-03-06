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
import { PDFDocument as PDFLibDocument, StandardFonts } from "pdf-lib";

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
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Create temp directory for report files
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `shopify-reports-${uuidv4()}`)
  );

  // Initialize section reports
  const sectionReports: { [key: string]: string } = {};
  const s3Reports: { [key: string]: { url: string; key: string } } = {};

  // Create main report file
  const mainPath = path.join(tempDir, `sync-report-${timestamp}.pdf`);

  // Replace the createPDFReport function with a direct PDF creation approach
  const createPDFReport = (
    filePath: string,
    reportType: string,
    reportData: any
  ) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log(`Starting PDF generation for ${reportType} report`);
        const fullPath = path.join(tempDir, filePath);

        // Helper function to strip HTML tags
        const stripHtml = (html: string | null | undefined): string => {
          if (!html) return "N/A";
          return html.replace(/<[^>]*>?/gm, " ").trim();
        };

        // Create content for the PDF based on report type
        let content = `Shopify ${reportType} Report\n\n`;
        content += `Generated: ${new Date().toLocaleString()}\n\n`;

        // Add shop information if it exists
        if (data.data?.shop) {
          content += "Shop Information:\n";
          content += `Name: ${data.data.shop.name || "N/A"}\n`;
          content += `Email: ${data.data.shop.email || "N/A"}\n`;
          content += `Domain: ${data.data.shop.primaryDomain?.url || "N/A"}\n`;
          content += `Currency: ${data.data.shop.currencyCode || "N/A"}\n`;
          content += `Timezone: ${
            data.data.shop.timezoneAbbreviation || "N/A"
          }\n\n`;
        }

        // Log content generation start
        console.log(`Generating content for ${reportType} report...`);

        // Based on report type, add specific content
        switch (reportType.toLowerCase()) {
          case "main":
            // Add summary information
            content += "Sync Summary:\n";

            const productCount = data.data?.products?.length || 0;
            const pageCount = data.data?.pages?.length || 0;
            const blogCount = data.data?.blogs?.length || 0;
            const collectionCount = data.data?.collections?.length || 0;
            const discountCount =
              (data.data?.discounts?.automaticDiscounts?.length || 0) +
              (data.data?.discounts?.codeDiscounts?.length || 0);

            content += `Products: ${productCount}\n`;
            content += `Pages: ${pageCount}\n`;
            content += `Blogs: ${blogCount}\n`;
            content += `Collections: ${collectionCount}\n`;
            content += `Discounts: ${discountCount}\n\n`;

            content += "See individual reports for detailed information.\n";
            break;

          case "products":
            if (data.data?.products && data.data.products.length > 0) {
              content += `Products (${data.data.products.length}):\n\n`;

              // List all products
              data.data.products.forEach((product, index) => {
                content += `${index + 1}. ${
                  product.title || "Untitled Product"
                }\n`;
                content += `   Handle: ${product.handle || "N/A"}\n`;
                content += `   Vendor: ${product.vendor || "N/A"}\n`;
                content += `   Type: ${product.productType || "N/A"}\n`;

                // Product description
                if (product.description) {
                  const cleanDescription = stripHtml(product.description);
                  content += `   Description: ${cleanDescription.substring(
                    0,
                    200
                  )}${cleanDescription.length > 200 ? "..." : ""}\n`;
                }

                // Variants
                if (product.variants && product.variants.length > 0) {
                  content += `   Variants: ${product.variants.length}\n`;
                  product.variants.forEach((variant) => {
                    content += `     - ${variant.title || "Default"}: $${
                      variant.price || "0.00"
                    } (SKU: ${variant.sku || "N/A"}, Inventory: ${
                      variant.inventory !== undefined
                        ? variant.inventory
                        : "N/A"
                    })\n`;
                  });
                }

                // Collections
                if (product.collections && product.collections.length > 0) {
                  content += `   Collections: ${product.collections
                    .map((c) => c.title)
                    .join(", ")}\n`;
                }

                content += "\n";
              });
            } else {
              content += "No products found.\n";
            }
            break;

          case "pages":
            if (data.data?.pages && data.data.pages.length > 0) {
              content += `Pages (${data.data.pages.length}):\n\n`;

              // List all pages
              data.data.pages.forEach((page, index) => {
                content += `${index + 1}. ${page.title || "Untitled Page"}\n`;
                content += `   Handle: ${page.handle || "N/A"}\n`;

                // Add content preview (limited to avoid overwhelming the PDF)
                if (page.content) {
                  content += "   Content Preview:\n";
                  // Strip HTML tags for readable text
                  const contentPreview = stripHtml(page.content).substring(
                    0,
                    200
                  );
                  content += `   ${contentPreview}${
                    page.content.length > 200 ? "..." : ""
                  }\n`;
                }

                content += "\n";
              });
            } else {
              content += "No pages found.\n";
            }
            break;

          case "blogs":
            if (data.data?.blogs && data.data.blogs.length > 0) {
              content += `Blogs (${data.data.blogs.length}):\n\n`;

              // List all blogs
              data.data.blogs.forEach((blog, index) => {
                content += `${index + 1}. ${blog.title || "Untitled Blog"}\n`;
                content += `   Handle: ${blog.handle || "N/A"}\n`;

                // Blog posts
                if (blog.posts && blog.posts.length > 0) {
                  content += `   Posts (${blog.posts.length}):\n`;
                  blog.posts.forEach((post) => {
                    content += `     - ${post.title || "Untitled Post"} by ${
                      post.author || "Unknown"
                    }\n`;

                    // Add content preview (limited to avoid overwhelming the PDF)
                    if (post.content) {
                      // Strip HTML tags for readable text
                      const contentPreview = stripHtml(post.content).substring(
                        0,
                        100
                      );
                      content += `       ${contentPreview}${
                        post.content.length > 100 ? "..." : ""
                      }\n`;
                    }
                  });
                } else {
                  content += "   No posts found in this blog.\n";
                }

                content += "\n";
              });
            } else {
              content += "No blogs found.\n";
            }
            break;

          case "collections":
            if (data.data?.collections && data.data.collections.length > 0) {
              content += `Collections (${data.data.collections.length}):\n\n`;

              // List all collections
              data.data.collections.forEach((collection, index) => {
                content += `${index + 1}. ${
                  collection.title || "Untitled Collection"
                }\n`;
                content += `   Handle: ${collection.handle || "N/A"}\n`;
                content += `   Sort Order: ${collection.sortOrder || "N/A"}\n`;
                content += `   Updated At: ${collection.updatedAt || "N/A"}\n`;

                // Collection description
                if (collection.description) {
                  content += `   Description: ${collection.description}\n`;
                }

                // Products in collection - only if available from the API
                if (
                  "products" in collection &&
                  Array.isArray(collection.products) &&
                  collection.products.length > 0
                ) {
                  content += `   Products in Collection: ${collection.products.length}\n`;
                  (collection.products as any[]).forEach((product) => {
                    content += `     - ${
                      product.title || "Untitled Product"
                    } (${product.handle || "no-handle"})\n`;
                  });
                }

                // Rule-based collection
                if (collection.ruleSet && collection.ruleSet.rules) {
                  content += "   Collection Rules:\n";
                  collection.ruleSet.rules.forEach((rule) => {
                    if (
                      "column" in rule &&
                      "condition" in rule &&
                      "relation" in rule
                    ) {
                      content += `     - ${rule.column} ${rule.relation} ${rule.condition}\n`;
                    }
                  });
                }

                content += "\n";
              });
            } else {
              content += "No collections found.\n";
            }
            break;

          case "discounts":
            const automaticDiscounts =
              data.data?.discounts?.automaticDiscounts || [];
            const codeDiscounts = data.data?.discounts?.codeDiscounts || [];

            if (automaticDiscounts.length > 0 || codeDiscounts.length > 0) {
              content += "Discounts:\n\n";

              // Automatic discounts
              if (automaticDiscounts.length > 0) {
                content += `Automatic Discounts (${automaticDiscounts.length}):\n`;

                automaticDiscounts.forEach((discount, index) => {
                  content += `${index + 1}. ${
                    discount.title || "Untitled Discount"
                  }\n`;
                  content += `   Type: ${discount.type || "N/A"}\n`;
                  content += `   Value: ${discount.value || "N/A"}\n`;
                  content += `   Applies To: ${discount.appliesTo || "N/A"}\n`;
                  content += `   Start Date: ${discount.startsAt || "N/A"}\n`;
                  content += `   End Date: ${discount.endsAt || "N/A"}\n`;
                  content += `   Status: ${discount.status || "N/A"}\n\n`;
                });
              }

              // Code discounts
              if (codeDiscounts.length > 0) {
                content += `Code Discounts (${codeDiscounts.length}):\n`;

                codeDiscounts.forEach((discount, index) => {
                  content += `${index + 1}. ${
                    discount.title || "Untitled Discount"
                  }\n`;
                  content += `   Code: ${discount.code || "N/A"}\n`;
                  content += `   Type: ${discount.type || "N/A"}\n`;
                  content += `   Value: ${discount.value || "N/A"}\n`;
                  content += `   Applies To: ${discount.appliesTo || "N/A"}\n`;
                  content += `   Start Date: ${discount.startsAt || "N/A"}\n`;
                  content += `   End Date: ${discount.endsAt || "N/A"}\n`;
                  content += `   Status: ${discount.status || "N/A"}\n\n`;
                });
              }
            } else {
              content += "No discounts found.\n";
            }
            break;
        }

        // Log a preview of the content
        console.log(
          `Generated content for ${reportType} (first 200 chars): ${content.substring(
            0,
            200
          )}...`
        );
        console.log(
          `Total content length: ${content.length} characters, ${
            content.split("\n").length
          } lines`
        );

        // Create a text file with the content for debugging
        const textFilePath = path.join(tempDir, `${reportType}-content.txt`);
        fs.writeFileSync(textFilePath, content);

        // Create PDF with pdf-lib
        console.log(`Creating PDF with pdf-lib for ${reportType}...`);
        const pdfDoc = await PDFLibDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter size

        // Embed the standard Courier font
        const font = await pdfDoc.embedFont(StandardFonts.Courier);
        const fontSize = 10;
        const lineHeight = fontSize * 1.2;
        const maxWidth = 500; // Maximum width for text before wrapping

        // Function to wrap text
        const wrapText = (text: string): string[] => {
          // If text is empty or just whitespace, return as is
          if (!text.trim()) return [text];

          const words = text.split(" ");
          const lines: string[] = [];
          let currentLine = "";

          for (const word of words) {
            // Test if adding this word exceeds the max width
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, fontSize);

            if (width > maxWidth && currentLine) {
              // Line would be too long, push current line and start a new one
              lines.push(currentLine);
              currentLine = word;
            } else {
              // Add word to current line
              currentLine = testLine;
            }
          }

          // Add the final line
          if (currentLine) {
            lines.push(currentLine);
          }

          return lines;
        };

        // Process input content and create wrapped lines
        const wrappedLines: string[] = [];
        const inputLines = content.split("\n");

        for (const line of inputLines) {
          if (!line.trim()) {
            // Keep empty lines as is
            wrappedLines.push("");
          } else {
            // Wrap the line and add resulting lines
            wrappedLines.push(...wrapText(line));
          }
        }

        // Draw wrapped lines to PDF
        let y = 750; // Start position from top
        let currentPage = page;

        for (const line of wrappedLines) {
          if (y < 50) {
            // Add a new page if we're at the bottom
            currentPage = pdfDoc.addPage([612, 792]);
            y = 750; // Reset y position for new page
          }

          currentPage.drawText(line, {
            x: 50,
            y: y,
            font: font,
            size: fontSize,
          });

          y -= lineHeight;
        }

        // Save the PDF to a file
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(fullPath, pdfBytes);

        const stats = fs.statSync(fullPath);
        console.log(
          `Created ${reportType} PDF report at ${fullPath} (${stats.size} bytes)`
        );

        resolve();
      } catch (error) {
        console.error(`Error creating ${reportType} PDF report:`, error);
        // Create minimal valid PDF as fallback
        console.log(`Falling back to minimal PDF for ${reportType}`);
        createMinimalPDF(path.join(tempDir, filePath))
          .then(resolve)
          .catch(reject);
      }
    });
  };

  // Fallback function to create a minimal valid PDF if the main function fails
  const createMinimalPDF = (filePath: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Create a minimal valid PDF using pdf-lib
        console.log(`Creating minimal PDF at ${filePath}...`);
        const pdfDoc = await PDFLibDocument.create();
        pdfDoc.addPage([612, 792]); // Letter size

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, pdfBytes);

        console.log(`Created minimal PDF at ${filePath}`);
        resolve();
      } catch (error) {
        console.error("Error creating minimal PDF:", error);
        reject(error);
      }
    });
  };

  // Create main report
  await createPDFReport(`sync-report-${timestamp}.pdf`, "main", data);

  // Create section reports based on available data
  if (data.data?.products) {
    const productsPath = path.join(tempDir, `products-report-${timestamp}.pdf`);
    await createPDFReport(`products-report-${timestamp}.pdf`, "products", data);
    sectionReports.products = productsPath;
  }

  if (data.data?.pages) {
    const pagesPath = path.join(tempDir, `pages-report-${timestamp}.pdf`);
    await createPDFReport(`pages-report-${timestamp}.pdf`, "pages", data);
    sectionReports.pages = pagesPath;
  }

  if (data.data?.blogs) {
    const postsPath = path.join(tempDir, `posts-report-${timestamp}.pdf`);
    await createPDFReport(`posts-report-${timestamp}.pdf`, "blogs", data);
    sectionReports.posts = postsPath;
  }

  // Add discounts report if discount data is available
  if (
    (data.data?.discounts?.automaticDiscounts?.length || 0) > 0 ||
    (data.data?.discounts?.codeDiscounts?.length || 0) > 0
  ) {
    const discountsPath = path.join(
      tempDir,
      `discounts-report-${timestamp}.pdf`
    );
    await createPDFReport(
      `discounts-report-${timestamp}.pdf`,
      "discounts",
      data
    );
    sectionReports.discounts = discountsPath;
  }

  if (data.data?.collections) {
    const collectionsPath = path.join(
      tempDir,
      `collections-report-${timestamp}.pdf`
    );
    await createPDFReport(
      `collections-report-${timestamp}.pdf`,
      "collections",
      data
    );
    sectionReports.collections = collectionsPath;
  }

  // Extract domain from websiteUrl for folder name
  const websiteDomain = websiteUrl.replace(/^https?:\/\//, "").split("/")[0];

  // Delete all old reports for this website before uploading new ones
  await deleteOldShopifyReports(websiteDomain, websiteId);

  // Upload main report to S3
  try {
    const mainFilePath = path.join(tempDir, `sync-report-${timestamp}.pdf`);
    if (fs.existsSync(mainFilePath)) {
      const mainReportResult = await uploadPdfToS3(
        mainFilePath,
        websiteDomain,
        `sync-report-${timestamp}.pdf`
      );
      s3Reports.main = mainReportResult;
    } else {
      console.error(`Main report file not found at ${mainFilePath}`);
    }
  } catch (error) {
    console.error("Error uploading main report:", error);
  }

  // Upload section reports to S3
  for (const [section, reportPath] of Object.entries(sectionReports)) {
    try {
      if (fs.existsSync(reportPath)) {
        const fileName = path.basename(reportPath);
        const s3Result = await uploadPdfToS3(
          reportPath,
          websiteDomain,
          fileName
        );
        s3Reports[section] = s3Result;
      } else {
        console.error(`Section report file not found at ${reportPath}`);
      }
    } catch (error) {
      console.error(`Error uploading ${section} report:`, error);
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
            blogs: s3Reports.posts,
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
