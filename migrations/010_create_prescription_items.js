exports.up = (pgm) => {
    pgm.createTable("prescription_items", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        prescription_id: {
            type: "integer",
            notNull: true,
            references: "prescriptions",
            onDelete: "CASCADE",
        },

        medicine_id: {
            type: "integer",
            notNull: true,
            references: "medicines",
            onDelete: "RESTRICT",
        },

        quantity: {
            type: "integer",
            notNull: true,
        },

        dosage: {
            type: "varchar(100)",
        },

        instructions: {
            type: "text",
        },
    });

    pgm.createIndex("prescription_items", "prescription_id");
    pgm.createIndex("prescription_items", "medicine_id");
};

exports.down = (pgm) => {
    pgm.dropTable("prescription_items");
};