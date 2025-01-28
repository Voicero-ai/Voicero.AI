import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const websites = await prisma.website.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        url: true,
        name: true,
        type: true,
        plan: true,
        active: true,
        renewsOn: true,
        stripeId: true,
        monthlyQueries: true,
        syncFrequency: true,
        lastSyncedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match the UI requirements
    const transformedWebsites = websites.map((website) => ({
      ...website,
      queryLimit: website.plan === "Pro" ? 50000 : 10000, // Example limits based on plan
      content: {
        // You can add these fields to your schema later
        products: 0,
        blogPosts: 0,
        pages: 0,
      },
      status: website.active ? "active" : "inactive",
    }));

    return NextResponse.json(transformedWebsites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
