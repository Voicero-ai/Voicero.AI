import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Get the base URL from environment variable or default to localhost
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    console.log(`Starting website deletion process for ID: ${id}`);
    console.log(`Using base URL: ${baseUrl}`);

    // Delete vectors
    console.log("Calling vector deletion endpoint...");
    try {
      const vectorRes = await fetch("/api/websites/delete-vectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId: id }),
      });

      if (!vectorRes.ok) {
        const errorData = await vectorRes.json().catch(() => null);
        console.error("Vector deletion failed:", {
          status: vectorRes.status,
          statusText: vectorRes.statusText,
          errorData,
        });
        throw new Error(
          `Failed to delete vectors: ${vectorRes.status} ${vectorRes.statusText}`
        );
      }

      console.log("Vector deletion successful");
    } catch (vectorError) {
      console.error("Error during vector deletion:", vectorError);
      // Continue with the rest of the deletion process
      console.log("Continuing with deletion despite vector error...");
    }

    // Delete WordPress content
    console.log("Calling WordPress content deletion endpoint...");
    const wpRes = await fetch("/api/websites/delete-wordpress-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId: id }),
    });

    if (!wpRes.ok) {
      const errorData = await wpRes.json().catch(() => null);
      console.error("WordPress deletion failed:", {
        status: wpRes.status,
        statusText: wpRes.statusText,
        errorData,
      });
      throw new Error("Failed to delete WordPress content");
    }

    console.log("WordPress content deletion successful");

    // Finally delete the website
    console.log("Deleting website from database...");
    await prisma.website.delete({
      where: { id },
    });
    console.log("Website deleted successfully");

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
