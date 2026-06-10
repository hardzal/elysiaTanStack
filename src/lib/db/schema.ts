import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
 } from "drizzle-orm/pg-core";


export const purchaseTierEnum = pgEnum("purchase_tier", ["free", "pro", "enterprise"]);
export const purchaseStatusEnum = pgEnum("purchase_status", ["completed", "partially_refunded", "refunded"]);

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: varchar("email", {length: 255}).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    name: text("name"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id"),
    stripePaymentId: text("stripe_payment_id"),
    tier: purchaseTierEnum("tier").notNull(),
    status: purchaseStatusEnum("status").notNull().default("completed"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("usd"),
    purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;