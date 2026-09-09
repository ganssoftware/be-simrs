const medicineModel = require("../models/medicineModel");

const getAllMedicines = async (req, res) => {
    try {
        const medicines =
            await medicineModel.getAllMedicines();

        res.json({
            success: true,
            data: medicines,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data obat",
        });
    }
};

const getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;

        const medicine =
            await medicineModel.getMedicineById(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Obat tidak ditemukan",
            });
        }

        res.json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data obat",
        });
    }
};

const createMedicine = async (req, res) => {
    try {
        const {
            code,
            name,
            unit,
            stock,
            price,
        } = req.body;

        if (!code || !name || !unit) {
            return res.status(400).json({
                success: false,
                message:
                    "code, name, dan unit wajib diisi",
            });
        }

        const medicine =
            await medicineModel.createMedicine({
                code,
                name,
                unit,
                stock,
                price,
            });

        res.status(201).json({
            success: true,
            message: "Obat berhasil ditambahkan",
            data: medicine,
        });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Kode obat sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal menambahkan obat",
        });
    }
};

const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            code,
            name,
            unit,
            stock,
            price,
            is_active,
        } = req.body;

        if (!code || !name || !unit) {
            return res.status(400).json({
                success: false,
                message:
                    "code, name, dan unit wajib diisi",
            });
        }

        const medicine =
            await medicineModel.updateMedicine(id, {
                code,
                name,
                unit,
                stock,
                price,
                is_active,
            });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Obat tidak ditemukan",
            });
        }

        res.json({
            success: true,
            message: "Obat berhasil diperbarui",
            data: medicine,
        });
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Kode obat sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal memperbarui obat",
        });
    }
};

const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;

        const medicine =
            await medicineModel.deleteMedicine(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Obat tidak ditemukan",
            });
        }

        res.json({
            success: true,
            message: "Obat berhasil dinonaktifkan",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal menonaktifkan obat",
        });
    }
};

module.exports = {
    getAllMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
};