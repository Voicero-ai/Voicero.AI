import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createAssistant(websiteName: string) {
  const assistant = await openai.beta.assistants.create({
    name: `${websiteName} Assistant`,
    instructions:
      "You are a helpful AI assistant that answers questions about website content using the provided context. Always be friendly, concise, and accurate.",
    model: "gpt-4o",
  });

  return assistant;
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the access key
    const accessKey = authHeader.split(" ")[1];
    if (!accessKey) {
      return NextResponse.json(
        { error: "No access key provided" },
        { status: 401 }
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
      return NextResponse.json(
        { error: "Invalid access key" },
        { status: 401 }
      );
    }

    // Create OpenAI assistant
    const assistant = await createAssistant(website.name || website.url);

    // Save assistant ID to website record
    await prisma.website.update({
      where: { id: website.id },
      data: {
        aiAssistantId: assistant.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "OpenAI assistant created",
      assistantId: assistant.id,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("Assistant creation error:", error);
    return NextResponse.json(
      { error: "Assistant creation failed", details: error.message },
      { status: 500 }
    );
  }
}
