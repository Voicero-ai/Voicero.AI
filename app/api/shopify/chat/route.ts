import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cors } from "@/lib/cors";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAI } from "openai";
import { pinecone } from "@/lib/pinecone";

const prisma = new PrismaClient();
const openai = new OpenAI();

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return cors(request, response);
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Shopify chat request received");

    // Get the authorization header
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

    // Extract the access key
    const accessKey = authHeader.split(" ")[1];
    if (!accessKey) {
      return cors(
        request,
        NextResponse.json({ error: "No access key provided" }, { status: 401 })
      );
    }

    // Get request body and website lookup with vector config
    const [
      { message, url, type, source, threadId: incomingThreadId, chatHistory },
      website,
    ] = await Promise.all([
      request.json(),
      prisma.website.findFirst({
        where: {
          accessKeys: {
            some: {
              key: accessKey,
            },
          },
        },
        select: {
          id: true,
          aiAssistantId: true,
          aiVoiceAssistantId: true,
          monthlyQueries: true,
          queryLimit: true,
          plan: true,
          VectorDbConfig: true,
        },
      }),
    ]);

    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    // Check query limits
    if (website.monthlyQueries >= website.queryLimit) {
      return cors(
        request,
        NextResponse.json(
          {
            error: "Monthly query limit exceeded",
            details: {
              currentQueries: website.monthlyQueries,
              limit: website.queryLimit,
              plan: website.plan,
            },
          },
          { status: 429 }
        )
      );
    }

    // Extract handle from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const handle = pathParts[pathParts.length - 1];

    // Search for matching content in parallel
    const [page, product, blogPost] = await Promise.all([
      prisma.shopifyPage.findFirst({
        where: { websiteId: website.id, handle },
      }),
      prisma.shopifyProduct.findFirst({
        where: { websiteId: website.id, handle },
      }),
      prisma.shopifyBlogPost.findFirst({
        where: { websiteId: website.id, handle },
      }),
    ]);

    // Determine content based on what was found
    let pageContent = "";
    if (page) {
      pageContent = page.content;
    } else if (product) {
      pageContent = product.description;
    } else if (blogPost) {
      pageContent = blogPost.content;
    }

    // Initialize embeddings and vector store
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: website.VectorDbConfig?.namespace || website.id,
    });

    // Get relevant content from vector store
    const searchResults = await vectorStore.similaritySearch(message, 2);

    // Build context message
    const contextMessage = `Current URL: ${url}
${pageContent ? "Current page content: " + pageContent : ""}

Relevant content:
${searchResults
  .map((doc) => {
    const metadata = doc.metadata;
    if (metadata.type === "product") {
      return `Product: ${metadata.title}
Description: ${metadata.description}
Price: ${JSON.parse(metadata.variants)[0].price}
Handle: ${metadata.handle}

Type: ${metadata.productType}
Vendor: ${metadata.vendor}`;
    }
    return `${metadata.type || "Content"}: ${doc.pageContent}`;
  })
  .join("\n---\n")}`;

    // Use existing thread or create new one
    const openAiThread = incomingThreadId
      ? { id: incomingThreadId }
      : await openai.beta.threads.create();

    // If there's chat history, add previous messages first
    if (chatHistory?.length > 0) {
      for (const historicMessage of chatHistory) {
        await openai.beta.threads.messages.create(openAiThread.id, {
          role: "user",
          content:
            typeof historicMessage === "string"
              ? historicMessage
              : historicMessage.message || historicMessage.content || "",
        });
      }
    }

    // Add the current message with context
    await openai.beta.threads.messages.create(openAiThread.id, {
      role: "user",
      content: `${contextMessage}\n\nUser query: ${
        type === "voice" ? "[Voice] " : ""
      }${message}`,
    });

    // Start the run with the appropriate assistant
    const assistantId =
      type === "voice" ? website.aiVoiceAssistantId : website.aiAssistantId;

    if (!assistantId) {
      return cors(
        request,
        NextResponse.json(
          { error: "Assistant not configured" },
          { status: 400 }
        )
      );
    }

    const run = await openai.beta.threads.runs.create(openAiThread.id, {
      assistant_id: assistantId,
      instructions: `Use the provided context to answer the user's question about the Shopify store.`,
    });

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      openAiThread.id,
      run.id
    );

    while (runStatus.status !== "completed") {
      if (runStatus.status === "failed") {
        throw new Error("Assistant run failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        openAiThread.id,
        run.id
      );
    }

    // Get the response
    const messages = await openai.beta.threads.messages.list(openAiThread.id);
    const lastMessage = messages.data[0];

    // Get just the text content
    const aiResponse =
      lastMessage.content[0].type === "text"
        ? (
            lastMessage.content[0] as {
              type: "text";
              text: { value: string };
            }
          ).text.value
        : "";

    // Increment query counter
    await prisma.website.update({
      where: { id: website.id },
      data: {
        monthlyQueries: {
          increment: 1,
        },
      },
    });

    return cors(
      request,
      NextResponse.json({
        response: aiResponse,
        relevantContent: searchResults,
        threadId: openAiThread.id,
      })
    );
  } catch (error) {
    console.error("❌ Shopify chat error:", error);
    return cors(
      request,
      NextResponse.json(
        { error: "Failed to process chat request" },
        { status: 500 }
      )
    );
  }
}
