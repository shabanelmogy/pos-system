CREATE TABLE "config_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"target_type" "config_assignment_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"priority" integer DEFAULT 0,
	"context_config" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "config_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"parent_component_id" uuid,
	"name" jsonb NOT NULL,
	"internal_code" varchar(100) NOT NULL,
	"type" "config_component_type" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"validation_dsl" jsonb DEFAULT '{}'::jsonb,
	"ui_metadata" jsonb DEFAULT '{}'::jsonb,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config_inventory_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"option_id" uuid,
	"inventory_target_type" varchar(50) DEFAULT 'SKU',
	"inventory_target_id" varchar(255) NOT NULL,
	"behavior" "config_inventory_behavior" DEFAULT 'DEDUCT' NOT NULL,
	"quantity_formula" text DEFAULT '1',
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config_logic_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" varchar(255),
	"condition_dsl" jsonb NOT NULL,
	"action" "config_rule_action" NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid NOT NULL,
	"action_config" jsonb DEFAULT '{}'::jsonb,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"internal_code" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"ui_metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "config_price_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" varchar(255),
	"strategy" "config_pricing_strategy" NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid,
	"amount" numeric(16, 6) DEFAULT '0.000000',
	"strategy_data" jsonb DEFAULT '{}'::jsonb,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"base_profile_id" uuid,
	"version_number" integer DEFAULT 1 NOT NULL,
	"status" "config_lifecycle_status" DEFAULT 'DRAFT' NOT NULL,
	"is_current_published" boolean DEFAULT false NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"internal_code" varchar(100),
	"is_template" boolean DEFAULT false NOT NULL,
	"ui_config" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"published_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "config_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"profile_version" integer,
	"owner_type" varchar(50) NOT NULL,
	"owner_id" uuid NOT NULL,
	"full_state" jsonb NOT NULL,
	"total_price_adjustment" numeric(14, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "config_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "config_price_adjustment" numeric(12, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "config_assignments" ADD CONSTRAINT "config_assignments_profile_id_config_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."config_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_components" ADD CONSTRAINT "config_components_profile_id_config_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."config_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_inventory_rules" ADD CONSTRAINT "config_inventory_rules_option_id_config_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."config_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_logic_rules" ADD CONSTRAINT "config_logic_rules_profile_id_config_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."config_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_options" ADD CONSTRAINT "config_options_component_id_config_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."config_components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_price_rules" ADD CONSTRAINT "config_price_rules_profile_id_config_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."config_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignment_lookup_idx" ON "config_assignments" USING btree ("tenant_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "profile_tenant_idx" ON "config_profiles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "profile_lineage_idx" ON "config_profiles" USING btree ("base_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_code_unique" ON "config_profiles" USING btree ("tenant_id","internal_code");