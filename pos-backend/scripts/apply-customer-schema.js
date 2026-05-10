import { db } from "../src/config/database.js";

import { sql } from "drizzle-orm";

async function run() {
  console.log("🚀 Applying Customer Module Migrations...");

  try {
    // 1. Create customers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(255) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "email" varchar(255),
        "total_orders" integer DEFAULT 0 NOT NULL,
        "total_spent" numeric(12, 2) DEFAULT '0.00' NOT NULL,
        "last_order_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "customers_phone_unique" UNIQUE("phone"),
        CONSTRAINT "customers_email_unique" UNIQUE("email")
      );
    `);

    // 2. Add customer_id to orders if it doesn't exist
    // (It might already exist from my previous push attempt)
    try {
      await db.execute(sql`ALTER TABLE "orders" ADD COLUMN "customer_id" uuid;`);
    } catch (e) {
      console.log("Column customer_id already exists or error adding it.");
    }

    // 3. Add constraint
    try {
      await db.execute(sql`
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_customer_id_customers_id_fk" 
        FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") 
        ON DELETE no action ON UPDATE no action;
      `);
    } catch (e) {
      console.log("Constraint already exists or error adding it.");
    }

    console.log("✅ Database schema updated successfully!");
  } catch (error) {
    console.error("❌ Schema update failed:", error);
  } finally {
    process.exit();
  }
}

run();
