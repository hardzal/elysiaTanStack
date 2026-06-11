import { Elysia } from 'elysia';
import { eq } from 'drizzle-orm';

import { auth } from '#/lib/auth';
import {db, purchases} from '#/lib/db';

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