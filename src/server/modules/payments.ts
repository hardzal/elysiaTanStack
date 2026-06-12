import { Elysia } from 'elysia';
import { eq } from 'drizzle-orm';
import { auth } from '#/lib/auth';
import { db, purchases } from '#/lib/db';
import { constructWebhookEvent, createOneTimeCheckoutSession } from '#/lib/payments';
import { inngest } from "@/lib/jobs";

export const paymentsModule = new Elysia({prefix: '/payments'})
    .get('/status', async ({request, set}) => {
      
        const session = await auth.api.getSession({
            headers: request.headers,
        })

        if (!session) {
            set.status = 401;
            return {
                error: 'Unauthorized'
            };
        }

        const purchase = await db
            .select()
            .from(purchases)
            .where(eq(purchases.userId, session.user.id))
            .limit(1);

        return {
            userId: session.user.id,
            purchase: purchase[0] ?? null,
        };
        
    })
    .post("/checkout", async({set}) => {
        const priceId = process.env.STRIPE_PRICE_ID;

        if(!priceId) {
            set.status = 500;
            return {
                error: "STRIPE_PRICE_ID is not set"
            }
        }

        const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

        const checkoutSession = await createOneTimeCheckoutSession({
            priceId,
            successUrl: `${baseURL}/dashboard?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseURL}/dashboard?purchase=cancel`,
            metadata: {
               tier: "pro",
            },
        });

        return {
            url: checkoutSession.url
        }
    })
    .post('/webhook', async({ request, set}) => {
        const body = await request.text();
        const sig = request.headers.get('stripe-signature');

        if(!sig) {
            set.status = 400;
            return {
                error: "Missing Stripe signature"
            }
        }

        try {
            const event = await constructWebhookEvent(body, sig);
            console.log(`[webhook] received event ${event.type}`);
            
            if (event.type === "charge.refunded") {
                const charge = event.data.object as {
                    id: string;
                    payment_intent: string;
                    amount: number;
                    amount_refunded: number;
                    currency: string;
                };

                await inngest.send({
                    name: "stripe/charge.refunded",
                    data: {
                        chargeId: charge.id,
                        paymentIntentId: charge.payment_intent,
                        amountRefunded: charge.amount_refunded,
                        originalAmount: charge.amount,
                        currency: charge.currency,
                    },
                })
            }

            return {
                received: true
            };
        } catch(error) {
            console.error("[Webhook] Stripe verification failed:", error);
            set.status = 400;
            return { error: "Webhook verification failed" };
        }
    })