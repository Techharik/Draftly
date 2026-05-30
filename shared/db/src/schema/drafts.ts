import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const drafts = pgTable("drafts", {
  id: uuid("id").defaultRandom().primaryKey(),

  emailId: text("email_id").notNull(),

  content: text("content"),

  status: text("status").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
