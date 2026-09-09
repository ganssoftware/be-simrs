exports.up = (pgm) => {
    pgm.createTable("registrations", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        registration_number: {
            type: "varchar(30)",
            notNull: true,
            unique: true,
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

        polyclinic_id: {
            type: "integer",
            notNull: true,
            references: "polyclinics",
            onDelete: "RESTRICT",
        },

        registration_date: {
            type: "timestamp",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },

        queue_number: {
            type: "integer",
        },

        complaint: {
            type: "text",
        },

        status: {
            type: "varchar(30)",
            notNull: true,
            default: "menunggu",
        },
    });

    pgm.createIndex("registrations", "patient_id");
    pgm.createIndex("registrations", "doctor_id");
    pgm.createIndex("registrations", "polyclinic_id");
};

exports.down = (pgm) => {
    pgm.dropTable("registrations");
};