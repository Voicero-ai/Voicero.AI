import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get("sessionId");

    if (!threadId) {
      return new NextResponse("Thread ID is required", { status: 400 });
    }

    const thread = await prisma.aiThread.findUnique({
      where: {
        id: threadId,
        website: {
          userId: session.user.id,
        },
      },
      include: {
        website: {
          select: {
            id: true,
            url: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!thread) {
      return new NextResponse("Thread not found", { status: 404 });
    }

    const formattedSession = {
      id: thread.id,
      type: "text",
      website: {
        id: thread.website.id,
        domain: thread.website.url,
      },
      startedAt: thread.createdAt.toISOString(),
      messages: thread.messages.map((msg) => {
        let content = msg.content;
        let metadata = {
          url: msg.pageUrl || undefined,
          scrollToText: msg.scrollToText || undefined,
        };

        // Handle text-based JSON responses
        try {
          if (typeof content === "string") {
            const parsed = JSON.parse(content);
            content = parsed.content;

            // Update metadata from the JSON response if available
            if (parsed.redirect_url) {
              metadata.url = parsed.redirect_url;
            }
            if (parsed.scroll_to_text) {
              metadata.scrollToText = parsed.scroll_to_text;
            }
          }
        } catch (e) {
          // If parsing fails, use the content as-is
          console.error("Failed to parse message content:", e);
        }

        return {
          id: msg.id,
          type: msg.role as "user" | "ai",
          content: content,
          timestamp: msg.createdAt.toISOString(),
          metadata: Object.values(metadata).some((v) => v !== undefined)
            ? metadata
            : undefined,
        };
      }),
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
