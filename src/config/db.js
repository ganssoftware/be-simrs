const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,

    ssl: {
        rejectUnauthorized: false,
    },

    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
    console.log("PostgreSQL connected to Supabase");
});

pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err);
});

module.exports = pool;