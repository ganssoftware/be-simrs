exports.up = (pgm) => {
    pgm.createTable("users", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        role_id: {
            type: "integer",
            notNull: true,
            references: "roles",
            onDelete: "RESTRICT",
        },

        username: {
            type: "varchar(50)",
            notNull: true,
            unique: true,
        },

        password: {
            type: "varchar(255)",
            notNull: true,
        },

        full_name: {
            type: "varchar(100)",
            notNull: true,
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
    pgm.dropTable("users");
};