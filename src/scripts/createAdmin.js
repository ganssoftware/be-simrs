const bcrypt = require("bcrypt");
const pool = require("../config/db");

const createAdmin = async () => {
    try {
        const username = "admin";
        const password = "admin123";
        const fullName = "Administrator SIMRS";

        const roleResult = await pool.query(
            `
            SELECT id
            FROM roles
            WHERE name = 'admin'
            LIMIT 1
            `
        );

        if (roleResult.rows.length === 0) {
            throw new Error("Role admin belum tersedia");
        }

        const roleId = roleResult.rows[0].id;

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        await pool.query(
            `
            INSERT INTO users (
                role_id,
                username,
                password,
                full_name
            )
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username)
            DO NOTHING
            `,
            [
                roleId,
                username,
                hashedPassword,
                fullName,
            ]
        );

        console.log("Admin berhasil dibuat");

        await pool.end();
    } catch (error) {
        console.error(error);
        await pool.end();
        process.exit(1);
    }
};

createAdmin();