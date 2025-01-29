import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { authOptions } from "../../auth/[...nextauth]/route";

// Handle POST request for creating a new checkout session
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { websiteId, websiteData, successUrl, cancelUrl } = body;

    // Get or create customer
    let customerId;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      });
      customerId = customer.id;
    }

    // If websiteId is provided, verify ownership
    if (websiteId) {
      const website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          userId: session.user.id,
        },
      });

      if (!website) {
        return NextResponse.json(
          { error: "Website not found" },
          { status: 404 }
        );
      }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      mode: "subscription",
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/app/websites/new/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/app/websites/new?canceled=true`,
      metadata: websiteId
        ? {
            websiteId,
            userId: session.user.id,
          }
        : {
            websiteData: JSON.stringify(websiteData),
            userId: session.user.id,
          },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// Handle GET request for completing the subscription
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const websiteId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const subscription = await stripe.subscriptions.retrieve(
      checkoutSession.subscription as string
    );
    const renewsOn = new Date(subscription.current_period_end * 1000);

    // Get the website ID either from query params or metadata
    const targetWebsiteId = websiteId || checkoutSession.metadata?.websiteId;

    if (!targetWebsiteId) {
      // If no website ID, this is a new website creation
      const websiteData = JSON.parse(
        checkoutSession.metadata?.websiteData || "{}"
      );
      const userId = checkoutSession.metadata?.userId;

      if (!userId) {
        return NextResponse.json(
          { error: "No user ID found" },
          { status: 400 }
        );
      }

      // Create new website
      const website = await prisma.website.create({
        data: {
          name: websiteData.name,
          url: websiteData.url,
          type: websiteData.type,
          plan: "Pro",
          active: false,
          userId: userId,
          stripeId: checkoutSession.subscription as string,
          queryLimit: 50000,
          renewsOn,
          accessKeys: {
            create: { key: websiteData.accessKey },
          },
          monthlyQueries: 0,
        },
      });

      return NextResponse.json({ success: true, websiteId: website.id });
    }

    // Update existing website
    await prisma.website.update({
      where: { id: targetWebsiteId },
      data: {
        plan: "Pro",
        stripeId: checkoutSession.subscription as string,
        queryLimit: 50000,
        renewsOn,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in session route:", error);
    return NextResponse.json(
      { error: "Session handling failed" },
      { status: 500 }
    );
  }
}
