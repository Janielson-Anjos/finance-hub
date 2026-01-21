import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing Stripe credentials" },
        { status: 500 },
      );
    }
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    const text = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-10-28.acacia",
    });
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing webhook secret" },
        { status: 500 },
      );
    }
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!subscriptionId) {
          console.error("No subscription ID in checkout session");
          return NextResponse.json(
            { error: "Missing subscription ID" },
            { status: 400 },
          );
        }

        // Buscar a subscription para obter o metadata
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const clerkUserId = subscription.metadata?.clerk_user_id;

        if (!clerkUserId) {
          console.error(
            "No clerk_user_id in subscription metadata:",
            subscription.metadata,
          );
          return NextResponse.json(
            { error: "Missing clerk user ID" },
            { status: 400 },
          );
        }

        console.log(
          "Updating Clerk user:",
          clerkUserId,
          "with subscription:",
          subscriptionId,
        );

        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
          publicMetadata: {
            subscriptionPlan: "premium",
          },
        });

        console.log("Successfully updated Clerk user metadata");
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const { customer, subscription } = invoice;

        if (!subscription) {
          console.error("No subscription in invoice");
          return NextResponse.json(
            { error: "Missing subscription" },
            { status: 400 },
          );
        }

        // Buscar a subscription para obter o metadata
        const subscriptionData =
          typeof subscription === "string"
            ? await stripe.subscriptions.retrieve(subscription)
            : subscription;

        const clerkUserId = subscriptionData.metadata?.clerk_user_id;
        if (!clerkUserId) {
          console.error(
            "No clerk_user_id in subscription metadata:",
            subscriptionData.metadata,
          );
          return NextResponse.json(
            { error: "Missing clerk user ID" },
            { status: 400 },
          );
        }

        const customerId =
          typeof customer === "string" ? customer : customer?.id;
        const subscriptionId =
          typeof subscription === "string" ? subscription : subscription?.id;

        console.log(
          "Updating Clerk user:",
          clerkUserId,
          "with subscription:",
          subscriptionId,
        );

        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
          publicMetadata: {
            subscriptionPlan: "premium",
          },
        });

        console.log("Successfully updated Clerk user metadata");
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.id,
        );
        const clerkUserId = subscription.metadata?.clerk_user_id;
        if (!clerkUserId) {
          console.error(
            "No clerk_user_id in subscription metadata:",
            subscription.metadata,
          );
          return NextResponse.json(
            { error: "Missing clerk user ID" },
            { status: 400 },
          );
        }
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          },
          publicMetadata: {
            subscriptionPlan: null,
          },
        });
        console.log("Successfully updated Clerk user metadata");
        break;
      }
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook validation failed" },
      { status: 400 },
    );
  }
};
