import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Checking if 'DRAFT' exists in order_lifecycle...");
    const res = await client.query(`
      SELECT 1 FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname = 'order_lifecycle' AND e.enumlabel = 'DRAFT'
    `);

    if (res.rowCount === 0) {
      console.log("Adding 'DRAFT' to order_lifecycle...");
      // Postgres enum ADD VALUE cannot run in a transaction block
      await client.query('ALTER TYPE "order_lifecycle" ADD VALUE \'DRAFT\' BEFORE \'ACTIVE\'');
      console.log("'DRAFT' added successfully!");
    } else {
      console.log("'DRAFT' already exists.");
    }
  } catch (err) {
    console.error("Error adding enum value:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
