// registerModel.js
const pool = require("../config/db");

const findRoleByName = async (roleName) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name
        FROM roles
        WHERE name = $1
        LIMIT 1
        `,
        [roleName]
    );

    return result.rows[0];
};

const findUserByUsername = async (username) => {
    const result = await pool.query(
        `
        SELECT
            id,
            username
        FROM users
        WHERE username = $1
        LIMIT 1
        `,
        [username]
    );

    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.profile_photo,
            u.is_active,
            u.created_at,
            r.name AS role
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

const findAllUsers = async () => {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.profile_photo,
            u.is_active,
            u.created_at,
            r.name AS role
        FROM users u
        INNER JOIN roles r
            ON r.id = u.role_id
        ORDER BY
            u.id ASC
        `
    );

    return result.rows;
};

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.profile_photo,
            u.is_active,
            u.password,
            r.name AS role
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE LOWER(u.email) = LOWER($1)
        LIMIT 1
        `,
        [email]
    );

    return result.rows[0];
};

const createPasswordResetToken = async ({
    userId,
    tokenHash,
    expiresAt,
}) => {
    await pool.query(
        `
        DELETE FROM password_reset_tokens
        WHERE user_id = $1
        `,
        [userId]
    );

    const result = await pool.query(
        `
        INSERT INTO password_reset_tokens (
            user_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        RETURNING id, user_id, expires_at
        `,
        [userId, tokenHash, expiresAt]
    );

    return result.rows[0];
};

const findValidPasswordResetToken = async (tokenHash) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            expires_at
        FROM password_reset_tokens
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1
        `,
        [tokenHash]
    );

    return result.rows[0];
};

const updateUserPassword = async ({ userId, password }) => {
    const result = await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE id = $2
        RETURNING id, username
        `,
        [password, userId]
    );

    return result.rows[0];
};

const markPasswordResetTokenUsed = async (tokenId) => {
    await pool.query(
        `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [tokenId]
    );
};

const createUser = async ({
    roleId,
    username,
    email,
    password,
    fullName,
}) => {
    const result = await pool.query(
        `
        INSERT INTO users (
            role_id,
            username,
            email,
            password,
            full_name,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING
            id,
            username,
            email,
            full_name,
            profile_photo,
            is_active,
            created_at
        `,
        [
            roleId,
            username,
            email || null,
            password,
            fullName,
        ]
    );

    return result.rows[0];
};

const getUserSummary = async () => {
    const result = await pool.query(
        `
        SELECT
            COUNT(*)::int AS total_user,
            COUNT(*) FILTER (
                WHERE r.name = 'admin'
            )::int AS total_admin,
            COUNT(*) FILTER (
                WHERE r.name = 'petugas'
            )::int AS total_petugas,
            COUNT(*) FILTER (
                WHERE r.name = 'dokter'
            )::int AS total_dokter,
            COUNT(*) FILTER (
                WHERE r.name = 'perawat'
            )::int AS total_perawat
        FROM users u
        INNER JOIN roles r
            ON r.id = u.role_id
        `
    );

    return result.rows[0];
};

const updateUser = async ({
    id,
    roleId,
    username,
    email,
    fullName,
    password,
}) => {
    let result;

    if (password) {
        result = await pool.query(
            `
            UPDATE users
            SET
                role_id = $1,
                username = $2,
                email = $3,
                full_name = $4,
                password = $5
            WHERE id = $6
            RETURNING
                id,
                username,
                email,
                full_name,
                profile_photo,
                is_active,
                created_at
            `,
            [
                roleId,
                username,
                email,
                fullName,
                password,
                id,
            ]
        );
    } else {
        result = await pool.query(
            `
            UPDATE users
            SET
                role_id = $1,
                username = $2,
                email = $3,
                full_name = $4
            WHERE id = $5
            RETURNING
                id,
                username,
                email,
                full_name,
                profile_photo,
                is_active,
                created_at
            `,
            [
                roleId,
                username,
                email,
                fullName,
                id,
            ]
        );
    }

    return result.rows[0];
};

const updateUserProfile = async ({
    id,
    fullName,
    email,
    profilePhoto,
    password,
}) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            full_name = $1,
            email = $2,
            profile_photo = COALESCE($3, profile_photo),
            password = COALESCE($4, password)
        WHERE id = $5
        RETURNING
            id,
            username,
            email,
            full_name,
            profile_photo,
            is_active,
            created_at
        `,
        [
            fullName,
            email,
            profilePhoto || null,
            password || null,
            id,
        ]
    );

    return result.rows[0];
};

/**
 * AKTIF / NONAKTIF USER
 */
const updateUserStatus = async ({
    id,
    isActive,
}) => {
    const result = await pool.query(
        `
        UPDATE users
        SET is_active = $1
        WHERE id = $2
        RETURNING
            id,
            username,
            full_name,
            is_active,
            created_at
        `,
        [
            isActive,
            id,
        ]
    );

    return result.rows[0];
};

module.exports = {
    findRoleByName,
    findUserByUsername,
    findUserById,
    findUserByEmail,
    findAllUsers,
    createUser,
    getUserSummary,
    updateUser,
    updateUserProfile,
    updateUserStatus,
    createPasswordResetToken,
    findValidPasswordResetToken,
    updateUserPassword,
    markPasswordResetTokenUsed,
};
