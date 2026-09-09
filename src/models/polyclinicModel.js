// polyclinicModel.js
const pool = require("../config/db");

const getAllPolyclinics = async () => {
    const result = await pool.query(`
        SELECT
            id,
            name,
            description,
            is_active,
            created_at
        FROM polyclinics
        ORDER BY id DESC
    `);

    return result.rows;
};

const getPolyclinicById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            description,
            is_active,
            created_at
        FROM polyclinics
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const createPolyclinic = async ({
    name,
    description,
}) => {
    const result = await pool.query(
        `
        INSERT INTO polyclinics (
            name,
            description
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [
            name,
            description || null,
        ]
    );

    return result.rows[0];
};

const updatePolyclinic = async (
    id,
    {
        name,
        description,
        is_active,
    }
) => {
    const result = await pool.query(
        `
        UPDATE polyclinics
        SET
            name = $1,
            description = $2,
            is_active = $3
        WHERE id = $4
        RETURNING *
        `,
        [
            name,
            description || null,
            is_active ?? true,
            id,
        ]
    );

    return result.rows[0];
};

const deletePolyclinic = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM polyclinics
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllPolyclinics,
    getPolyclinicById,
    createPolyclinic,
    updatePolyclinic,
    deletePolyclinic,
};