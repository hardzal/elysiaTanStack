import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { auth } from "#/lib/auth";
import { db, purchases } from "#/lib/db";
import { retrieveCheckoutSession } from "#/lib/payments";
import { inngest } from "#/lib/jobs";

export const purchasesModule = new Elysia({ prefix: "/purchases" })
  .get("/status", async ({ request, set }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const purchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, session.user.id))
      .limit(1);

    return {
     purchase: purchase[0] ?? null
    }
  })
  .post("/claim", async ({ body, request, set }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { sessionId } = body;

    const existing = await db
      .select()
      .from(purchases)
      .where(eq(purchases.stripeCheckoutSessionId, sessionId))
      .limit(1);

      if (existing[0]) {
      return { success: true, alreadyClaimed: true, tier: existing[0].tier };
    }

    // Verify payment with Stripe
    const stripeSession = await retrieveCheckoutSession(sessionId);

    if (stripeSession.payment_status !== "paid") {
      set.status = 400;
      return { error: "Payment not completed" };
    }

    const tier = (stripeSession.metadata?.tier ?? "pro") as "pro";

    // Create purchase record
    await db
      .insert(purchases)
      .values({
      userId: session.user.id,
      stripeCheckoutSessionId: sessionId,
      stripeCustomerId:
        typeof stripeSession.customer === "string"
          ? stripeSession.customer
          : stripeSession.customer?.id ?? null,
      stripePaymentId:
        typeof stripeSession.payment_intent === "string"
          ? stripeSession.payment_intent
          : stripeSession.payment_intent?.id ?? null,
      tier,
      status: "completed",
      amount: stripeSession.amount_total ?? 0,
      currency: stripeSession.currency ?? "usd",
    });

    // Trigger background processing
    await inngest.send({
      name: "purchase/completed",
      data: {
        userId: session.user.id,
        tier,
        sessionId,
      },
    });

    return { success: true, tier };
  },
  {
    body: t.Object({
      sessionId: t.String(),
    }),
  }
)
  ;