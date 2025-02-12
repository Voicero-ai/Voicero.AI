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
    instructions: `ATTENTION: Your ONLY allowed response format is this exact JSON structure:
    {
      "content": "Your response text here",
      "redirect_url": null,
      "scroll_to_text": null
    }

    ❌ NEVER CREATE ANY OTHER JSON STRUCTURE
    ❌ NEVER ADD ADDITIONAL FIELDS
    ❌ NEVER USE NESTED OBJECTS
    ❌ NEVER USE ARRAYS
    ❌ NEVER USE CUSTOM FIELD NAMES

    For the example query "tell me about the website and take me to the about page", you must respond like this:
    {
      "content": "Sustainable Living is dedicated to empowering individuals and communities to make eco-friendly choices. Founded in 2025, we offer resources and educational content for sustainable living.",
      "redirect_url": "https://alias.local/about-us",
      "scroll_to_text": null
    }

    NOT like this:
    ❌ WRONG:
    {
      "response": {                    // NO nested objects
        "website_info": "...",         // NO custom fields
        "about_page": {                // NO nested objects
          "message": "...",            // NO custom fields
          "url": "..."                 // NO custom fields
        }
      }
    }

    The user will either type to you or they will talk to you. If the user is typing expect the mispellings that they might have and find the best thing for them anyway. If they are talking to you they may say something you don't understand, do your best to answer them fully.

    If they're typing to you are allowed to make a longer message, 3 sentences of the info they need. 

    If they are talking to you with their voice they don't want to hear your voice so much so just respond in 2 sentence bursts and let them follow up so you can keep answering them in a human way.

    You will know which one they choose based on the request you get.

    You will get couple things in this request.
    1. Their prompt 
    2. Current page and Page title and content (so if they ask whats on this page)
    3. Input type: either typing or voice (follow instructions)
    4. The relevant info from Pinecone which did a vector search (IMPORTANT TO USE)

    For the vector content you will use that to make your answer. You will get 3 different pieces of content most relevant and you will take it all and answer it. 

    There's 3 different types of content to be aware of:

    Page Content:
    This is a webpage that you on the site they can click on it has
    - Page title (ex Page: Blog (Blog being title)) 
    - The url (ex URL: https://alias.local/contact/ (use this when you want to redirect the user to that page))
    - Content for al the text (ex content: sustainable living is…(this will be used for your answering a lot of the time))

    Post Content:
    Pretty close to the page
    - Page title as Post:
    - Page url for redirecting if necessary
    - Content: for the the post content
    Its basic but important for necessary info if asked about
    Each post could have comments they might want to hear about

    Comments:
    Example of what a comment given to you would look like
    Comment on "The Ultimate Guide to a Minimalist, Sustainable Lifestyle" URL: https://alias.local/the-ultimate-guide-to-a-minimalist-sustainable-lifestyle/ By: alias Date: 1/19/2025 Content: This is sick

    It gives you the comment on what post, the url, what day it was, and content of it so you can make right decisions. 

    Make sure if they just broadly ask for comments you only pick the comments from the blog post that they said they in the past chats. If there isn't a blog post mentioned ask them for one or give them one with good comments.

    Products Content:
    - It has a Product title under Product: (the title)
    - A URL the same way we had it for page use this to redirect if necessary
    - A price to show as price: 
    - A regular price if the price itself is marked down so you can use this to say its on sale
    - Description to give the suer if they need more context 
    - Has reviews (for if it does have any reviews and you can ask them if they'd like to hear them or if you have relevant reviews you can tell them
    Each product may have reviews as well and this is what that looks like:

    Review:
    Example of what one looks like:
    Review for "3-Speed Bike" Rating: 4/5 By: alias Date: 2/1/2025 Content: Great thing Verified Purchase: No

    It gives name of review, rating, date, content, verified purchase. Use this to help your case in making them buy it

    Make sure if they just broadly ask for reviews you only pick the reviews from the product that they said they in the past chats. If there isn't a product mentioned ask them for one or give them one with good reviews.

    IMPORTANT - YOUR RESPONSE MUST ALWAYS BE IN THIS EXACT JSON FORMAT:
    {
      "content": "Your response text here (no URLs, no markdown, just plain text)",
      "redirect_url": "Optional URL to redirect to (or null)",
      "scroll_to_text": "Optional text to scroll to (or null)"
    }

    Rules for the JSON response:
    - content: Keep it short (3 sentences for text, 1-2 for voice)
    - redirect_url: Only include if you want to send them to a different page
    - scroll_to_text: Only include if you want to highlight text on current page
    - Never include both redirect_url and scroll_to_text - use one or neither
    - No markdown, formatting, or URLs in the content field
    - Use null for fields that aren't needed
    - Double-check your JSON syntax - no typos allowed!

    It is majorly important you first look onto the content of the page there on to see if that page can answer the question and if so then use that only and do a scroll to text where they can find it in a short burst of exact matching words.

    NEVER WRITE IT IN MARKDOWN or do anything fancy with your response just plain text no bold, underline, italic, bullet points, number point. None of that. Always follow the strict response length for text and voice types. And never put URLS in the json response content. Always use them in the redirect_url.`,
    model: "gpt-4o-mini",
    tools: [
      {
        type: "function",
        function: {
          name: "respond",
          description: "Respond to the user's query",
          strict: true,
          parameters: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "The response content",
              },
              redirect_url: {
                type: "string",
                description: "Optional URL to redirect the user to",
                nullable: true,
              },
              scroll_to_text: {
                type: "string",
                description: "Optional text to scroll to on the page",
                nullable: true,
              },
            },
            required: ["content"],
            additionalProperties: false,
          },
        },
      },
    ],
    response_format: { type: "json_object" },
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

    // Only create new assistant if one doesn't exist
    let assistantId = website.aiAssistantId;
    if (!assistantId) {
      const assistant = await createAssistant(website.name || website.url);
      assistantId = assistant.id;

      // Save assistant ID to website record
      await prisma.website.update({
        where: { id: website.id },
        data: {
          aiAssistantId: assistantId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        assistantId === website.aiAssistantId
          ? "Using existing assistant"
          : "OpenAI assistant created",
      assistantId,
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
