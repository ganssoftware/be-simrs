// patientModel.js
const pool = require("../config/db");

const getAllPatients = async () => {
    const result = await pool.query(`
        SELECT
            id,
            medical_record_number,
            nik,
            full_name,
            gender,
            birth_place,
            birth_date,
            address,
            phone,
            blood_type,
            marital_status,
            occupation,
            created_at,
            updated_at
        FROM patients
        ORDER BY id DESC
    `);

    return result.rows;
};

const getPatientById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            id,
            medical_record_number,
            nik,
            full_name,
            gender,
            birth_place,
            birth_date,
            address,
            phone,
            blood_type,
            marital_status,
            occupation,
            created_at,
            updated_at
        FROM patients
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const createPatient = async (data) => {
    const {
        medical_record_number,
        nik,
        full_name,
        gender,
        birth_place,
        birth_date,
        address,
        phone,
        blood_type,
        marital_status,
        occupation,
    } = data;

    const result = await pool.query(
        `
        INSERT INTO patients (
            medical_record_number,
            nik,
            full_name,
            gender,
            birth_place,
            birth_date,
            address,
            phone,
            blood_type,
            marital_status,
            occupation
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11
        )
        RETURNING *
        `,
        [
            medical_record_number,
            nik || null,
            full_name,
            gender,
            birth_place || null,
            birth_date || null,
            address || null,
            phone || null,
            blood_type || null,
            marital_status || null,
            occupation || null,
        ]
    );

    return result.rows[0];
};

const updatePatient = async (id, data) => {
    const {
        nik,
        full_name,
        gender,
        birth_place,
        birth_date,
        address,
        phone,
        blood_type,
        marital_status,
        occupation,
    } = data;

    const result = await pool.query(
        `
        UPDATE patients
        SET
            nik = $1,
            full_name = $2,
            gender = $3,
            birth_place = $4,
            birth_date = $5,
            address = $6,
            phone = $7,
            blood_type = $8,
            marital_status = $9,
            occupation = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
        `,
        [
            nik || null,
            full_name,
            gender,
            birth_place || null,
            birth_date || null,
            address || null,
            phone || null,
            blood_type || null,
            marital_status || null,
            occupation || null,
            id,
        ]
    );

    return result.rows[0];
};

const deletePatient = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM patients
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};