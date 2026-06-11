import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
// import ws from "ws";

import * as schema from './schema';

const isProduction = process.env.NODE_ENV === "production";
const LOCAL_DB_HOST = "db.localtest.me";

let connectionString = process.env.DATABASE_URL;

if(!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

// neonConfig.webSocketConstructor = ws;

if (!isProduction) {
    connectionString = `postgres://postgres:postgres@${LOCAL_DB_HOST}:5432/my_saas`;
    neonConfig.fetchEndpoint = (host) => {
        const port = host === LOCAL_DB_HOST ? 4444 : 443;
        const protocol = host === LOCAL_DB_HOST ? "http" : "https";
        return `${protocol}://{host}:${port}/sql`;
    }

//     neonConfig.useSecureWebSocket = false;
//     neonConfig.wsProxy = (host) => {
//         return host === LOCAL_DB_HOST ? `${host}:4444/v2` : `${host}:5432/v2`;
//     }
}

const client = neon(connectionString);
export const db = drizzle(client, { schema });

export * from './schema';