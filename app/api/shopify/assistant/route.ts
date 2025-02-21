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

async function createAssistant(websiteName: string) {
  const assistant = await openai.beta.assistants.create({
    name: `${websiteName} Assistant`,
    instructions: `
        You are an AI assistant for specific websites. Your job is to help the user that is prompting you to help them guide through the website and ultimately increase the conversion on the companies website.

    So shortly our a tourist of a website but in the end a very good salesman into whatever they are selling. 

If they ask whats in the shop you tell them the products they would have based on the theme of the website and you redirect them to their shop page.

 Same with Blog you tell them the blogs they would have about their website and have redirect to them to the blog page no matter what.


    The user will either type to you or they will talk to you. If the user is typing expect the mispellings that they might have and find the best thing for them anyway.  If they are talking to you they may say something you don't understand, do your best to answer them fully.

    If they are talking to you with their voice they don't want to hear your voice so much so just respond in 2 sentence bursts and let them follow up so you can keep answering them in a human way. But they need to be sentences on the shorter end, like half of what your use to.

    You will know which one they choose based on the request you get.

    You will get couple things in this request.
    1. Their prompt 
    2. Current page and Page title and content (so if they ask whats on this page)
    3. Input type: either typing or voice (follow instructions)
    4. The relevant info from Pinecone which did a vector search (IMPORTANT TO USE)
    5. Past 2 queries from users

Before going through the vector content look at current page content if the first user query that means the main question can be answered from the page content there on then you can stop there ands tell them in the response. 

    For the vector content you will use that to make your answer. You will get 2 different pieces of content most relevant and you will take it all and answer it. 

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

    // Only create new assistant if one doesn't exist
    let assistantId = website.aiAssistantId;
    if (!assistantId) {
      console.log("Creating new assistant...");
      const assistant = await createAssistant(website.name || website.url);
      assistantId = assistant.id;
      console.log("New assistant created with ID:", assistantId);

      // Update the website record with the new assistant ID
      const updatedWebsite = await prisma.website.update({
        where: { id: website.id },
        data: {
          aiAssistantId: assistantId,
        },
        select: {
          id: true,
          aiAssistantId: true,
        },
      });

      console.log("Updated website:", updatedWebsite);
    }

    // Verify the update
    const verifiedWebsite = await prisma.website.findUnique({
      where: { id: website.id },
      select: {
        id: true,
        aiAssistantId: true,
      },
    });

    console.log("Verified website after update:", verifiedWebsite);

    return cors(
      request,
      NextResponse.json({
        success: true,
        message:
          assistantId === website.aiAssistantId
            ? "Using existing assistant"
            : "OpenAI assistant created and saved",
        assistantId,
        websiteId: website.id,
        verifiedAssistantId: verifiedWebsite?.aiAssistantId,
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
