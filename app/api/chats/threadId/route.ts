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
      type: "text", // You can add voice/text type to your schema if needed
      website: {
        id: thread.website.id,
        domain: thread.website.url,
      },
      startedAt: thread.createdAt.toISOString(),
      messages: thread.messages.map((msg) => ({
        id: msg.id,
        type: msg.role as "user" | "ai",
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        metadata:
          msg.pageUrl || msg.scrollToText
            ? {
                url: msg.pageUrl || undefined,
                scrollToText: msg.scrollToText || undefined,
              }
            : undefined,
      })),
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
