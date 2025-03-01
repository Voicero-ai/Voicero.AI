import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get("websiteId");
    const timeRange = searchParams.get("timeRange") || "all";

    const whereClause: {
      website: { userId: string; id?: string };
      createdAt?: { gte: Date };
    } = {
      website: {
        userId: session.user.id,
        ...(websiteId ? { id: websiteId } : {}),
      },
    };

    // Apply time range filter
    if (timeRange === "today") {
      whereClause.createdAt = {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
    } else if (timeRange === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      whereClause.createdAt = { gte: lastWeek };
    } else if (timeRange === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      whereClause.createdAt = { gte: lastMonth };
    }

    const threads = await prisma.aiThread.findMany({
      where: whereClause,
      include: {
        website: {
          select: {
            id: true,
            url: true,
            name: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "asc",
          },
          where: {
            role: "user",
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Transform the data to match the frontend structure
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      startedAt: thread.createdAt.toISOString(),
      initialQuery: thread.messages[0]?.content || "New Conversation",
      messageCount: thread._count.messages,
      website: {
        id: thread.website.id,
        domain: thread.website.url,
        name: thread.website.name,
      },
    }));

    return NextResponse.json(formattedThreads);
  } catch (error) {
    console.error("[CHATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
