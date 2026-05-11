import { pool } from "./src/config/database.js";

const alterTableSQL = `
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pos_settings' AND column_name='direct_print') THEN
        ALTER TABLE "pos_settings" ADD COLUMN "direct_print" boolean DEFAULT false;
    END IF;
END $$;
`;

async function run() {
  try {
    console.log("Adding direct_print column to pos_settings table...");
    await pool.query(alterTableSQL);
    console.log("Column added successfully (if it was missing)!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating table:", error);
    process.exit(1);
  }
}

run();
