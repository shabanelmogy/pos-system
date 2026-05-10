import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../modules/schema.js";
import config from "../../config/config.js";

const { Pool } = pg;

if (!config.databaseURL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

export const pool = new Pool({
    connectionString: config.databaseURL,
    max: 10,                    // Max connections in pool
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Fail fast if can't connect in 5s
});

// CRITICAL: Handle pool errors to prevent server crashes
// Neon serverless DB drops idle connections — this catches those events
pool.on("error", (err) => {
    console.error("[DB POOL ERROR] Unexpected error on idle client:", err.message);
    // Do NOT crash the server — the pool will create a new connection automatically
});

export const db = drizzle(pool, { schema });
