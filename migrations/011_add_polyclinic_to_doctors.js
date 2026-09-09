exports.up = (pgm) => {
    pgm.addColumn("doctors", {
        polyclinic_id: {
            type: "integer",
            references: "polyclinics",
            onDelete: "RESTRICT",
        },
    });

    pgm.createIndex("doctors", "polyclinic_id");
};

exports.down = (pgm) => {
    pgm.dropIndex("doctors", "polyclinic_id");

    pgm.dropColumn("doctors", "polyclinic_id");
};