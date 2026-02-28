const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
});

async function testPostgres() {
    console.log("Checking Postgres connection...");
    try {
        const res = await pool.query('SELECT current_database(), current_user');
        console.log("✅ Connected to Postgres!");
        console.log("Database:", res.rows[0].current_database);
        console.log("User:", res.rows[0].current_user);

        console.log("Checking for 'students' table...");
        const tableCheck = await pool.query("SELECT to_regclass('public.students')");
        if (tableCheck.rows[0].to_regclass) {
            console.log("✅ Table 'students' exists.");
            const rowCount = await pool.query("SELECT count(*) FROM students");
            console.log("Row count in students:", rowCount.rows[0].count);
        } else {
            console.log("❌ Table 'students' DOES NOT exist.");
        }
    } catch (err) {
        console.error("❌ Postgres Connection FAILED!");
        console.error("Error Message:", err.message);
    } finally {
        await pool.end();
    }
}

testPostgres();
