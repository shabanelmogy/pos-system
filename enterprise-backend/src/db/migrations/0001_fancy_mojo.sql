CREATE TABLE "item_modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "dine_in_table_check";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "lifecycle" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "order_id" SET DATA TYPE uuid USING "order_id"::uuid;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "tax_rate" numeric(5, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "service_charge_rate" numeric(5, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "kitchen_station_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "discount_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "voided_at" timestamp;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "voided_by_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_code" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_paid" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "is_refunded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refund_id" varchar(255);--> statement-breakpoint
ALTER TABLE "item_modifiers" ADD CONSTRAINT "item_modifiers_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_created_idx" ON "orders" USING btree ("branch_id","created_at");--> statement-breakpoint
CREATE INDEX "shift_idx" ON "orders" USING btree ("shift_id");--> statement-breakpoint
CREATE INDEX "customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "orders" USING btree ("lifecycle","fulfillment_status");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "dine_in_table_check" CHECK ("orders"."type" NOT IN ('DINE_IN', 'QR_SELF') OR "orders"."table_id" IS NOT NULL);