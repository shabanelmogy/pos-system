import { db } from "../src/config/database.js";
import { sql } from "drizzle-orm";

async function run() {
  console.log("🚀 Creating Bill Module Table...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "bills" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "order_id" uuid NOT NULL,
        "bill_no" varchar(50) NOT NULL,
        "total_amount" numeric(12, 2) NOT NULL,
        "tax_amount" numeric(12, 2) NOT NULL,
        "discount_amount" numeric(12, 2) DEFAULT '0.00',
        "payable_amount" numeric(12, 2) NOT NULL,
        "status" varchar(20) DEFAULT 'Unpaid',
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "bills_bill_no_unique" UNIQUE("bill_no"),
        CONSTRAINT "bills_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action
      );
    `);
    console.log("✅ Bill table created successfully!");
  } catch (error) {
    console.error("❌ Bill table creation failed:", error);
  } finally {
    process.exit();
  }
}

run();
