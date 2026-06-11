import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';

import { db, purchases } from '@/lib/db';

import { meModule } from './modules/me';
import {paymentsModule} from './modules/payments';
import {healthModule} from './modules/health';

export const api = new Elysia({prefix: "/api"})
    .onRequest(({request}) => {
        console.log(`[API] ${request.method} ${request.url})`);
    })
    
    .onError(({code, error, path}) => {
        console.error(`[API] ${code} ${error} ${path}`);
    })
    
    .use(healthModule)
    
    .use(meModule)

    .use(paymentsModule);

export type Api = typeof api;