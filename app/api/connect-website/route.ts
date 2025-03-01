import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try { 
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteUrl, wpRedirect, websiteId, type } = await request.json();

    if (!siteUrl || !wpRedirect || !type) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["WordPress", "Shopify"].includes(type)) {
      return NextResponse.json({ error: "Invalid site type" }, { status: 400 });
    }

    let website;
    let accessKey;
    const websiteName = extractWebsiteName(siteUrl);

    if (websiteId) {
      // Use existing website
      website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          userId: session.user.id,
          type: type,
        },
        include: {
          accessKeys: true,
        },
      });

      if (!website) {
        return NextResponse.json(
          { error: "Website not found" },
          { status: 404 }
        );
      }
    } else {
      // Check for existing website with same URL
      website = await prisma.website.findFirst({
        where: {
          url: siteUrl,
          userId: session.user.id,
          type: type,
        },
        include: {
          accessKeys: true,
        },
      });
    }

    if (website) {
      // Use existing access key or create new one
      accessKey =
        website.accessKeys[0] ||
        (await prisma.accessKey.create({
          data: {
            key: generateAccessKey(),
            websiteId: website.id,
          },
        }));
    } else {
      // Create new website and access key
      website = await prisma.website.create({
        data: {
          url: siteUrl,
          name: websiteName,
          userId: session.user.id,
          type: type,
          plan: "free",
          accessKeys: {
            create: {
              key: generateAccessKey(),
            },
          },
        },
        include: {
          accessKeys: true,
        },
      });
      accessKey = website.accessKeys[0];
    }

    // Construct redirect URL with access key
    const redirectUrl = new URL(wpRedirect);
    redirectUrl.searchParams.set("access_key", accessKey.key);

    return NextResponse.json({
      redirectUrl: redirectUrl.toString(),
      accessKey: accessKey.key,
    });
  } catch (error) {
    console.error("Connection error:", error);
    return NextResponse.json(
      { error: "Failed to process connection" },
      { status: 500 }
    );
  }
}

function generateAccessKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

function extractWebsiteName(url: string): string {
  try {
    // Get the part between // and the next /
    const match = url.match(/\/\/(.*?)(?:\/|$)/);
    if (!match) return "My Website";

    // Get the domain without the TLD
    const domain = match[1].split(".")[0];

    // Capitalize first letter and replace hyphens/underscores with spaces
    return (
      domain.charAt(0).toUpperCase() + domain.slice(1).replace(/[-_]/g, " ")
    );
  } catch (error) {
    return "My Website";
  }
}
