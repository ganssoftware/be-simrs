const bcrypt = require("bcrypt");

exports.up = async (pgm) => {
    const passwordHash = await bcrypt.hash("SIMRS123!", 10);

    // Ambil role dokter
    const roleResult = await pgm.db.query(`
        SELECT id
        FROM roles
        WHERE name = 'dokter'
        LIMIT 1;
    `);

    if (roleResult.rows.length === 0) {
        throw new Error("Role 'dokter' tidak ditemukan");
    }

    const roleId = roleResult.rows[0].id;

    // Data akun dokter
    const doctors = [
        {
            username: "dr_arif",
            full_name: "dr. Arif Pratama, Sp.PD",
        },
        {
            username: "dr_rina",
            full_name: "dr. Rina Maharani, Sp.A",
        },
        {
            username: "dr_dimas",
            full_name: "dr. Dimas Saputra, Sp.B",
        },
        {
            username: "dr_sari",
            full_name: "dr. Sari Wulandari, Sp.OG",
        },
        {
            username: "dr_budi",
            full_name: "dr. Budi Hartono, Sp.M",
        },
        {
            username: "dr_nadia",
            full_name: "dr. Nadia Permata, Sp.THT",
        },
        {
            username: "dr_fajar",
            full_name: "dr. Fajar Nugroho, Sp.S",
        },
        {
            username: "dr_andi",
            full_name: "dr. Andi Kurniawan, Sp.JP",
        },
        {
            username: "drg_maya",
            full_name: "drg. Maya Lestari",
        },
        {
            username: "dr_rudi",
            full_name: "dr. Rudi Setiawan",
        },
    ];

    for (const doctor of doctors) {
        // Buat user
        const userResult = await pgm.db.query(
            `
            INSERT INTO users (
                role_id,
                username,
                password,
                full_name,
                is_active
            )
            VALUES ($1, $2, $3, $4, true)
            RETURNING id;
            `,
            [
                roleId,
                doctor.username,
                passwordHash,
                doctor.full_name,
            ]
        );

        const userId = userResult.rows[0].id;

        // Hubungkan user dengan data dokter
        await pgm.db.query(
            `
            UPDATE doctors
            SET user_id = $1
            WHERE full_name = $2;
            `,
            [
                userId,
                doctor.full_name,
            ]
        );
    }
};

exports.down = async (pgm) => {
    const usernames = [
        "dr_arif",
        "dr_rina",
        "dr_dimas",
        "dr_sari",
        "dr_budi",
        "dr_nadia",
        "dr_fajar",
        "dr_andi",
        "drg_maya",
        "dr_rudi",
    ];

    // Lepaskan relasi dokter -> user
    await pgm.db.query(`
        UPDATE doctors
        SET user_id = NULL
        WHERE user_id IN (
            SELECT id
            FROM users
            WHERE username = ANY($1)
        );
    `, [usernames]);

    // Hapus user dokter
    await pgm.db.query(`
        DELETE FROM users
        WHERE username = ANY($1);
    `, [usernames]);
};
