import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { cors } from "../../../../lib/cors";
export const dynamic = "force-dynamic";

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
    You're a Shopify store assistant. Keep responses short (2-3 sentences maximum). Be clear and helpful. ALWAYS ask for permission before suggesting cart actions. NEVER say 'I've added to your cart'; instead ask 'Would you like to add this to your cart?' Only include ONE URL in your entire response.
    `,
    model: "ft:gpt-4o-mini-2024-07-18:voiceroai:voicero-text:B7uvZUul",
  });

  return assistant;
}

async function createVoiceAssistant(websiteName: string) {
  const assistant = await openai.beta.assistants.create({
    name: `${websiteName} Voice Assistant`,
    instructions: `
   You're a Shopify store assistant. Keep responses extremely short (1-2 sentences). Use conversational language with words like 'um', 'y'know', and occasional pauses. ALWAYS ask for permission before suggesting cart actions. NEVER say 'I've added to your cart'; instead ask 'Would you like me to add this to your cart?
    `,
    model: "ft:gpt-4o-mini-2024-07-18:voiceroai:voicero-voice:B7uzRY1B",
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
