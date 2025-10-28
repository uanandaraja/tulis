ALTER TABLE "chat" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "chat_deleted_at_idx" ON "chat" USING btree ("deleted_at");