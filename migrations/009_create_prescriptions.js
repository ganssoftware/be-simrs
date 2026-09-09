exports.up = (pgm) => {
    pgm.createTable("prescriptions", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        medical_record_id: {
            type: "integer",
            notNull: true,
            references: "medical_records",
            onDelete: "RESTRICT",
        },

        doctor_id: {
            type: "integer",
            notNull: true,
            references: "doctors",
            onDelete: "RESTRICT",
        },

        status: {
            type: "varchar(30)",
            notNull: true,
            default: "menunggu",
        },

        created_at: {
            type: "timestamp",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.createIndex("prescriptions", "medical_record_id");
    pgm.createIndex("prescriptions", "doctor_id");
};

exports.down = (pgm) => {
    pgm.dropTable("prescriptions");
};