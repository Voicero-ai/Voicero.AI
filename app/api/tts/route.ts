import { NextResponse } from "next/server";
import { cors } from "@/lib/cors";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ElevenLabs API configuration
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Voice settings tuned for sales-oriented speech
const VOICE_SETTINGS = {
  stability: 1.0,
  similarity_boost: 0.5,
  speaking_rate: 1.0,
  style: 0.5,
  use_speaker_boost: true,
};

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

    // Get the text from the request body
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return cors(
        request,
        NextResponse.json({ error: "No text provided" }, { status: 400 })
      );
    }

    const VOICE_ID = "DtsPFCrhbCbbJkwZsb3d"; // Replace with Piper's actual voice ID

    const response = await fetch(`${ELEVEN_LABS_API_URL}/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVEN_LABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          ...VOICE_SETTINGS,
        },
        output_format: "mp3_44100",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ElevenLabs API error details:", errorData);
      return cors(
        request,
        NextResponse.json(
          {
            error: "ElevenLabs API error",
            status: response.status,
            details: errorData,
          },
          { status: response.status }
        )
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();

    // Return the audio with proper headers
    return cors(
      request,
      new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      })
    );
  } catch (error) {
    console.error("TTS API error:", error);
    return cors(
      request,
      NextResponse.json(
        {
          error: "Error processing text-to-speech",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    );
  }
}
