import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {tanstackStartCookies} from "better-auth/tanstack-start";

import * as schema from "@/lib/db";
import { db } from "@/lib/db";

const isDev = process.env.NODE_ENV !== "production";
const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
    baseURL,
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema: {
            users: schema.users,
            sessions: schema.sessions,
            verifications: schema.verifications,
            accounts: schema.accounts,
        },
    }),

    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
        }
    },

    trustedOrigins: isDev 
        ? ["http://localhost:3000"]
        : [baseURL],

    plugins: [tanstackStartCookies()],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;