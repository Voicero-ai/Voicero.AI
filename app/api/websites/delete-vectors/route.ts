import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const index = pinecone.index(process.env.PINECONE_INDEX!);

export async function POST(request: Request) {
  try {
    const { websiteId } = await request.json();

    // Check vector config
    const vectorConfig = await prisma.vectorDbConfig.findUnique({
      where: { websiteId },
    });

    if (!vectorConfig) {
      console.log(`No vector configuration found for website ${websiteId}`);
      return Response.json({ success: true });
    }

    // Delete from default namespace
    const defaultQuery = await index.query({
      vector: Array(3072).fill(0),
      topK: 100,
      filter: { websiteId: { $eq: websiteId } },
      includeMetadata: true,
    });

    if (defaultQuery.matches.length > 0) {
      await index.deleteMany(defaultQuery.matches.map((m) => m.id));
      console.log(`Deleted ${defaultQuery.matches.length} legacy vectors`);
    }

    // Delete from website namespace
    await index.namespace(websiteId).deleteAll();
    console.log(`Deleted vectors from namespace ${websiteId}`);

    // Delete vector config
    await prisma.vectorDbConfig.delete({
      where: { websiteId },
    });

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error deleting vectors:", message);

    return new Response(
      JSON.stringify({
        error: "Failed to delete vectors",
        details: message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
