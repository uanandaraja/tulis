DROP INDEX "document_version_created_at_idx";--> statement-breakpoint
DROP INDEX "document_version_unique_idx";--> statement-breakpoint
ALTER TABLE "document_version" ADD COLUMN "diff" text;--> statement-breakpoint
CREATE INDEX "document_version_version_number_idx" ON "document_version" USING btree ("document_id","version_number");