exports.up = (pgm) => {
    pgm.createTable("patients", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        medical_record_number: {
            type: "varchar(30)",
            notNull: true,
            unique: true,
        },

        nik: {
            type: "varchar(30)",
            unique: true,
        },

        full_name: {
            type: "varchar(100)",
            notNull: true,
        },

        gender: {
            type: "varchar(20)",
            notNull: true,
        },

        birth_place: {
            type: "varchar(100)",
        },

        birth_date: {
            type: "date",
        },

        address: {
            type: "text",
        },

        phone: {
            type: "varchar(30)",
        },

        blood_type: {
            type: "varchar(5)",
        },

        marital_status: {
            type: "varchar(30)",
        },

        occupation: {
            type: "varchar(100)",
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
};

exports.down = (pgm) => {
    pgm.dropTable("patients");
};