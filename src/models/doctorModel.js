const pool = require("../config/db");

const getAllDoctors = async () => {
    const result = await pool.query(`
        SELECT
            d.id,
            d.user_id,
            u.username,
            u.full_name AS user_full_name,
            d.full_name,
            d.specialization,
            d.phone,
            d.polyclinic_id,
            p.name AS polyclinic_name,
            d.is_active,
            d.created_at
        FROM doctors d
        INNER JOIN users u
            ON u.id = d.user_id
        INNER JOIN polyclinics p
            ON p.id = d.polyclinic_id
        ORDER BY d.id DESC
    `);

    return result.rows;
};

const getDoctorById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            d.id,
            d.user_id,
            u.username,
            u.full_name AS user_full_name,
            d.full_name,
            d.specialization,
            d.phone,
            d.polyclinic_id,
            p.name AS polyclinic_name,
            d.is_active,
            d.created_at
        FROM doctors d
        INNER JOIN users u
            ON u.id = d.user_id
        INNER JOIN polyclinics p
            ON p.id = d.polyclinic_id
        WHERE d.id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const findDoctorUser = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            r.name AS role
        FROM users u
        INNER JOIN roles r
            ON r.id = u.role_id
        WHERE u.id = $1
          AND r.name = 'dokter'
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0];
};

const createDoctor = async (data) => {
    const {
        user_id,
        full_name,
        specialization,
        phone,
        polyclinic_id,
    } = data;

    const result = await pool.query(
        `
        INSERT INTO doctors (
            user_id,
            full_name,
            specialization,
            phone,
            polyclinic_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
            user_id,
            full_name,
            specialization || null,
            phone || null,
            polyclinic_id,
        ]
    );

    return result.rows[0];
};

const updateDoctor = async (id, data) => {
    const {
        full_name,
        specialization,
        phone,
        polyclinic_id,
        is_active,
    } = data;

    const result = await pool.query(
        `
        UPDATE doctors
        SET
            full_name = $1,
            specialization = $2,
            phone = $3,
            polyclinic_id = $4,
            is_active = $5
        WHERE id = $6
        RETURNING *
        `,
        [
            full_name,
            specialization || null,
            phone || null,
            polyclinic_id,
            is_active ?? true,
            id,
        ]
    );

    return result.rows[0];
};

const deleteDoctor = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM doctors
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    findDoctorUser,
    createDoctor,
    updateDoctor,
    deleteDoctor,
};