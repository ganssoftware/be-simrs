const polyclinicModel = require("../models/polyclinicModel");

const getPolyclinics = async (req, res) => {
    try {
        const data =
            await polyclinicModel.getAllPolyclinics();

        res.status(200).json({
            success: true,
            message: "Data poli berhasil diambil",
            data,
        });
    } catch (error) {
        console.error("getPolyclinics:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data poli",
        });
    }
};

const getPolyclinic = async (req, res) => {
    try {
        const { id } = req.params;

        const data =
            await polyclinicModel.getPolyclinicById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Poli tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("getPolyclinic:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data poli",
        });
    }
};

const createPolyclinic = async (req, res) => {
    try {
        const {
            name,
            description,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Nama poli wajib diisi",
            });
        }

        const data =
            await polyclinicModel.createPolyclinic({
                name,
                description,
            });

        res.status(201).json({
            success: true,
            message: "Poli berhasil ditambahkan",
            data,
        });
    } catch (error) {
        console.error("createPolyclinic:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Nama poli sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal menambahkan poli",
        });
    }
};

const updatePolyclinic = async (req, res) => {
    try {
        const { id } = req.params;

        const existing =
            await polyclinicModel.getPolyclinicById(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Poli tidak ditemukan",
            });
        }

        const {
            name,
            description,
            is_active,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Nama poli wajib diisi",
            });
        }

        const data =
            await polyclinicModel.updatePolyclinic(
                id,
                {
                    name,
                    description,
                    is_active,
                }
            );

        res.status(200).json({
            success: true,
            message: "Data poli berhasil diperbarui",
            data,
        });
    } catch (error) {
        console.error("updatePolyclinic:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Nama poli sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal memperbarui data poli",
        });
    }
};

const deletePolyclinic = async (req, res) => {
    try {
        const { id } = req.params;

        const data =
            await polyclinicModel.deletePolyclinic(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Poli tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Poli berhasil dihapus",
            data,
        });
    } catch (error) {
        console.error("deletePolyclinic:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message:
                    "Poli tidak dapat dihapus karena sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal menghapus poli",
        });
    }
};

module.exports = {
    getPolyclinics,
    getPolyclinic,
    createPolyclinic,
    updatePolyclinic,
    deletePolyclinic,
};