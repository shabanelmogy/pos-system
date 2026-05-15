import { sql } from "drizzle-orm";
import { db, pool } from "../src/config/database.js";
import "dotenv/config";

async function wipe() {
  console.log("🚀 Starting Database Wipe...");

  try {
    // Drop and Recreate Schema (Cleanest way to reset everything including Enums)
    console.log("🗑️  Dropping public schema...");
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
    await db.execute(sql`COMMENT ON SCHEMA public IS 'standard public schema';`);

    console.log("✅ Database wiped successfully. You have a clean slate.");
  } catch (error) {
    console.error("\n❌ Wipe failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

wipe();
