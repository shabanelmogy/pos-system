import { pool } from "./src/config/database.js";

const alterTableSQL = `
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pos_settings' AND column_name='enable_tables') THEN
        ALTER TABLE "pos_settings" ADD COLUMN "enable_tables" boolean DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pos_settings' AND column_name='open_on_menu') THEN
        ALTER TABLE "pos_settings" ADD COLUMN "open_on_menu" boolean DEFAULT false;
    END IF;
END $$;
`;

async function run() {
  try {
    console.log("Adding missing columns to pos_settings table...");
    await pool.query(alterTableSQL);
    console.log("Columns added successfully (if they were missing)!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating table:", error);
    process.exit(1);
  }
}

run();
