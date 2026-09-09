exports.up = (pgm) => {
    pgm.createTable("polyclinics", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        name: {
            type: "varchar(100)",
            notNull: true,
            unique: true,
        },

        description: {
            type: "text",
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
    pgm.dropTable("polyclinics");
};