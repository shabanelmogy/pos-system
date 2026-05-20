import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../config/database.js";

const runMigrations = async (): Promise<void> => {
    console.log("Running migrations...");
    try {
        try {
            await db.execute('ALTER TYPE "order_lifecycle" ADD VALUE \'DRAFT\' BEFORE \'ACTIVE\'');
            console.log("Added 'DRAFT' to order_lifecycle enum.");
        } catch (e: any) {
            if (!e.message.includes('already exists') && !e.message.includes('does not exist')) {
                console.warn("Enum update warning:", e.message);
            }
        }

        await migrate(db, { migrationsFolder: "src/db/migrations" });
        console.log("Migrations completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

runMigrations();
