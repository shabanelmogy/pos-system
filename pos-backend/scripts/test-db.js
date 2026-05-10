import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

console.log("Testing connection to:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Success! Connection established at:', result.rows[0].now);
        process.exit(0);
    });
});
