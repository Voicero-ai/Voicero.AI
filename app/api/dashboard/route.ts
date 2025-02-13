import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's websites using userId directly from session
    const websites = await prisma.website.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        url: true,
        type: true,
        active: true,
        aiThreads: {
          select: {
            messages: {
              select: {
                content: true,
                type: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });

    // Calculate total stats
    const totalStats = websites.reduce(
      (acc, website) => {
        const totalChats = website.aiThreads.length;
        const totalMessages = website.aiThreads.reduce(
          (sum, thread) => sum + thread.messages.length,
          0
        );
        const voiceChats = website.aiThreads.reduce(
          (sum, thread) =>
            sum + thread.messages.filter((m) => m.type === "voice").length,
          0
        );
        const redirects = website.aiThreads.reduce((sum, thread) => {
          return (
            sum +
            thread.messages.reduce((messageSum, message) => {
              try {
                const parsed = JSON.parse(message.content);
                return messageSum + (parsed.redirect_url ? 1 : 0);
              } catch (e) {
                return messageSum;
              }
            }, 0)
          );
        }, 0);

        return {
          totalChats: acc.totalChats + totalChats,
          totalMessages: acc.totalMessages + totalMessages,
          voiceChats: acc.voiceChats + voiceChats,
          redirects: acc.redirects + redirects,
        };
      },
      { totalChats: 0, totalMessages: 0, voiceChats: 0, redirects: 0 }
    );

    // Format websites data
    const formattedWebsites = websites.map((site) => ({
      id: site.id,
      domain: site.url,
      platform: site.type,
      monthlyChats: site.aiThreads.length,
      aiRedirects: site.aiThreads.reduce((sum, thread) => {
        return (
          sum +
          thread.messages.reduce((messageSum, message) => {
            try {
              const parsed = JSON.parse(message.content);
              return messageSum + (parsed.redirect_url ? 1 : 0);
            } catch (e) {
              return messageSum;
            }
          }, 0)
        );
      }, 0),
      status: site.active ? "active" : "inactive",
      createdAt: site.createdAt,
    }));

    const chartData = websites.reduce((acc: any[], website) => {
      const date = website.createdAt;
      const redirects = website.aiThreads.reduce((sum, thread) => {
        return (
          sum +
          thread.messages.reduce((messageSum, message) => {
            try {
              const parsed = JSON.parse(message.content);
              return messageSum + (parsed.redirect_url ? 1 : 0);
            } catch (e) {
              return messageSum;
            }
          }, 0)
        );
      }, 0);
      const chats = website.aiThreads.length;

      acc.push({ date, redirects, chats });
      return acc;
    }, []);

    return NextResponse.json({
      stats: {
        totalChats: totalStats.totalChats,
        voiceChats: totalStats.voiceChats,
        aiRedirects: totalStats.redirects,
        activeSites: websites.filter((w) => w.active).length,
      },
      chartData,
      websites: formattedWebsites,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
