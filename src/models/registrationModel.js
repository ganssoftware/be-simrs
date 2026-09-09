// registrationModel.js
const pool = require("../config/db");

function formatDateYYYYMMDD(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}${month}${day}`;
}

async function getAllRegistrations() {
    const result = await pool.query(`
        SELECT
            r.id,
            r.registration_number,
            r.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,
            r.doctor_id,
            d.full_name AS doctor_name,
            r.polyclinic_id,
            pc.name AS polyclinic_name,
            r.registration_date,
            r.visit_date,
            r.visit_type,
            r.queue_number,
            r.complaint,
            r.status,
            r.registered_by,
            u.full_name AS registered_by_name
        FROM registrations r
        INNER JOIN patients p
            ON p.id = r.patient_id
        INNER JOIN doctors d
            ON d.id = r.doctor_id
        INNER JOIN polyclinics pc
            ON pc.id = r.polyclinic_id
        LEFT JOIN users u
            ON u.id = r.registered_by
        ORDER BY
            r.visit_date DESC,
            r.queue_number ASC,
            r.id DESC
    `);

    return result.rows;
}

async function getRegistrationById(id) {
    const result = await pool.query(
        `
        SELECT
            r.id,
            r.registration_number,
            r.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,
            p.birth_date,
            p.address,
            p.phone,

            r.doctor_id,
            d.full_name AS doctor_name,
            d.specialization,

            r.polyclinic_id,
            pc.name AS polyclinic_name,

            r.registration_date,
            r.visit_date,
            r.visit_type,
            r.queue_number,
            r.complaint,
            r.status,

            r.registered_by,
            u.full_name AS registered_by_name
        FROM registrations r
        INNER JOIN patients p
            ON p.id = r.patient_id
        INNER JOIN doctors d
            ON d.id = r.doctor_id
        INNER JOIN polyclinics pc
            ON pc.id = r.polyclinic_id
        LEFT JOIN users u
            ON u.id = r.registered_by
        WHERE r.id = $1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function getTodayRegistrations(polyclinicId = null) {
    const params = [];

    let query = `
        SELECT
            r.id,
            r.registration_number,
            r.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,

            r.doctor_id,
            d.full_name AS doctor_name,

            r.polyclinic_id,
            pc.name AS polyclinic_name,

            r.registration_date,
            r.visit_date,
            r.visit_type,
            r.queue_number,
            r.complaint,
            r.status
        FROM registrations r
        INNER JOIN patients p
            ON p.id = r.patient_id
        INNER JOIN doctors d
            ON d.id = r.doctor_id
        INNER JOIN polyclinics pc
            ON pc.id = r.polyclinic_id
        WHERE r.visit_date = CURRENT_DATE
    `;

    if (polyclinicId) {
        params.push(polyclinicId);
        query += ` AND r.polyclinic_id = $${params.length}`;
    }

    query += `
        ORDER BY
            r.queue_number ASC,
            r.id ASC
    `;

    const result = await pool.query(query, params);

    return result.rows;
}


/**
 * Panggil pasien berdasarkan ID.
 *
 * MENUNGGU -> DIPANGGIL
 */
const callRegistration = async (id) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Ambil data registrasi
        const registrationResult = await client.query(
            `
            SELECT
                id,
                patient_id,
                doctor_id,
                polyclinic_id,
                visit_date,
                queue_number,
                status
            FROM registrations
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (registrationResult.rowCount === 0) {
            throw new Error("Registrasi tidak ditemukan");
        }

        const registration = registrationResult.rows[0];

        if (registration.status !== "menunggu") {
            throw new Error(
                "Registrasi hanya dapat dipanggil jika status masih menunggu"
            );
        }

        // Cek apakah dokter tersebut masih memiliki
        // pasien yang sedang dipanggil
        const activeCalledResult = await client.query(
            `
            SELECT id
            FROM registrations
            WHERE doctor_id = $1
              AND polyclinic_id = $2
              AND visit_date = $3
              AND status = 'dipanggil'
            LIMIT 1
            `,
            [
                registration.doctor_id,
                registration.polyclinic_id,
                registration.visit_date,
            ]
        );

        if (activeCalledResult.rowCount > 0) {
            throw new Error(
                "Dokter masih memiliki pasien yang sedang dipanggil"
            );
        }

        const updateResult = await client.query(
            `
            UPDATE registrations
            SET status = 'dipanggil'
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await client.query("COMMIT");

        return updateResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/**
 * Panggil antrean berikutnya.
 *
 * Mengambil pasien MENUNGGU dengan nomor antrean
 * paling kecil pada poli dan tanggal hari ini.
 */
const callNextRegistration = async (
    polyclinicId,
    doctorId
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `
            SELECT pg_advisory_xact_lock(
                hashtext($1)
            )
            `,
            [
                `doctor-queue-${polyclinicId}-${doctorId}-${new Date()
                    .toISOString()
                    .slice(0, 10)}`
            ]
        );

        // Pastikan dokter memang berada di poliklinik tersebut
        const doctorResult = await client.query(
            `
            SELECT id
            FROM doctors
            WHERE id = $1
              AND polyclinic_id = $2
              AND is_active = true
            `,
            [doctorId, polyclinicId]
        );

        if (doctorResult.rowCount === 0) {
            throw new Error(
                "Dokter tidak ditemukan atau tidak terdaftar di poliklinik tersebut"
            );
        }

        // Cek apakah dokter masih memiliki pasien yang dipanggil
        const activeCalledResult = await client.query(
            `
            SELECT id
            FROM registrations
            WHERE doctor_id = $1
              AND polyclinic_id = $2
              AND visit_date = CURRENT_DATE
              AND status = 'dipanggil'
            LIMIT 1
            `,
            [doctorId, polyclinicId]
        );

        if (activeCalledResult.rowCount > 0) {
            throw new Error(
                "Dokter masih memiliki pasien yang sedang dipanggil"
            );
        }

        // Ambil pasien berikutnya khusus dokter tersebut
        const nextResult = await client.query(
            `
            SELECT *
            FROM registrations
            WHERE polyclinic_id = $1
              AND doctor_id = $2
              AND visit_date = CURRENT_DATE
              AND status = 'menunggu'
            ORDER BY queue_number ASC, id ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
            `,
            [polyclinicId, doctorId]
        );

        if (nextResult.rowCount === 0) {
            throw new Error(
                "Tidak ada pasien yang sedang menunggu untuk dokter tersebut"
            );
        }

        const registration = nextResult.rows[0];

        const updateResult = await client.query(
            `
            UPDATE registrations
            SET status = 'dipanggil'
            WHERE id = $1
            RETURNING *
            `,
            [registration.id]
        );

        await client.query("COMMIT");

        return updateResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/**
 * Mulai pemeriksaan.
 *
 * DIPANGGIL -> DIPERIKSA
 */
async function startRegistration(id) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `
            UPDATE registrations
            SET status = 'diperiksa'
            WHERE id = $1
              AND status = 'dipanggil'
            RETURNING id
            `,
            [id]
        );

        if (result.rowCount === 0) {
            const checkResult = await client.query(
                `
                SELECT id, status
                FROM registrations
                WHERE id = $1
                `,
                [id]
            );

            if (checkResult.rowCount === 0) {
                throw new Error("REGISTRATION_NOT_FOUND");
            }

            throw new Error("INVALID_STATUS_FOR_START");
        }

        await client.query("COMMIT");

        return await getRegistrationById(result.rows[0].id);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


/**
 * Batalkan antrean.
 *
 * MENUNGGU / DIPANGGIL -> BATAL
 */
async function cancelRegistration(id) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `
            UPDATE registrations
            SET status = 'batal'
            WHERE id = $1
              AND status IN ('menunggu', 'dipanggil')
            RETURNING id
            `,
            [id]
        );

        if (result.rowCount === 0) {
            const checkResult = await client.query(
                `
                SELECT id, status
                FROM registrations
                WHERE id = $1
                `,
                [id]
            );

            if (checkResult.rowCount === 0) {
                throw new Error("REGISTRATION_NOT_FOUND");
            }

            throw new Error("INVALID_STATUS_FOR_CANCEL");
        }

        await client.query("COMMIT");

        return await getRegistrationById(result.rows[0].id);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


/**
 * Create registration.
 */
async function createRegistration({
    patient_id,
    doctor_id,
    polyclinic_id,
    complaint,
    visit_type,
    registered_by,
}) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const today = new Date();

        await client.query(
            `
            SELECT pg_advisory_xact_lock(
                hashtext($1)
            )
            `,
            [`registration-queue-${polyclinic_id}-${visitDate}`]
        );

        const patientResult = await client.query(
            `
            SELECT id
            FROM patients
            WHERE id = $1
            `,
            [patient_id]
        );

        if (patientResult.rowCount === 0) {
            throw new Error("PATIENT_NOT_FOUND");
        }

        const doctorResult = await client.query(
            `
            SELECT
                id,
                polyclinic_id,
                is_active
            FROM doctors
            WHERE id = $1
            `,
            [doctor_id]
        );

        if (doctorResult.rowCount === 0) {
            throw new Error("DOCTOR_NOT_FOUND");
        }

        const doctor = doctorResult.rows[0];

        if (!doctor.is_active) {
            throw new Error("DOCTOR_NOT_ACTIVE");
        }

        if (Number(doctor.polyclinic_id) !== Number(polyclinic_id)) {
            throw new Error("DOCTOR_POLYCLINIC_MISMATCH");
        }

        const polyclinicResult = await client.query(
            `
            SELECT id
            FROM polyclinics
            WHERE id = $1
              AND is_active = true
            `,
            [polyclinic_id]
        );

        if (polyclinicResult.rowCount === 0) {
            throw new Error("POLYCLINIC_NOT_FOUND");
        }

        const queueResult = await client.query(`
            SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_queue
            FROM registrations
            WHERE polyclinic_id = $1
            AND visit_date = CURRENT_DATE
        `, [polyclinic_id]);

        const queueNumber = Number(queueResult.rows[0].next_queue);

        const registrationNumber =
            `REG-${formatDateYYYYMMDD(today)}` +
            `-P${String(polyclinic_id).padStart(3, "0")}` +
            `-Q${String(queueNumber).padStart(3, "0")}`;

        const result = await client.query(
            `
            INSERT INTO registrations (
                registration_number,
                patient_id,
                doctor_id,
                polyclinic_id,
                registration_date,
                visit_date,
                visit_type,
                queue_number,
                complaint,
                status,
                registered_by
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                CURRENT_TIMESTAMP,
                CURRENT_DATE,
                $5,
                $6,
                $7,
                'menunggu',
                $8
            )
            RETURNING id
            `,
            [
                registrationNumber,
                patient_id,
                doctor_id,
                polyclinic_id,
                visitDate,
                visit_type || "lama",
                queueNumber,
                complaint || null,
                registered_by || null,
            ]
        );

        await client.query("COMMIT");

        return await getRegistrationById(result.rows[0].id);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllRegistrations,
    getRegistrationById,
    getTodayRegistrations,
    createRegistration,
    callRegistration,
    callNextRegistration,
    startRegistration,
    cancelRegistration,
};