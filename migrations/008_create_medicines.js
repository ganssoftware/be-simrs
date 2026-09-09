exports.up = (pgm) => {
    pgm.createTable("medicines", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        code: {
            type: "varchar(30)",
            notNull: true,
            unique: true,
        },

        name: {
            type: "varchar(100)",
            notNull: true,
        },

        unit: {
            type: "varchar(30)",
            notNull: true,
        },

        stock: {
            type: "integer",
            notNull: true,
            default: 0,
        },

        price: {
            type: "numeric(12,2)",
            notNull: true,
            default: 0,
        },

        is_active: {
            type: "boolean",
            default: true,
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
    pgm.dropTable("medicines");
};