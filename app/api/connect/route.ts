import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cors } from "../../../lib/cors";
export const dynamic = "force-dynamic";
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
            // WordPress counts
            pages: true,
            posts: true,
            products: true,
            // Shopify counts
            shopifyPages: true,
            shopifyProducts: true,
            shopifyBlog: true,
            ShopifyDiscount: true,
          },
        },
        accessKeys: true,
        popUpQuestions: true,
      },
    });

    console.log("Website found:", website ? "yes" : "no"); // Debug log

    if (!website) {
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    // Return the website data with type-specific counts
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
          renewsOn: website.renewsOn,
          syncFrequency: website.syncFrequency,
          lastSyncedAt: website.lastSyncedAt,
          customInstructions: website.customInstructions,
          popUpQuestions: website.popUpQuestions,
          _count:
            website.type === "WordPress"
              ? {
                  pages: website._count.pages,
                  posts: website._count.posts,
                  products: website._count.products,
                }
              : {
                  pages: website._count.shopifyPages,
                  posts: website._count.shopifyBlog,
                  products: website._count.shopifyProducts,
                  discounts: website._count.ShopifyDiscount,
                },
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
