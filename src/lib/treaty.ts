import { treaty } from '@elysiajs/eden';
import type { Api } from '@/server/api';

export const api = treaty<Api>(
    typeof window !== "undefined"
        ? window.location.origin
        : (process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
);