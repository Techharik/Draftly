import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const drafts = pgTable("drafts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	emailId: text("email_id").notNull(),
	content: text(),
	status: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const emails = pgTable("emails", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	gmailMessageId: text("gmail_message_id").notNull(),
	gmailThreadId: text("gmail_thread_id").notNull(),
	subject: text(),
	from: text(),
	body: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("emails_gmail_message_id_unique").on(table.gmailMessageId),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	googleId: text("google_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_google_id_unique").on(table.googleId),
]);
