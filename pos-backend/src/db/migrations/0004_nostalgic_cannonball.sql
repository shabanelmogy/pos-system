ALTER TABLE "pos_settings" ADD COLUMN "direct_print" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "refresh_token" text;