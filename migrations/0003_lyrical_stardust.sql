CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"current_version_id" text,
	"storage_key" text NOT NULL,
	"content_preview" text,
	"word_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_version" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"storage_key" text NOT NULL,
	"content_preview" text,
	"change_description" text,
	"word_count" integer DEFAULT 0,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_user_id_idx" ON "document" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_chat_id_idx" ON "document" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "document_updated_at_idx" ON "document" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "document_version_document_id_idx" ON "document_version" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_version_created_at_idx" ON "document_version" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "document_version_unique_idx" ON "document_version" USING btree ("document_id","version_number");