// authModel.js
const pool = require("../config/db");

const findUserByUsername = async (
    username
) => {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.password,
            u.full_name,
            u.profile_photo,
            u.is_active,
            r.id AS role_id,
            r.name AS role_name
        FROM users u
        INNER JOIN roles r
            ON r.id = u.role_id
        WHERE u.username = $1
        LIMIT 1
        `,
        [username]
    );

    return result.rows[0];
};

const findUserById = async (
    id
) => {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.profile_photo,
            u.is_active,
            r.id AS role_id,
            r.name AS role_name
        FROM users u
        INNER JOIN roles r
            ON r.id = u.role_id
        WHERE u.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    findUserByUsername,
    findUserById,
};