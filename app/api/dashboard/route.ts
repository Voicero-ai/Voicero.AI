import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import { subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate dates for the last 7 days in UTC
    const dates = Array.from({ length: 7 })
      .map((_, i) => {
        const date = subDays(new Date(), i);
        const utcDate = toZonedTime(date, "UTC");
        return {
          start: startOfDay(utcDate),
          end: endOfDay(utcDate),
        };
      })
      .reverse();

    // Get user's websites with date-filtered threads
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
          where: {
            createdAt: {
              gte: dates[0].start, // First date start
              lte: dates[dates.length - 1].end, // Last date end
            },
          },
          select: {
            messages: {
              select: {
                content: true,
                type: true,
                createdAt: true,
              },
            },
            createdAt: true,
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

    // Generate chart data for each day
    const chartData = dates.map(({ start }) => {
      const dayThreads = websites.flatMap((site) =>
        site.aiThreads.filter((thread) => {
          const threadDate = new Date(thread.createdAt);
          return isSameDay(threadDate, start);
        })
      );

      console.log("Date being checked:", start);
      console.log(
        "Threads for this day:",
        dayThreads.map((t) => t.createdAt)
      );

      const redirects = dayThreads.reduce((sum, thread) => {
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
        date: start.toISOString(),
        redirects,
        chats: dayThreads.length,
      };
    });

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
