import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../config/database.js";

const runMigrations = async () => {
    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "src/db/migrations" });
        console.log("Migrations completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

runMigrations();
