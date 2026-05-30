import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  googleId: text("google_id").notNull().unique(),

  accessToken: text("access_token"),

  refreshToken: text("refresh_token"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
