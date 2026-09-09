exports.up = (pgm) => {
    pgm.addConstraint(
        "prescriptions",
        "prescriptions_status_check",
        {
            check: `
                status IN (
                    'menunggu',
                    'diproses',
                    'selesai',
                    'batal'
                )
            `,
        }
    );

    pgm.addConstraint(
        "prescription_items",
        "prescription_items_quantity_check",
        {
            check: "quantity > 0",
        }
    );

    pgm.addConstraint(
        "medicines",
        "medicines_stock_check",
        {
            check: "stock >= 0",
        }
    );

    pgm.addConstraint(
        "medicines",
        "medicines_price_check",
        {
            check: "price >= 0",
        }
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint(
        "prescriptions",
        "prescriptions_status_check"
    );

    pgm.dropConstraint(
        "prescription_items",
        "prescription_items_quantity_check"
    );

    pgm.dropConstraint(
        "medicines",
        "medicines_stock_check"
    );

    pgm.dropConstraint(
        "medicines",
        "medicines_price_check"
    );
};