import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const thread = await prisma.aiThread.findUnique({
      where: {
        id: params.threadId,
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
