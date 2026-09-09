exports.up = (pgm) => {
    // Tanggal kunjungan
    pgm.addColumn("registrations", {
        visit_date: {
            type: "date",
        },
    });

    // Jenis kunjungan
    pgm.addColumn("registrations", {
        visit_type: {
            type: "varchar(20)",
            notNull: true,
            default: "lama",
        },
    });

    // Petugas yang melakukan pendaftaran
    pgm.addColumn("registrations", {
        registered_by: {
            type: "integer",
            references: "users",
            onDelete: "SET NULL",
        },
    });

    // Isi visit_date berdasarkan registration_date
    pgm.sql(`
        UPDATE registrations
        SET visit_date = registration_date::date
        WHERE visit_date IS NULL
    `);

    // Setelah semua data terisi
    pgm.alterColumn("registrations", "visit_date", {
        notNull: true,
    });

    // Index
    pgm.createIndex(
        "registrations",
        ["visit_date", "polyclinic_id"]
    );

    // Mencegah nomor antrean yang sama
    // pada poli dan tanggal yang sama
    pgm.createIndex(
        "registrations",
        ["polyclinic_id", "visit_date", "queue_number"],
        {
            unique: true,
            name: "registrations_queue_unique",
        }
    );

    // Constraint jenis kunjungan
    pgm.addConstraint(
        "registrations",
        "registrations_visit_type_check",
        {
            check: "visit_type IN ('baru', 'lama')",
        }
    );

    // Constraint status
    pgm.addConstraint(
        "registrations",
        "registrations_status_check",
        {
            check: `
                status IN (
                    'menunggu',
                    'dipanggil',
                    'diperiksa',
                    'selesai',
                    'batal'
                )
            `,
        }
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint(
        "registrations",
        "registrations_status_check"
    );

    pgm.dropConstraint(
        "registrations",
        "registrations_visit_type_check"
    );

    pgm.dropIndex(
        "registrations",
        "registrations_queue_unique"
    );

    pgm.dropIndex(
        "registrations",
        ["visit_date", "polyclinic_id"]
    );

    pgm.dropColumn("registrations", "registered_by");
    pgm.dropColumn("registrations", "visit_type");
    pgm.dropColumn("registrations", "visit_date");
};