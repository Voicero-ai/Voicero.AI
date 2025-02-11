import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cors } from "@/lib/cors";

const prisma = new PrismaClient();

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();

    // Get the authorization header
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
      include: {
        _count: {
          select: {
            pages: true,
            posts: true,
            products: true,
          },
        },
        accessKeys: true,
      },
    });

    console.log("Website found:", website ? "yes" : "no"); // Debug log

    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    // Return the website data
    return cors(
      request,
      NextResponse.json({
        website: {
          id: website.id,
          name: website.name,
          url: website.url,
          type: website.type,
          plan: website.plan,
          active: website.active,
          monthlyQueries: website.monthlyQueries,
          queryLimit: website.queryLimit,
          syncFrequency: website.syncFrequency,
          lastSyncedAt: website.lastSyncedAt,
          _count: website._count,
        },
      })
    );
  } catch (error) {
    console.error("API Error:", error);
    return cors(
      request,
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}
