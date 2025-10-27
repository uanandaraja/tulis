import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const chat = pgTable(
	"chat",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: text("title"),
		model: text("model"),
		messageCount: integer("message_count").default(0),
		storageKey: text("storage_key"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		deletedAt: timestamp("deleted_at"),
	},
	(table) => ({
		userIdIdx: index("chat_user_id_idx").on(table.userId),
		updatedAtIdx: index("chat_updated_at_idx").on(table.updatedAt),
		userIdUpdatedAtIdx: index("chat_user_id_updated_at_idx").on(
			table.userId,
			table.updatedAt,
		),
		deletedAtIdx: index("chat_deleted_at_idx").on(table.deletedAt),
	}),
);

export const document = pgTable(
	"document",
	{
		id: text("id").primaryKey(),
		chatId: text("chat_id").references(() => chat.id, { onDelete: "set null" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		currentVersionId: text("current_version_id"),
		storageKey: text("storage_key").notNull(),
		contentPreview: text("content_preview"),
		wordCount: integer("word_count").default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		userIdIdx: index("document_user_id_idx").on(table.userId),
		chatIdIdx: index("document_chat_id_idx").on(table.chatId),
		updatedAtIdx: index("document_updated_at_idx").on(table.updatedAt),
	}),
);

export const documentVersion = pgTable(
	"document_version",
	{
		id: text("id").primaryKey(),
		documentId: text("document_id")
			.notNull()
			.references(() => document.id, { onDelete: "cascade" }),
		versionNumber: integer("version_number").notNull(),
		storageKey: text("storage_key").notNull(),
		contentPreview: text("content_preview"),
		changeDescription: text("change_description"),
		diff: text("diff"),
		wordCount: integer("word_count").default(0),
		createdBy: text("created_by").notNull(), // 'user' | 'assistant'
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		documentIdIdx: index("document_version_document_id_idx").on(
			table.documentId,
		),
		versionNumberIdx: index("document_version_version_number_idx").on(
			table.documentId,
			table.versionNumber,
		),
	}),
);

export const schema = {
	user,
	session,
	account,
	verification,
	chat,
	document,
	documentVersion,
};
