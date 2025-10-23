CREATE INDEX "chat_user_id_idx" ON "chat" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_updated_at_idx" ON "chat" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "chat_user_id_updated_at_idx" ON "chat" USING btree ("user_id","updated_at");