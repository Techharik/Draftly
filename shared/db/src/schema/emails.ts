import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const emails = pgTable("emails", {
  id: uuid("id").defaultRandom().primaryKey(),

  gmailMessageId: text("gmail_message_id").notNull().unique(),

  gmailThreadId: text("gmail_thread_id").notNull(),

  subject: text("subject"),

  from: text("from"),

  body: text("body"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
