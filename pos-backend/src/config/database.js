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
});

export const db = drizzle(pool, { schema });
