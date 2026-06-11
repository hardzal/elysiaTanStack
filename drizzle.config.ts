import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: ['.env.local', '.env'] })

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: isProduction
      ? process.env.DATABASE_URL!
      : (process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL!),
    ssl: isProduction ? true : false,
  },
  verbose: true,
  strict: true,
});