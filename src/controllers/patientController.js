const patientModel = require("../models/patientModel");

const getPatients = async (req, res) => {
    try {
        const patients = await patientModel.getAllPatients();

        res.status(200).json({
            success: true,
            message: "Data pasien berhasil diambil",
            data: patients,
        });
    } catch (error) {
        console.error("getPatients:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data pasien",
        });
    }
};

const getPatient = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await patientModel.getPatientById(id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Pasien tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Data pasien berhasil diambil",
            data: patient,
        });
    } catch (error) {
        console.error("getPatient:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data pasien",
        });
    }
};

const createPatient = async (req, res) => {
    try {
        const {
            medical_record_number,
            full_name,
            gender,
        } = req.body;

        if (!medical_record_number || !full_name || !gender) {
            return res.status(400).json({
                success: false,
                message:
                    "Nomor rekam medis, nama lengkap, dan jenis kelamin wajib diisi",
            });
        }

        const patient = await patientModel.createPatient(req.body);

        res.status(201).json({
            success: true,
            message: "Pasien berhasil ditambahkan",
            data: patient,
        });
    } catch (error) {
        console.error("createPatient:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message:
                    "Nomor rekam medis atau NIK sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal menambahkan pasien",
        });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPatient =
            await patientModel.getPatientById(id);

        if (!existingPatient) {
            return res.status(404).json({
                success: false,
                message: "Pasien tidak ditemukan",
            });
        }

        const patient = await patientModel.updatePatient(
            id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Data pasien berhasil diperbarui",
            data: patient,
        });
    } catch (error) {
        console.error("updatePatient:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "NIK sudah digunakan",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal memperbarui data pasien",
        });
    }
};

const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await patientModel.deletePatient(id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Pasien tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Pasien berhasil dihapus",
            data: patient,
        });
    } catch (error) {
        console.error("deletePatient:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message:
                    "Pasien tidak dapat dihapus karena sudah memiliki data terkait",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal menghapus pasien",
        });
    }
};

module.exports = {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
};