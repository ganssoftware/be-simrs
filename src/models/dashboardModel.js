const pool = require("../config/db");

async function getDashboardSummary() {
    const result = await pool.query(`
        SELECT
            (
                SELECT COUNT(*)
                FROM patients
            ) AS total_patients,

            (
                SELECT COUNT(*)
                FROM registrations
                WHERE visit_date = CURRENT_DATE
            ) AS registrations_today,

            (
                SELECT COUNT(*)
                FROM registrations
                WHERE visit_date = CURRENT_DATE
                  AND status = 'menunggu'
            ) AS waiting_patients,

            (
                SELECT COUNT(*)
                FROM registrations
                WHERE visit_date = CURRENT_DATE
                  AND status = 'dipanggil'
            ) AS called_patients,

            (
                SELECT COUNT(*)
                FROM registrations
                WHERE visit_date = CURRENT_DATE
                  AND status = 'diperiksa'
            ) AS examining_patients,

            (
                SELECT COUNT(*)
                FROM registrations
                WHERE visit_date = CURRENT_DATE
                  AND status = 'selesai'
            ) AS completed_patients,

            (
                SELECT COUNT(*)
                FROM registrations
                WHERE visit_date = CURRENT_DATE
                  AND status = 'batal'
            ) AS cancelled_patients,

            (
                SELECT COUNT(*)
                FROM doctors
                WHERE is_active = true
            ) AS active_doctors,

            (
                SELECT COUNT(*)
                FROM polyclinics
                WHERE is_active = true
            ) AS active_polyclinics,

            (
                SELECT COUNT(*)
                FROM prescriptions
                WHERE status = 'menunggu'
            ) AS waiting_prescriptions,

            (
                SELECT COUNT(*)
                FROM medicines
                WHERE is_active = true
                  AND stock <= 10
            ) AS low_stock_medicines
    `);

    return result.rows[0];
}


/**
 * Antrean hari ini.
 */
async function getTodayQueue(polyclinicId = null) {
    const params = [];

    let query = `
        SELECT
            r.id,
            r.registration_number,
            r.queue_number,

            r.patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,
            p.gender,

            r.doctor_id,
            d.full_name AS doctor_name,

            r.polyclinic_id,
            pc.name AS polyclinic_name,

            r.visit_type,
            r.complaint,
            r.status,

            r.registration_date,
            r.visit_date

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

        query += `
            AND r.polyclinic_id = $${params.length}
        `;
    }

    query += `
        ORDER BY
            CASE r.status
                WHEN 'dipanggil' THEN 1
                WHEN 'diperiksa' THEN 2
                WHEN 'menunggu' THEN 3
                WHEN 'selesai' THEN 4
                WHEN 'batal' THEN 5
                ELSE 6
            END,
            r.queue_number ASC
    `;

    const result = await pool.query(query, params);

    return result.rows;
}


/**
 * Pasien yang sedang dipanggil.
 */
async function getCurrentCalledPatients(polyclinicId = null) {
    const params = [];

    let query = `
        SELECT
            r.id,
            r.registration_number,
            r.queue_number,

            p.id AS patient_id,
            p.medical_record_number,
            p.full_name AS patient_name,

            d.id AS doctor_id,
            d.full_name AS doctor_name,

            pc.id AS polyclinic_id,
            pc.name AS polyclinic_name,

            r.status,
            r.visit_date

        FROM registrations r

        INNER JOIN patients p
            ON p.id = r.patient_id

        INNER JOIN doctors d
            ON d.id = r.doctor_id

        INNER JOIN polyclinics pc
            ON pc.id = r.polyclinic_id

        WHERE r.visit_date = CURRENT_DATE
          AND r.status = 'dipanggil'
    `;

    if (polyclinicId) {
        params.push(polyclinicId);

        query += `
            AND r.polyclinic_id = $${params.length}
        `;
    }

    query += `
        ORDER BY
            pc.name ASC,
            r.queue_number ASC
    `;

    const result = await pool.query(query, params);

    return result.rows;
}


/**
 * Statistik registrasi berdasarkan poli.
 */
async function getTodayRegistrationsByPolyclinic() {
    const result = await pool.query(`
        SELECT
            pc.id,
            pc.name,

            COUNT(r.id) AS total,

            COUNT(r.id) FILTER (
                WHERE r.status = 'menunggu'
            ) AS waiting,

            COUNT(r.id) FILTER (
                WHERE r.status = 'dipanggil'
            ) AS called,

            COUNT(r.id) FILTER (
                WHERE r.status = 'diperiksa'
            ) AS examining,

            COUNT(r.id) FILTER (
                WHERE r.status = 'selesai'
            ) AS completed,

            COUNT(r.id) FILTER (
                WHERE r.status = 'batal'
            ) AS cancelled

        FROM polyclinics pc

        LEFT JOIN registrations r
            ON r.polyclinic_id = pc.id
            AND r.visit_date = CURRENT_DATE

        WHERE pc.is_active = true

        GROUP BY
            pc.id,
            pc.name

        ORDER BY
            pc.name ASC
    `);

    return result.rows;
}


/**
 * Obat dengan stok menipis.
 */
async function getLowStockMedicines() {
    const result = await pool.query(`
        SELECT
            id,
            code,
            name,
            unit,
            stock,
            price
        FROM medicines
        WHERE is_active = true
          AND stock <= 10
        ORDER BY
            stock ASC,
            name ASC
        LIMIT 10
    `);

    return result.rows;
}


/**
 * Statistik registrasi 7 hari terakhir.
 *
 * Berguna untuk grafik dashboard.
 */
async function getRegistrationTrend() {
    const result = await pool.query(`
        SELECT
            visit_date,

            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE status = 'selesai'
            ) AS completed,

            COUNT(*) FILTER (
                WHERE status = 'batal'
            ) AS cancelled

        FROM registrations

        WHERE visit_date >= CURRENT_DATE - INTERVAL '6 days'
          AND visit_date <= CURRENT_DATE

        GROUP BY visit_date

        ORDER BY visit_date ASC
    `);

    return result.rows;
}


module.exports = {
    getDashboardSummary,
    getTodayQueue,
    getCurrentCalledPatients,
    getTodayRegistrationsByPolyclinic,
    getLowStockMedicines,
    getRegistrationTrend,
};