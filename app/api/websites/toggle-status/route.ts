import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { websiteId } = await request.json();

    if (!websiteId) {
      return NextResponse.json({ error: "Missing websiteId" }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: { active: !website.active },
    });

    return NextResponse.json({
      status: updatedWebsite.active ? "active" : "inactive",
    });
  } catch (error) {
    console.error("Error toggling website status:", error);
    return NextResponse.json(
      { error: "Failed to toggle website status" },
      { status: 500 }
    );
  }
}
