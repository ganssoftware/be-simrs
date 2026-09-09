exports.up = (pgm) => {
    pgm.createTable("roles", {
        id: {
            type: "serial",
            primaryKey: true,
        },

        name: {
            type: "varchar(50)",
            notNull: true,
            unique: true,
        },

        created_at: {
            type: "timestamp",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.sql(`
        INSERT INTO roles (name)
        VALUES
            ('admin'),
            ('petugas'),
            ('dokter'),
            ('perawat');
    `);
};

exports.down = (pgm) => {
    pgm.dropTable("roles");
};