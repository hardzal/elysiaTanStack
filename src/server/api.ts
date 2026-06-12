import { Elysia } from 'elysia';
import { auth } from '#/lib/auth';

import { meModule } from './modules/me';
import {paymentsModule} from './modules/payments';
import {healthModule} from './modules/health';
import {purchasesModule} from './modules/purchases';
import { serve } from "inngest/bun";
import { inngest, functions } from "@/lib/jobs";

const inngestHandler = serve({
  client: inngest,
  functions,
});

export const api = new Elysia({prefix: "/api"})
    .mount(auth.handler)

    .onRequest(({request}) => {
        console.log(`[API] ${request.method} ${request.url})`);
    })
    
    .onError(({code, error, path}) => {
        console.error(`[API] ${code} ${error} ${path}`);
    })

    .all("/inngest", async (ctx) => {
        return inngestHandler(ctx.request);
    })
    
    .use(healthModule)
    
    .use(meModule)

    .use(paymentsModule)

    .use(purchasesModule)    
    ;

export type Api = typeof api;