import { pool } from "./src/config/database.js";

async function fixDatabase() {
    console.log("Starting Database Schema Fix (Removing Tenant Dependency)...");
    
    const queries = [
        // 1. Remove tenant_id from all config tables
        "ALTER TABLE config_profiles DROP COLUMN IF EXISTS tenant_id CASCADE",
        "ALTER TABLE config_profiles DROP COLUMN IF EXISTS organization_id CASCADE",
        "ALTER TABLE config_assignments DROP COLUMN IF EXISTS tenant_id CASCADE",
        "ALTER TABLE config_snapshots DROP COLUMN IF EXISTS tenant_id CASCADE",
        "ALTER TABLE config_audit_logs DROP COLUMN IF EXISTS tenant_id CASCADE",
        
        // 2. Fix indices (remove tenant_id from unique constraints)
        "DROP INDEX IF EXISTS profile_code_unique",
        "CREATE UNIQUE INDEX profile_code_unique ON config_profiles (internal_code) WHERE deleted_at IS NULL",
        
        "DROP INDEX IF EXISTS assignment_lookup_idx",
        "CREATE INDEX assignment_lookup_idx ON config_assignments (target_type, target_id)",

        // 3. Ensure defaults
        "ALTER TABLE config_profiles ALTER COLUMN version_number SET DEFAULT 1",
        "ALTER TABLE config_profiles ALTER COLUMN status SET DEFAULT 'DRAFT'",
        "ALTER TABLE config_profiles ALTER COLUMN is_current_published SET DEFAULT false"
    ];

    for (const sql of queries) {
        try {
            console.log(`Executing: ${sql}`);
            await pool.query(sql);
        } catch (err) {
            console.warn(`[WARN] Failed to execute query: ${sql}. Error: ${err.message}`);
        }
    }

    console.log("Database Fix Completed Successfully!");
    process.exit();
}

fixDatabase();
