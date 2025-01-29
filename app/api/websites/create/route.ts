import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";
import Stripe from "stripe";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as const,
});

const createWebsiteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  url: z.string().url("Invalid URL"),
  type: z.enum(["WordPress", "Shopify"]),
  accessKey: z.string(),
  plan: z.enum(["Free", "Pro"]),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createWebsiteSchema.parse(body);

    // For Pro plan, handle Stripe first
    if (validatedData.plan === "Pro") {
      try {
        // For Pro plan, just return the website data to be used in session creation
        return NextResponse.json({
          websiteData: validatedData,
          checkoutUrl: true,
        });
      } catch (stripeError: any) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json(
          { error: `Stripe error: ${stripeError.message}` },
          { status: 400 }
        );
      }
    }

    // For Free plan, create website directly
    const website = await prisma.website.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        type: validatedData.type,
        plan: validatedData.plan,
        active: false,
        userId: session.user.id,
        accessKeys: {
          create: { key: validatedData.accessKey },
        },
        monthlyQueries: 0,
        queryLimit: 10000,
      },
    });

    return NextResponse.json({ id: website.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
