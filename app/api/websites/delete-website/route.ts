import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    console.log(`Deleting website with ID: ${id}`);

    // First transaction: Delete dependent content
    await prisma.$transaction(
      async (tx) => {
        // Delete PopUpQuestions first
        await tx.popUpQuestion.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted PopUpQuestions");

        // Delete AccessKeys
        await tx.accessKey.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted AccessKeys");

        // Delete AI related content
        await tx.aiMessage.deleteMany({
          where: {
            thread: {
              websiteId: id,
            },
          },
        });
        console.log("Deleted AI Messages");

        await tx.aiThread.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted AI Threads");

        // Delete VectorDbConfig
        await tx.vectorDbConfig.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted VectorDbConfig");
      },
      {
        timeout: 10000, // 10 second timeout for first transaction
      }
    );

    // Second transaction: Delete Shopify content
    await prisma.$transaction(
      async (tx) => {
        // Delete any remaining Shopify content
        // Comments depend on blog posts
        await tx.shopifyComment.deleteMany({
          where: {
            post: {
              websiteId: id,
            },
          },
        });
        console.log("Deleted remaining Shopify comments");

        await tx.shopifyBlogPost.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted remaining Shopify blog posts");

        await tx.shopifyBlog.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted remaining Shopify blogs");

        // Delete product-related content
        await tx.shopifyReview.deleteMany({
          where: {
            product: {
              websiteId: id,
            },
          },
        });
        console.log("Deleted remaining Shopify reviews");

        await tx.shopifyMedia.deleteMany({
          where: {
            product: {
              websiteId: id,
            },
          },
        });
        console.log("Deleted remaining Shopify media");

        await tx.shopifyProductVariant.deleteMany({
          where: {
            product: {
              websiteId: id,
            },
          },
        });
        console.log("Deleted remaining Shopify product variants");

        await tx.shopifyProduct.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted remaining Shopify products");

        await tx.shopifyDiscount.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted remaining Shopify discounts");

        await tx.shopifyPage.deleteMany({
          where: { websiteId: id },
        });
        console.log("Deleted remaining Shopify pages");
      },
      {
        timeout: 10000, // 10 second timeout for second transaction
      }
    );

    // Final transaction: Delete the website itself
    await prisma.$transaction(
      async (tx) => {
        await tx.website.delete({
          where: { id },
        });
        console.log("Website deleted successfully");
      },
      {
        timeout: 5000, // 5 second timeout for final transaction
      }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error deleting website:", message);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }

    return new Response(
      JSON.stringify({
        error: "Failed to delete website",
        details: message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
