import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cors } from "@/lib/cors";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAI } from "openai";
import { pinecone } from "@/lib/pinecone";

const prisma = new PrismaClient();
const openai = new OpenAI();

export const runtime = "edge";

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return cors(request, response);
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Shopify chat request received");

    // Get the authorization header and validate
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

    // Parse request body early
    const body = await request.json();
    const {
      message,
      url,
      type,
      threadId: incomingThreadId,
      chatHistory,
    } = body;

    // Send initial response to prevent timeout
    const response = NextResponse.json(
      {
        status: "processing",
        message: "Request accepted, processing in background",
        threadId: incomingThreadId,
      },
      { status: 202 }
    );

    // Process the chat request in the background
    const processPromise = processChatRequest(accessKey, body, prisma, openai);

    // Handle any errors in background processing
    processPromise.catch((error) => {
      console.error("❌ Background processing error:", error);
    });

    return cors(request, response);
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

// Move the main processing logic to a separate async function
async function processChatRequest(
  accessKey: string,
  requestBody: any,
  prisma: PrismaClient,
  openai: OpenAI
) {
  // Get request body and website lookup with vector config
  const [
    { message, url, type, source, threadId: incomingThreadId, chatHistory },
    website,
  ] = await Promise.all([
    requestBody,
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
        url: true,
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
    throw new Error("Invalid access key");
  }

  // Check query limits
  if (website.monthlyQueries >= website.queryLimit) {
    throw new Error("Monthly query limit exceeded");
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
  const contextMessage = `
  Base website URL: ${website.url}
  Current URL: ${url}
  This info is important to the conversation if the user is on a specific collection page /collection/[collection-page] then use your understanding of filtering stores if necessary.
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
URL: ${website.url}/products/${metadata.handle}
Type: ${metadata.productType}
Vendor: ${metadata.vendor}`;
    }
    return `${metadata.type || "Content"}: ${doc.pageContent}
${
  metadata.handle
    ? `URL: ${website.url}/${metadata.type}s/${metadata.handle}`
    : ""
}`;
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
    content: `${contextMessage} 
      ${message}`,
  });

  // Start the run with the appropriate assistant
  const assistantId =
    type === "voice" ? website.aiVoiceAssistantId : website.aiAssistantId;

  if (!assistantId) {
    throw new Error("Assistant not configured");
  }

  const run = await openai.beta.threads.runs.create(openAiThread.id, {
    assistant_id: assistantId,
    instructions: `Use the provided context to answer the user's question about the Shopify store. 
    When referring to products, pages, or blog posts, always use the complete URL by combining the base website URL with the appropriate handle (e.g. baseUrl/products/handle).
    ${
      url.includes("/collection/")
        ? `If the user is on a collection page, use your understanding of filtering stores to answer the question.
        Current URL: ${url}`
        : ""
    }
    ${
      type === "voice"
        ? `Make your answers concise and 2 sentences long 10-25 words max`
        : "Make your answers concise and 3-4 sentences long 20-40 words max. Always include complete URLs when referring to specific pages or products."
    }
    `,
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

  // Find existing thread first
  const existingThread = await prisma.aiThread.findFirst({
    where: { threadId: openAiThread.id },
  });

  // Then upsert using id
  const aiThread = await prisma.aiThread.upsert({
    where: {
      id: existingThread?.id || "new",
    },
    create: {
      id: existingThread?.id || undefined,
      threadId: openAiThread.id,
      websiteId: website.id,
      messages: {
        create: [
          {
            role: "user",
            content: message,
            type: type || "text",
          },
          {
            role: "assistant",
            content: aiResponse,
            type: "text",
          },
        ],
      },
    },
    update: {
      messages: {
        create: [
          {
            role: "user",
            content: message,
            type: type || "text",
          },
          {
            role: "assistant",
            content: aiResponse,
            type: "text",
          },
        ],
      },
    },
  });

  return {
    response: aiResponse,
    relevantContent: searchResults,
    threadId: openAiThread.id,
  };
}
