// persceptionModel.js
const pool = require("../config/db");

const getAllPrescriptions = async () => {
    const result = await pool.query(`
        SELECT
            pr.id,
            pr.medical_record_id,
            mr.registration_id,

            r.registration_number,
            r.visit_date,

            pr.doctor_id,
            d.full_name AS doctor_name,

            p.id AS patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,

            pc.name AS polyclinic_name,

            pr.status,
            pr.created_at

        FROM prescriptions pr

        JOIN medical_records mr
            ON mr.id = pr.medical_record_id

        JOIN registrations r
            ON r.id = mr.registration_id

        JOIN doctors d
            ON d.id = pr.doctor_id

        JOIN patients p
            ON p.id = mr.patient_id

        LEFT JOIN polyclinics pc
            ON pc.id = r.polyclinic_id

        ORDER BY pr.created_at DESC
    `);

    return result.rows;
};

const getPrescriptionById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            pr.id,
            pr.medical_record_id,
            mr.registration_id,

            r.registration_number,
            r.visit_date,

            pr.doctor_id,
            d.full_name AS doctor_name,

            p.id AS patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,

            pc.name AS polyclinic_name,

            pr.status,
            pr.created_at

        FROM prescriptions pr

        JOIN medical_records mr
            ON mr.id = pr.medical_record_id

        JOIN registrations r
            ON r.id = mr.registration_id

        JOIN doctors d
            ON d.id = pr.doctor_id

        JOIN patients p
            ON p.id = mr.patient_id

        LEFT JOIN polyclinics pc
            ON pc.id = r.polyclinic_id

        WHERE pr.id = $1
        `,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const prescription = result.rows[0];

    const itemsResult = await pool.query(
        `
        SELECT
            pi.id,
            pi.prescription_id,

            pi.medicine_id,

            m.code AS medicine_code,
            m.name AS medicine_name,
            m.unit AS medicine_unit,

            pi.quantity,
            pi.dosage,
            pi.instructions,

            m.price,
            (
                pi.quantity * m.price
            ) AS subtotal

        FROM prescription_items pi

        JOIN medicines m
            ON m.id = pi.medicine_id

        WHERE pi.prescription_id = $1

        ORDER BY pi.id ASC
        `,
        [id]
    );

    prescription.items = itemsResult.rows;

    return prescription;
};

const getPrescriptionsByMedicalRecord =
    async (medicalRecordId) => {
        const result = await pool.query(
            `
            SELECT
                p.id,
                p.medical_record_id,
                p.doctor_id,
                p.status,
                p.created_at,

                d.full_name AS doctor_name,

                pt.id AS patient_id,
                pt.full_name AS patient_name,
                pt.medical_record_number,

                r.registration_number,
                r.visit_date,

                pc.name AS polyclinic_name

            FROM prescriptions p

            JOIN medical_records mr
                ON mr.id = p.medical_record_id

            JOIN doctors d
                ON d.id = p.doctor_id

            JOIN patients pt
                ON pt.id = mr.patient_id

            JOIN registrations r
                ON r.id = mr.registration_id

            LEFT JOIN polyclinics pc
                ON pc.id = r.polyclinic_id

            WHERE p.medical_record_id = $1

            ORDER BY
                p.created_at DESC,
                p.id DESC
            `,
            [medicalRecordId]
        );

        const prescriptions =
            result.rows;

        for (const prescription of prescriptions) {
            const itemsResult =
                await pool.query(
                    `
                    SELECT
                        pi.id,
                        pi.prescription_id,
                        pi.medicine_id,

                        m.code AS medicine_code,
                        m.name AS medicine_name,
                        m.unit AS medicine_unit,

                        pi.quantity,
                        pi.dosage,
                        pi.instructions

                    FROM prescription_items pi

                    JOIN medicines m
                        ON m.id = pi.medicine_id

                    WHERE pi.prescription_id = $1

                    ORDER BY pi.id ASC
                    `,
                    [prescription.id]
                );

            prescription.items =
                itemsResult.rows;
        }

        return prescriptions;
    };

const createPrescription = async ({
    medical_record_id,
    items,
    userId,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const medicalRecordResult = await client.query(
            `
            SELECT
                mr.id,
                mr.doctor_id,
                mr.patient_id,
                d.user_id AS doctor_user_id
            FROM medical_records mr
            JOIN doctors d
                ON d.id = mr.doctor_id
            WHERE mr.id = $1
            FOR UPDATE
            `,
            [medical_record_id]
        );

        if (medicalRecordResult.rows.length === 0) {
            const error = new Error(
                "Rekam medis tidak ditemukan"
            );

            error.code = "MEDICAL_RECORD_NOT_FOUND";

            throw error;
        }

        const medicalRecord =
            medicalRecordResult.rows[0];

        if (
            Number(medicalRecord.doctor_user_id) !==
            Number(userId)
        ) {
            const error = new Error(
                "Anda tidak memiliki akses ke rekam medis ini"
            );

            error.code = "DOCTOR_NOT_ASSIGNED";

            throw error;
        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            const error = new Error(
                "Item resep wajib diisi"
            );

            error.code = "ITEMS_REQUIRED";

            throw error;
        }

        for (const item of items) {
            if (
                !item.medicine_id ||
                !item.quantity ||
                Number(item.quantity) <= 0
            ) {
                const error = new Error(
                    "Data item resep tidak valid"
                );

                error.code = "INVALID_ITEM";

                throw error;
            }

            const medicineResult =
                await client.query(
                    `
                    SELECT
                        id,
                        code,
                        name,
                        unit,
                        stock,
                        price,
                        is_active
                    FROM medicines
                    WHERE id = $1
                    FOR UPDATE
                    `,
                    [item.medicine_id]
                );

            if (
                medicineResult.rows.length === 0
            ) {
                const error = new Error(
                    `Obat dengan ID ${item.medicine_id} tidak ditemukan`
                );

                error.code = "MEDICINE_NOT_FOUND";

                throw error;
            }

            const medicine =
                medicineResult.rows[0];

            if (!medicine.is_active) {
                const error = new Error(
                    `Obat ${medicine.name} sudah tidak aktif`
                );

                error.code = "MEDICINE_INACTIVE";

                throw error;
            }

            if (
                Number(medicine.stock) <
                Number(item.quantity)
            ) {
                const error = new Error(
                    `Stok obat ${medicine.name} tidak mencukupi`
                );

                error.code = "INSUFFICIENT_STOCK";

                throw error;
            }
        }

        const prescriptionResult =
            await client.query(
                `
                INSERT INTO prescriptions (
                    medical_record_id,
                    doctor_id,
                    status
                )
                VALUES ($1, $2, 'menunggu')
                RETURNING *
                `,
                [
                    medical_record_id,
                    medicalRecord.doctor_id,
                ]
            );

        const prescription =
            prescriptionResult.rows[0];

        for (const item of items) {
            await client.query(
                `
                INSERT INTO prescription_items (
                    prescription_id,
                    medicine_id,
                    quantity,
                    dosage,
                    instructions
                )
                VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    prescription.id,
                    item.medicine_id,
                    item.quantity,
                    item.dosage || null,
                    item.instructions || null,
                ]
            );
        }

        await client.query("COMMIT");

        return await getPrescriptionById(
            prescription.id
        );
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const processPrescription = async (id) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const prescriptionResult =
            await client.query(
                `
                SELECT
                    id,
                    status
                FROM prescriptions
                WHERE id = $1
                FOR UPDATE
                `,
                [id]
            );

        if (
            prescriptionResult.rows.length === 0
        ) {
            throw new Error(
                "PRESCRIPTION_NOT_FOUND"
            );
        }

        const prescription =
            prescriptionResult.rows[0];

        if (prescription.status !== "menunggu") {
            throw new Error(
                "INVALID_PRESCRIPTION_STATUS"
            );
        }

        const itemsResult =
            await client.query(
                `
                SELECT
                    pi.medicine_id,
                    pi.quantity,
                    m.name,
                    m.stock
                FROM prescription_items pi

                JOIN medicines m
                    ON m.id = pi.medicine_id

                WHERE pi.prescription_id = $1

                FOR UPDATE OF m
                `,
                [id]
            );

        if (itemsResult.rows.length === 0) {
            throw new Error(
                "PRESCRIPTION_EMPTY"
            );
        }

        // Validasi stok sekali lagi
        for (const item of itemsResult.rows) {
            if (
                Number(item.stock) <
                Number(item.quantity)
            ) {
                const error =
                    new Error(
                        "INSUFFICIENT_STOCK"
                    );

                error.medicineName =
                    item.name;

                error.availableStock =
                    item.stock;

                throw error;
            }
        }

        // Kurangi stok
        for (const item of itemsResult.rows) {
            await client.query(
                `
                UPDATE medicines
                SET
                    stock = stock - $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                `,
                [
                    item.quantity,
                    item.medicine_id,
                ]
            );
        }

        // Tandai resep diproses
        await client.query(
            `
            UPDATE prescriptions
            SET status = 'diproses'
            WHERE id = $1
            `,
            [id]
        );

        await client.query("COMMIT");

        return getPrescriptionById(id);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const finishPrescription = async (id) => {
    const result = await pool.query(
        `
        UPDATE prescriptions
        SET status = 'selesai'
        WHERE id = $1
          AND status = 'diproses'
        RETURNING id
        `,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return getPrescriptionById(id);
};

module.exports = {
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByMedicalRecord,
    createPrescription,
    processPrescription,
    finishPrescription,
};