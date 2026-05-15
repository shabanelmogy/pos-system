import pg from "pg";
import "dotenv/config";

const { Client } = pg;

async function testConnection() {
  const url = process.env.DATABASE_URL;
  console.log("🔗 Attempting to connect to:", url.split("@")[1]); // Mask password

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("⏳ Connecting...");
    await client.connect();
    console.log("✅ Connected successfully!");
    
    const res = await client.query("SELECT current_database(), current_user, version();");
    console.log("📊 DB Info:", res.rows[0]);
    
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error("Error Code:", err.code);
    console.error("Message:", err.message);
    if (err.stack) console.error("Stack:", err.stack);
  } finally {
    await client.end();
  }
}

testConnection();
