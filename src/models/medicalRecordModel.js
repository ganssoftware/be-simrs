const pool = require("../config/db");

const getDoctorIdByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT id
        FROM doctors
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0]?.id || null;
};

const getAllMedicalRecords = async ({
    userId,
    role,
}) => {
    let query = `
        SELECT
            mr.id,

            mr.registration_id,
            r.registration_number,
            r.visit_date,
            r.queue_number,
            r.status AS registration_status,

            mr.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,
            p.birth_date,

            mr.doctor_id,
            d.full_name AS doctor_name,
            d.specialization,

            mr.anamnesis,
            mr.examination,
            mr.diagnosis,
            mr.treatment,
            mr.notes,

            mr.created_at,
            mr.updated_at

        FROM medical_records mr

        JOIN registrations r
            ON r.id = mr.registration_id

        JOIN patients p
            ON p.id = mr.patient_id

        JOIN doctors d
            ON d.id = mr.doctor_id
    `;

    const params = [];

    if (role === "dokter") {
        const doctorId =
            await getDoctorIdByUserId(userId);

        if (!doctorId) {
            return [];
        }

        query += `
            WHERE mr.doctor_id = $1
        `;

        params.push(doctorId);
    }

    query += `
        ORDER BY mr.created_at DESC
    `;

    const result = await pool.query(
        query,
        params
    );

    return result.rows;
};

const getMedicalRecordById = async (
    id,
    {
        userId,
        role,
    } = {}
) => {
    let query = `
        SELECT
            mr.id,

            mr.registration_id,
            r.registration_number,
            r.visit_date,
            r.queue_number,
            r.status AS registration_status,

            mr.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,
            p.birth_date,
            p.address,
            p.phone,

            mr.doctor_id,
            d.full_name AS doctor_name,
            d.specialization,

            mr.anamnesis,
            mr.examination,
            mr.diagnosis,
            mr.treatment,
            mr.notes,

            mr.created_at,
            mr.updated_at

        FROM medical_records mr

        JOIN registrations r
            ON r.id = mr.registration_id

        JOIN patients p
            ON p.id = mr.patient_id

        JOIN doctors d
            ON d.id = mr.doctor_id

        WHERE mr.id = $1
    `;

    const params = [id];

    if (role === "dokter") {
        const doctorId =
            await getDoctorIdByUserId(userId);

        if (!doctorId) {
            return null;
        }

        query += `
            AND mr.doctor_id = $2
        `;

        params.push(doctorId);
    }

    const result = await pool.query(
        query,
        params
    );

    return result.rows[0];
};

const getMedicalRecordByRegistrationId = async (
    registrationId,
    {
        userId,
        role,
    } = {}
) => {
    let query = `
        SELECT
            mr.id,

            mr.registration_id,
            r.registration_number,
            r.visit_date,
            r.queue_number,

            mr.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,
            p.birth_date,

            mr.doctor_id,
            d.full_name AS doctor_name,
            d.specialization,

            mr.anamnesis,
            mr.examination,
            mr.diagnosis,
            mr.treatment,
            mr.notes,

            mr.created_at,
            mr.updated_at

        FROM medical_records mr

        JOIN registrations r
            ON r.id = mr.registration_id

        JOIN patients p
            ON p.id = mr.patient_id

        JOIN doctors d
            ON d.id = mr.doctor_id

        WHERE mr.registration_id = $1
    `;

    const params = [registrationId];

    if (role === "dokter") {
        const doctorId =
            await getDoctorIdByUserId(userId);

        if (!doctorId) {
            return null;
        }

        query += `
            AND mr.doctor_id = $2
        `;

        params.push(doctorId);
    }

    const result = await pool.query(
        query,
        params
    );

    return result.rows[0];
};

const createMedicalRecord = async ({
    registration_id,
    anamnesis,
    examination,
    diagnosis,
    treatment,
    notes,
    userId,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const registrationResult =
            await client.query(
                `
                SELECT
                    id,
                    patient_id,
                    doctor_id,
                    status
                FROM registrations
                WHERE id = $1
                FOR UPDATE
                `,
                [registration_id]
            );

        if (
            registrationResult.rows.length === 0
        ) {
            throw new Error(
                "REGISTRATION_NOT_FOUND"
            );
        }

        const registration =
            registrationResult.rows[0];

        const doctorResult =
            await client.query(
                `
                SELECT id
                FROM doctors
                WHERE user_id = $1
                `,
                [userId]
            );

        if (
            doctorResult.rows.length === 0
        ) {
            throw new Error(
                "DOCTOR_NOT_FOUND"
            );
        }

        const loggedInDoctorId =
            doctorResult.rows[0].id;

        if (
            registration.doctor_id !==
            loggedInDoctorId
        ) {
            throw new Error(
                "DOCTOR_NOT_ASSIGNED"
            );
        }

        const existingResult =
            await client.query(
                `
                SELECT id
                FROM medical_records
                WHERE registration_id = $1
                `,
                [registration_id]
            );

        if (existingResult.rows.length > 0) {
            throw new Error(
                "MEDICAL_RECORD_EXISTS"
            );
        }

        if (
            registration.status === "selesai" ||
            registration.status === "batal"
        ) {
            throw new Error(
                "REGISTRATION_ALREADY_CLOSED"
            );
        }

        const result =
            await client.query(
                `
                INSERT INTO medical_records (
                    registration_id,
                    patient_id,
                    doctor_id,
                    anamnesis,
                    examination,
                    diagnosis,
                    treatment,
                    notes
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                RETURNING id
                `,
                [
                    registration.id,
                    registration.patient_id,
                    loggedInDoctorId,
                    anamnesis || null,
                    examination || null,
                    diagnosis || null,
                    treatment || null,
                    notes || null,
                ]
            );

        await client.query(
            `
            UPDATE registrations
            SET status = 'diperiksa'
            WHERE id = $1
            `,
            [registration_id]
        );

        await client.query("COMMIT");

        return getMedicalRecordById(
            result.rows[0].id,
            {
                userId,
                role: "dokter",
            }
        );
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const updateMedicalRecord = async (
    id,
    {
        anamnesis,
        examination,
        diagnosis,
        treatment,
        notes,
    },
    {
        userId,
        role,
    } = {}
) => {
    let query = `
        UPDATE medical_records
        SET
            anamnesis = $1,
            examination = $2,
            diagnosis = $3,
            treatment = $4,
            notes = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
    `;

    const params = [
        anamnesis || null,
        examination || null,
        diagnosis || null,
        treatment || null,
        notes || null,
        id,
    ];

    if (role === "dokter") {
        const doctorId =
            await getDoctorIdByUserId(userId);

        if (!doctorId) {
            return null;
        }

        query += `
            AND doctor_id = $7
        `;

        params.push(doctorId);
    }

    query += `
        RETURNING id
    `;

    const result = await pool.query(
        query,
        params
    );

    if (result.rows.length === 0) {
        return null;
    }

    return getMedicalRecordById(
        result.rows[0].id,
        {
            userId,
            role,
        }
    );
};

const finishMedicalRecord = async (
    id,
    {
        userId,
        role,
    } = {}
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        let query = `
            SELECT
                mr.registration_id,
                mr.doctor_id
            FROM medical_records mr
            WHERE mr.id = $1
            FOR UPDATE
        `;

        const params = [id];

        const recordResult =
            await client.query(
                query,
                params
            );

        if (
            recordResult.rows.length === 0
        ) {
            throw new Error(
                "MEDICAL_RECORD_NOT_FOUND"
            );
        }

        const record =
            recordResult.rows[0];

        if (role === "dokter") {
            const doctorResult =
                await client.query(
                    `
                    SELECT id
                    FROM doctors
                    WHERE user_id = $1
                    `,
                    [userId]
                );

            if (
                doctorResult.rows.length === 0
            ) {
                throw new Error(
                    "DOCTOR_NOT_FOUND"
                );
            }

            if (
                record.doctor_id !==
                doctorResult.rows[0].id
            ) {
                throw new Error(
                    "DOCTOR_NOT_ASSIGNED"
                );
            }
        }

        await client.query(
            `
            UPDATE registrations
            SET status = 'selesai'
            WHERE id = $1
            `,
            [record.registration_id]
        );

        await client.query("COMMIT");

        return getMedicalRecordById(
            id,
            {
                userId,
                role,
            }
        );
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getDoctorIdByUserId,
    getAllMedicalRecords,
    getMedicalRecordById,
    getMedicalRecordByRegistrationId,
    createMedicalRecord,
    updateMedicalRecord,
    finishMedicalRecord,
};