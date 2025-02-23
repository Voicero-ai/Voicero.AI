import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { cors } from "@/lib/cors";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

async function createTextAssistant(websiteName: string) {
  const assistant = await openai.beta.assistants.create({
    name: `${websiteName} Text Assistant`,
    instructions: `
    You are an AI text assistant for specific websites. Your job is to help users navigate the website and increase conversions.

    You should:
    - Keep responses brief - 2-3 short sentences maximum per response 30-40 words
    - Help users find products and services they're looking for
    - Answer questions about the website content and offerings
    - Guide users to relevant pages (shop, blog, etc.)
    - Handle typos and misspellings gracefully
    - Provide detailed, informative responses
    - Focus on being helpful while subtly encouraging purchases

    You will receive:
    1. User's text prompt
    2. Current page details (title and content)
    3. Relevant vector search results from Pinecone
    4. Past 2 user queries

    First check if the current page content answers the user's question before using vector search results.
    `,
    model: "gpt-4o-mini",
  });

  return assistant;
}

async function createVoiceAssistant(websiteName: string) {
  const assistant = await openai.beta.assistants.create({
    name: `${websiteName} Voice Assistant`,
    instructions: `
    You are an AI voice assistant for specific websites. Your job is to help users navigate the website and increase conversions.

    Key guidelines:
    - Keep responses brief - 2 short sentences maximum per response 20-30 words
    - Respond in a conversational, natural language with breaks, breathing, filler words, and pauses
    - Use conversational, natural language
    - Let users follow up with questions
    - Focus on clarity and simplicity
    - Guide users to take action (visit pages, make purchases)
    - Handle unclear speech/requests gracefully

    You will receive:
    1. User's voice-transcribed prompt
    2. Current page details
    3. Relevant vector search results
    4. Past 2 user queries

    First check current page content before using vector search results.
    Always keep responses concise for voice interaction.
    `,
    model: "gpt-4o-mini",
  });

  return assistant;
}

export async function POST(request: NextRequest) {
  try {
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

    // Find the website associated with this access key
    const website = await prisma.website.findFirst({
      where: {
        accessKeys: {
          some: {
            key: accessKey,
          },
        },
      },
    });

    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    console.log("Found website:", website);
    console.log("Current assistantId:", website.aiAssistantId);

    // Create both text and voice assistants if they don't exist
    let textAssistantId = website.aiAssistantId;
    let voiceAssistantId = website.aiVoiceAssistantId;

    if (!textAssistantId) {
      console.log("Creating new text assistant...");
      const textAssistant = await createTextAssistant(
        website.name || website.url
      );
      textAssistantId = textAssistant.id;
    }

    if (!voiceAssistantId) {
      console.log("Creating new voice assistant...");
      const voiceAssistant = await createVoiceAssistant(
        website.name || website.url
      );
      voiceAssistantId = voiceAssistant.id;
    }

    // Update the website record with both assistant IDs
    const updatedWebsite = await prisma.website.update({
      where: { id: website.id },
      data: {
        aiAssistantId: textAssistantId,
        aiVoiceAssistantId: voiceAssistantId,
      },
      select: {
        id: true,
        aiAssistantId: true,
        aiVoiceAssistantId: true,
      },
    });

    console.log("Updated website:", updatedWebsite);

    return cors(
      request,
      NextResponse.json({
        success: true,
        message: "Assistants configured successfully",
        textAssistantId,
        voiceAssistantId,
        websiteId: website.id,
        timestamp: new Date(),
      })
    );
  } catch (error: any) {
    console.error("Assistant creation error:", error);
    return cors(
      request,
      NextResponse.json(
        { error: "Assistant creation failed", details: error.message },
        { status: 500 }
      )
    );
  }
}
