const pool = require("../config/db");

const getAllMedicines = async () => {
    const result = await pool.query(`
        SELECT
            id,
            code,
            name,
            unit,
            stock,
            price,
            is_active,
            created_at,
            updated_at
        FROM medicines
        ORDER BY name ASC
    `);

    return result.rows;
};

const getMedicineById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            id,
            code,
            name,
            unit,
            stock,
            price,
            is_active,
            created_at,
            updated_at
        FROM medicines
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const createMedicine = async ({
    code,
    name,
    unit,
    stock,
    price,
}) => {
    const result = await pool.query(
        `
        INSERT INTO medicines (
            code,
            name,
            unit,
            stock,
            price
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [
            code,
            name,
            unit,
            stock || 0,
            price || 0,
        ]
    );

    return getMedicineById(result.rows[0].id);
};

const updateMedicine = async (
    id,
    {
        code,
        name,
        unit,
        stock,
        price,
        is_active,
    }
) => {
    const result = await pool.query(
        `
        UPDATE medicines
        SET
            code = $1,
            name = $2,
            unit = $3,
            stock = $4,
            price = $5,
            is_active = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING id
        `,
        [
            code,
            name,
            unit,
            stock,
            price,
            is_active,
            id,
        ]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return getMedicineById(result.rows[0].id);
};

const deleteMedicine = async (id) => {
    const result = await pool.query(
        `
        UPDATE medicines
        SET
            is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
};

module.exports = {
    getAllMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
};