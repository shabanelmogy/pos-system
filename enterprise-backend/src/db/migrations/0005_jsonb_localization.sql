ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('en', "name", 'ar', "name");--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('en', "name", 'ar', "name");--> statement-breakpoint
ALTER TABLE "item_modifiers" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('en', "name", 'ar', "name");--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('en', "name", 'ar', "name");--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "description" SET DATA TYPE jsonb USING CASE WHEN "description" IS NULL THEN NULL ELSE jsonb_build_object('en', "description", 'ar', "description") END;--> statement-breakpoint
ALTER TABLE "kitchen_stations" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('en', "name", 'ar', "name");--> statement-breakpoint
ALTER TABLE "pos_points" ALTER COLUMN "name" SET DATA TYPE jsonb USING jsonb_build_object('en', "name", 'ar', "name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ((name->>'en'));