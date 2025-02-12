import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get the base URL from environment variable or default to localhost
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    // Delete vectors
    const vectorRes = await fetch(`${baseUrl}/api/websites/delete-vectors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId: id }),
    });
    if (!vectorRes.ok) throw new Error("Failed to delete vectors");

    // Delete WordPress content
    const wpRes = await fetch(
      `${baseUrl}/api/websites/delete-wordpress-content`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId: id }),
      }
    );
    if (!wpRes.ok) throw new Error("Failed to delete WordPress content");

    // Finally delete the website
    await prisma.website.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error deleting website:", message);

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
