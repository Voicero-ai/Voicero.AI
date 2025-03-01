import { NextResponse } from "next/server";
import OpenAI from "openai";
import { cors } from "../../../lib/cors";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Buffer } from "buffer";

export const dynamic = "force-dynamic";

// Add debug logging for environment variables
console.log("Environment check:", {
  hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
  hasAccessKey: Boolean(process.env.ACCESS_KEY),
  accessKeyLength: process.env.ACCESS_KEY?.length,
  accessKeyStart: process.env.ACCESS_KEY?.substring(0, 5),
});

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    console.log("Auth header received:", authHeader); // Debug log

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Invalid auth header format:", authHeader); // Debug log
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
    console.log("Access key extracted:", accessKey?.substring(0, 10) + "..."); // Debug log

    if (!accessKey) {
      console.log("No access key found in header"); // Debug log
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

    console.log("Website found:", website ? "yes" : "no"); // Debug log

    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return cors(
        request,
        NextResponse.json({ error: "No audio file provided" }, { status: 400 })
      );
    }

    // Convert the audio file to a Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Convert the audio blob to a File object
    const file = new File([audioBuffer], "audio.wav", { type: "audio/wav" });

    // Send to OpenAI Whisper API
    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    // Wrap all responses with cors
    return cors(
      request,
      NextResponse.json({
        text: response.text,
      })
    );
  } catch (error) {
    console.error("Whisper API error:", error);
    return cors(
      request,
      NextResponse.json(
        {
          error: "Error processing audio",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    );
  }
}

// Add this test endpoint
export async function GET(request: NextRequest) {
  return cors(
    request,
    NextResponse.json({
      hasAccessKey: Boolean(process.env.ACCESS_KEY),
      accessKeyLength: process.env.ACCESS_KEY?.length,
      // Don't send the full key for security
      accessKeyStart: process.env.ACCESS_KEY?.substring(0, 5),
    })
  );
}
