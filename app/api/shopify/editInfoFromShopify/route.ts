import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cors } from "../../../../lib/cors";
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
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

    if (!accessKey) {
      return cors(
        request,
        NextResponse.json({ error: "No access key provided" }, { status: 401 })
      );
    }

    // Get request body
    const body = await request.json();
    const {
      name,
      url,
      customInstructions,
      popUpQuestions,
      active,
      plan,
      queryLimit,
      monthlyQueries,
      renewsOn,
      lastSyncedAt,
      syncFrequency,
    } = body;

    // Find the website ID using the access key
    const accessKeyRecord = await prisma.accessKey.findUnique({
      where: {
        key: accessKey,
      },
      select: {
        websiteId: true,
      },
    });

    if (!accessKeyRecord) {
      return cors(
        request,
        NextResponse.json({ error: "Invalid access key" }, { status: 401 })
      );
    }

    // Update the website using the found website ID
    const website = await prisma.website.update({
      where: {
        id: accessKeyRecord.websiteId,
      },
      data: {
        name: name,
        url: url,
        customInstructions: customInstructions,
        active: active,
        plan: plan,
        queryLimit: queryLimit,
        monthlyQueries: monthlyQueries,
        renewsOn: renewsOn ? new Date(renewsOn) : null,
        syncFrequency: syncFrequency,
        // Handle pop-up questions update
        popUpQuestions: {
          deleteMany: {}, // Delete all existing questions
          createMany: {
            data: popUpQuestions.map((q: { question: string }) => ({
              question: q.question,
            })),
          },
        },
      },
      include: {
        popUpQuestions: true,
      },
    });

    return cors(
      request,
      NextResponse.json({
        success: true,
        website: {
          id: website.id,
          name: website.name,
          url: website.url,
          customInstructions: website.customInstructions,
          active: website.active,
          plan: website.plan,
          queryLimit: website.queryLimit,
          monthlyQueries: website.monthlyQueries,
          renewsOn: website.renewsOn,
          lastSyncedAt: website.lastSyncedAt,
          syncFrequency: website.syncFrequency,
          popUpQuestions: website.popUpQuestions,
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
