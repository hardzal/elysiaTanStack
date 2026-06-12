import { Elysia, t } from 'elysia';

import { auth } from '#/lib/auth';
import { users, db } from '#/lib/db';
import { eq } from 'drizzle-orm';

export const meModule = new Elysia()
    .get('/me', async ({request, set}) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        })

        if (!session) {
            set.status = 401;
            return {
                error: 'Unauthorized'
            };
        }

        return {
            user: session.user,
        }
    })

    .patch("/me", async({ request, body, set }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if(!session) {
            set.status = 401;
            return {
                error: "Unauthorized"
            };
        }

        const [updatedUser] = await db
            .update(users)
            .set({
                name: body.name,
                updatedAt: new Date()
            })
            .where(eq(users.id, session.user.id))
            .returning();


        return {
            user: updatedUser
        }
    },
    {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 100 }),
    }),
  },
)