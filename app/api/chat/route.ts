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
    console.log("🚀 Chat request received");
    const response = new NextResponse();

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid authorization header");
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
      console.log("❌ No access key provided");
      return cors(
        request,
        NextResponse.json({ error: "No access key provided" }, { status: 401 })
      );
    }

    // Find the website and its assistant with query limit
    console.log(
      "🔍 Looking up website for access key:",
      accessKey.substring(0, 10) + "..."
    );
    const website = await prisma.website.findFirst({
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
        monthlyQueries: true,
        queryLimit: true,
        plan: true,
      },
    });

    if (!website) {
      console.log("❌ Invalid access key - no website found");
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    console.log("✅ Found website:", website.id);

    if (!website.aiAssistantId) {
      console.log("❌ Website assistant not configured");
      return cors(
        request,
        NextResponse.json(
          { error: "Website assistant not configured" },
          { status: 400 }
        )
      );
    }

    // Check if website has exceeded query limit
    if (website.monthlyQueries >= website.queryLimit) {
      console.log("❌ Query limit exceeded");
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

    // Get request body
    const {
      message,
      context,
      threadId,
      isVoiceInput,
      pastPrompts = [],
    } = await request.json();
    console.log("📝 User message:", message);
    console.log("🎤 Is voice input:", isVoiceInput);
    console.log("🌍 Raw context:", context);
    console.log("📜 Past prompts:", pastPrompts);

    // If context.currentContent is empty, try to fetch content from database
    if (!context.currentContent && context.currentUrl) {
      console.log(
        "🔍 Attempting to fetch content from database for URL:",
        context.currentUrl
      );

      // Extract the path from the URL
      const urlPath = new URL(context.currentUrl).pathname;
      const slug = urlPath.split("/").filter(Boolean).pop() || "";

      // Try to find content in various content types
      const page = await prisma.wordpressPage.findFirst({
        where: {
          websiteId: website.id,
          slug: slug,
        },
      });

      const post = await prisma.wordpressPost.findFirst({
        where: {
          websiteId: website.id,
          slug: slug,
        },
      });

      const product = await prisma.wordpressProduct.findFirst({
        where: {
          websiteId: website.id,
          slug: slug,
        },
      });

      // Use the first content we find
      if (page) {
        context.currentContent = page.content;
        console.log("📄 Found page content");
      } else if (post) {
        context.currentContent = post.content;
        console.log("📝 Found post content");
      } else if (product) {
        context.currentContent = `${product.description}\n${
          product.shortDescription || ""
        }`;
        console.log("🛍️ Found product content");
      }
    }

    console.log(
      "📄 Final currentContent length:",
      context.currentContent?.length || 0
    );

    // Initialize embeddings
    console.log("🔄 Initializing embeddings...");
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
    });

    // Initialize Pinecone store
    console.log("🔄 Connecting to Pinecone...");
    const index = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: website.id, // Use website ID as namespace
    });

    // Modify the search to include past prompts
    console.log("🔍 Searching for relevant content...");
    const combinedSearchText = [message, ...pastPrompts].join(" ");
    const searchResults = await vectorStore.similaritySearch(
      combinedSearchText,
      3
    );

    // Create context message for this query
    const contextMessage = `Previous messages for context:
${pastPrompts
  .map((prompt: any, i: number) => `Message ${i + 1}: ${prompt}`)
  .join("\n")}

Relevant content for the query:

${searchResults
  .map((doc, i) => {
    const type = doc.metadata.type;
    let content = "";

    switch (type) {
      case "page":
        content = `Page: ${doc.metadata.title}
URL: ${doc.metadata.url}
Content: ${doc.metadata.content || doc.pageContent || "No content available"}`;
        break;
      case "product":
        content = `Product: ${doc.metadata.name}
URL: ${doc.metadata.url}
Price: $${doc.metadata.price}
Regular Price: $${doc.metadata.regularPrice}
Description: ${doc.metadata.description || "No description available"}
${
  doc.metadata.shortDescription
    ? `Short Description: ${doc.metadata.shortDescription}`
    : ""
}
${
  doc.metadata.categoryIds?.length
    ? `Categories: ${doc.metadata.categoryIds.join(", ")}`
    : ""
}
${
  doc.metadata.reviewIds?.length
    ? `Has Reviews: Yes (${doc.metadata.reviewIds.length})`
    : "No Reviews"
}`;
        break;
      case "post":
        content = `Blog Post: ${doc.metadata.title}
URL: ${doc.metadata.url}
Content: ${doc.metadata.content || doc.pageContent || "No content available"}`;
        break;
      case "comment":
        content = `Comment on "${doc.metadata.postTitle}"
URL: ${doc.metadata.postUrl}
By: ${doc.metadata.authorName}
Date: ${new Date(doc.metadata.date).toLocaleDateString()}
Content: ${doc.metadata.content}`;
        break;
      case "review":
        content = `Review for "${doc.metadata.productName}"
Rating: ${doc.metadata.rating}/5
By: ${doc.metadata.reviewer}
Date: ${new Date(doc.metadata.date).toLocaleDateString()}
Content: ${doc.metadata.content}
Verified Purchase: ${doc.metadata.verified ? "Yes" : "No"}`;
        break;
      default:
        content =
          doc.metadata.content || doc.pageContent || "No content available";
    }

    return `Content ${i + 1} (${type}):
${content}
---`;
  })
  .join("\n")}

Current page: ${context.currentUrl || "No URL provided"}
Page title: ${context.currentTitle || "No title provided"}
Current page content: ${context.currentContent || "No content provided"}
Input type: ${isVoiceInput ? "Voice message" : "Text message"}`;

    console.log("📄 Final context message:", contextMessage);

    // Get or create thread from database
    let aiThread;
    if (threadId) {
      console.log("🔍 Looking up existing thread:", threadId);
      aiThread = await prisma.aiThread.findFirst({
        where: {
          OR: [{ id: threadId }, { threadId: threadId }],
          websiteId: website.id,
        },
      });

      if (!aiThread) {
        console.log("⚠️ Thread not found in database for:", {
          searchedId: threadId,
          websiteId: website.id,
        });
      } else {
        console.log("✅ Found existing thread:", {
          dbId: aiThread.id,
          openAiThreadId: aiThread.threadId,
          websiteId: aiThread.websiteId,
        });
      }
    } else {
      console.log("ℹ️ No threadId provided in request");
    }

    let openAiThreadId;
    if (!aiThread) {
      // Create new OpenAI thread
      console.log("🤖 Creating new OpenAI thread...");
      const openAiThread = await openai.beta.threads.create();
      openAiThreadId = openAiThread.id;

      // Save thread to database
      aiThread = await prisma.aiThread.create({
        data: {
          threadId: openAiThreadId,
          websiteId: website.id,
        },
      });
    } else {
      openAiThreadId = aiThread.threadId;
    }

    // Save user message to database
    await prisma.aiMessage.create({
      data: {
        threadId: aiThread.id,
        role: "user",
        content: message,
        type: isVoiceInput ? "voice" : "text",
      },
    });

    // First send the context
    await openai.beta.threads.messages.create(openAiThreadId, {
      role: "user",
      content: `${contextMessage}`,
    });

    // Then send past prompts as separate messages
    for (const pastPrompt of pastPrompts) {
      await openai.beta.threads.messages.create(openAiThreadId, {
        role: "user",
        content: pastPrompt,
      });
    }

    // Finally send the current message
    await openai.beta.threads.messages.create(openAiThreadId, {
      role: "user",
      content: `${isVoiceInput ? "[Voice Input] " : ""}${message}`,
    });

    // Create run with additional instructions
    console.log("🏃 Starting assistant run...");
    const run = await openai.beta.threads.runs.create(openAiThreadId, {
      assistant_id: website.aiAssistantId,
      instructions: `Use what's given and your instructions to answer the user. Follow your custom instructions strictly and don't make up any information. Format your response as a JSON object with the following structure:
      {
        "content": "Your response message here",
        "redirect_url": "URL to redirect to (or null if no redirect needed)",
        "scroll_to_text": "Text to scroll to on the page (or null if no scroll needed)"
      }`,
    });

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      openAiThreadId,
      run.id
    );

    while (runStatus.status !== "completed") {
      if (runStatus.status === "requires_action") {
        // Handle required actions (function calls)
        if (runStatus.required_action?.type === "submit_tool_outputs") {
          const toolCalls =
            runStatus.required_action.submit_tool_outputs.tool_calls;
          const toolOutputs = toolCalls.map((toolCall) => {
            // Parse the function arguments
            const functionArgs = JSON.parse(toolCall.function.arguments);

            // Return the tool output in the expected format
            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(functionArgs),
            };
          });

          // Submit the tool outputs back to the assistant
          runStatus = await openai.beta.threads.runs.submitToolOutputs(
            openAiThreadId,
            run.id,
            {
              tool_outputs: toolOutputs,
            }
          );
        }
      } else {
        // Wait before checking status again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(
          openAiThreadId,
          run.id
        );

        if (runStatus.status === "failed") {
          console.error("❌ Assistant run failed:", runStatus.last_error);
          throw new Error("Assistant run failed");
        }
        console.log("⏳ Run status:", runStatus.status);
      }
    }

    // Get the response
    console.log("✅ Getting assistant response...");
    const messages = await openai.beta.threads.messages.list(openAiThreadId);
    const lastMessage = messages.data[0];

    // Parse the JSON response
    const aiResponse =
      lastMessage.content[0].type === "text"
        ? JSON.parse(
            (
              lastMessage.content[0] as {
                type: "text";
                text: { value: string };
              }
            ).text.value
          )
        : { content: "", redirect_url: null, scroll_to_text: null };

    console.log("🤖 AI Response:", aiResponse);

    // Save assistant response to database
    await prisma.aiMessage.create({
      data: {
        threadId: aiThread.id,
        role: "assistant",
        content: JSON.stringify(aiResponse),
        type: "text",
      },
    });

    // After successful AI response, increment the monthly queries counter
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
        threadId: openAiThreadId,
      })
    );
  } catch (error) {
    console.error("❌ Chat error:", error);
    return cors(
      request,
      NextResponse.json(
        { error: "Failed to process chat request" },
        { status: 500 }
      )
    );
  }
}
