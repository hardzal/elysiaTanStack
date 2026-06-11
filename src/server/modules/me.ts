import { Elysia } from 'elysia';

import { auth } from '#/lib/auth';

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