exports.up = (pgm) => {
    pgm.createTable("medical_records", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        registration_id: {
            type: "integer",
            notNull: true,
            unique: true,
            references: "registrations",
            onDelete: "RESTRICT",
        },

        patient_id: {
            type: "integer",
            notNull: true,
            references: "patients",
            onDelete: "RESTRICT",
        },

        doctor_id: {
            type: "integer",
            notNull: true,
            references: "doctors",
            onDelete: "RESTRICT",
        },

        anamnesis: {
            type: "text",
        },

        examination: {
            type: "text",
        },

        diagnosis: {
            type: "text",
        },

        treatment: {
            type: "text",
        },

        notes: {
            type: "text",
        },

        created_at: {
            type: "timestamp",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },

        updated_at: {
            type: "timestamp",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.createIndex("medical_records", "patient_id");
    pgm.createIndex("medical_records", "doctor_id");
};

exports.down = (pgm) => {
    pgm.dropTable("medical_records");
};