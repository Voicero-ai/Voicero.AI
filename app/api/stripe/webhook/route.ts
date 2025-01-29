import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Add route configuration
export const config = {
  api: {
    bodyParser: false,
  },
};

// Add GET handler to respond properly
export async function GET() {
  return new NextResponse("This endpoint only accepts POST requests", {
    status: 405,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No stripe signature found in webhook request");
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log("Received Stripe webhook event:", {
      type: event.type,
      id: event.id,
      object: event.object,
    });

    switch (event.type) {
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("Processing subscription event:", {
          id: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
        });

        // Find all websites to debug
        const allWebsites = await prisma.website.findMany({
          where: {
            NOT: {
              stripeId: null,
            },
          },
          select: {
            id: true,
            stripeId: true,
            plan: true,
          },
        });

        console.log("All websites with stripe subscriptions:", allWebsites);

        // Find website with this subscription
        const website = await prisma.website.findFirst({
          where: { stripeId: subscription.id },
        });

        if (!website) {
          console.error("No website found for subscription:", {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            allWebsiteIds: allWebsites.map((w) => ({
              id: w.id,
              stripeId: w.stripeId,
            })),
          });
          // Return 200 even if website not found, as per Stripe's recommendation
          return NextResponse.json(
            { error: "Website not found" },
            { status: 200 }
          );
        }

        console.log("Found website for subscription:", {
          websiteId: website.id,
          currentPlan: website.plan,
          stripeId: website.stripeId,
        });

        // If subscription is cancelled or unpaid, downgrade to free
        if (
          subscription.status === "canceled" ||
          subscription.status === "unpaid" ||
          subscription.cancel_at_period_end
        ) {
          console.log("Downgrading website to free plan:", {
            websiteId: website.id,
            reason: subscription.cancel_at_period_end
              ? "scheduled_cancellation"
              : subscription.status,
          });

          await prisma.website.update({
            where: { id: website.id },
            data: {
              plan: "Free",
              stripeId: null,
              renewsOn: null,
              queryLimit: 10000, // Reset to free tier limit
            },
          });

          console.log("Successfully downgraded website to free plan");
        } else if (subscription.status === "active") {
          console.log("Updating renewal date for active subscription");
          await prisma.website.update({
            where: { id: website.id },
            data: {
              renewsOn: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Handle trial ending if you implement trials
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", {
      error: error.message,
      stack: error.stack,
    });
    // Return 200 even on errors, as per Stripe's recommendation
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 200 }
    );
  }
}
