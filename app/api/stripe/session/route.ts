import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { authOptions } from "../../auth/[...nextauth]/route";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as const,
});

// Add type for website data
type WebsiteData = {
  name: string;
  url: string;
  type: "WordPress" | "Shopify";
  plan: "Free" | "Pro";
  createAccessKey: boolean;
  accessKey?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe Session:", checkoutSession);
    console.log("Subscription ID:", checkoutSession.subscription);
    console.log("Website ID:", checkoutSession.metadata?.websiteId);

    // Parse and validate data
    const websiteData = JSON.parse(
      checkoutSession.metadata?.websiteData || "{}"
    ) as WebsiteData;

    const userId = checkoutSession.metadata?.userId;
    if (!userId) throw new Error("No user ID in metadata");

    // Get subscription details to determine renewal date
    const subscription = await stripe.subscriptions.retrieve(
      checkoutSession.subscription as string
    );
    const renewsOn = new Date(subscription.current_period_end * 1000);

    // Create website with validated data
    const website = await prisma.website.create({
      data: {
        name: websiteData.name,
        url: websiteData.url,
        type: websiteData.type,
        plan: websiteData.plan,
        active: false,
        userId,
        stripeId: checkoutSession.subscription as string,
        queryLimit: 50000,
        renewsOn,
        accessKeys: websiteData.accessKey
          ? {
              create: { key: websiteData.accessKey },
            }
          : undefined,
        monthlyQueries: 0,
      },
    });

    return NextResponse.redirect(new URL("/app/websites", request.url));
  } catch (error) {
    console.error("Error in session route:", error);
    return NextResponse.json(
      { error: "Session handling failed" },
      { status: 500 }
    );
  }
}
