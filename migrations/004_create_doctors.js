exports.up = (pgm) => {
    pgm.createTable("doctors", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        user_id: {
            type: "integer",
            unique: true,
            references: "users",
            onDelete: "SET NULL",
        },

        full_name: {
            type: "varchar(100)",
            notNull: true,
        },

        specialization: {
            type: "varchar(100)",
        },

        phone: {
            type: "varchar(30)",
        },

        is_active: {
            type: "boolean",
            default: true,
        },

        created_at: {
            type: "timestamp",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("doctors");
};