import pg from 'pg';
import 'dotenv/config';

async function reset() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("⏳ Resetting database (dropping public schema)...");
    
    // Drop everything in the public schema and recreate it
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    
    console.log("✅ Database wiped successfully.");
  } catch (err) {
    console.error("❌ Reset failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

reset();
