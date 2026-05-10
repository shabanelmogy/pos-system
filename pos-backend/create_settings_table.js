import { pool } from "./src/config/database.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS "pos_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pos_point_id" uuid NOT NULL,
	"auto_print_receipt" boolean DEFAULT true,
	"allow_discounts" boolean DEFAULT false,
	"require_customer_on_order" boolean DEFAULT false,
	"receipt_printer_name" text,
	"kitchen_printer_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pos_settings_pos_point_id_unique" UNIQUE("pos_point_id")
);

DO $$ BEGIN
 ALTER TABLE "pos_settings" ADD CONSTRAINT "pos_settings_pos_point_id_pos_points_id_fk" FOREIGN KEY ("pos_point_id") REFERENCES "public"."pos_points"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`;

async function run() {
  try {
    console.log("Creating pos_settings table...");
    await pool.query(createTableSQL);
    console.log("Table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

run();
