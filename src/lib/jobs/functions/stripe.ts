import { eq } from "drizzle-orm";

import { inngest } from "../client";
import { db, purchases, users } from "@/lib/db";

export const handlePurchaseCompleted = inngest.createFunction(
  {
    id: "purchase-completed",
    triggers: [{ event: "purchase/completed" }],
  },
  async ({ event, step }) => {
    const { userId, tier, sessionId } = event.data as {
      userId: string;
      tier: string;
      sessionId: string;
    };

    // Step 1: Look up user and purchase details
    const { user, purchase } = await step.run(
      "lookup-user-and-purchase",
      async () => {
        const userResult = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        const foundUser = userResult[0];
        if (!foundUser) {
          throw new Error(`User not found: ${userId}`);
        }

        const purchaseResult = await db
          .select({
            amount: purchases.amount,
            currency: purchases.currency,
          })
          .from(purchases)
          .where(eq(purchases.stripeCheckoutSessionId, sessionId))
          .limit(1);

        return {
          user: foundUser,
          purchase: purchaseResult[0] ?? {
            amount: 0,
            currency: "usd",
          },
        };
      }
    );

    // Step 2: Send purchase confirmation email
    await step.run("send-purchase-confirmation", async () => {
      // Send email using your email service (Resend, SendGrid, and so on)
      console.log(
        `Sending purchase confirmation to ${user.email}`
      );
      // await sendEmail({
      //   to: user.email,
      //   subject: "Your purchase is confirmed!",
      //   template: PurchaseConfirmationEmail,
      // });
    });

    // Step 3: Send admin notification
    await step.run("send-admin-notification", async () => {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return;

      console.log(
        `Notifying admin about purchase from ${user.email}`
      );
      // await sendEmail({
      //   to: adminEmail,
      //   subject: `New sale: ${user.email}`,
      //   template: AdminNotificationEmail,
      // });
    });

    // Step 4: Update purchase record
    await step.run("update-purchase-record", async () => {
      await db
        .update(purchases)
        .set({ updatedAt: new Date() })
        .where(eq(purchases.stripeCheckoutSessionId, sessionId));
    });

    return { success: true, userId, tier };
  }
);

export const stripeFunctions = [handlePurchaseCompleted];