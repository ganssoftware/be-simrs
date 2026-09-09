const doctorModel = require("../models/doctorModel");

const getDoctors = async (req, res) => {
    try {
        const data =
            await doctorModel.getAllDoctors();

        res.status(200).json({
            success: true,
            message: "Data dokter berhasil diambil",
            data,
        });
    } catch (error) {
        console.error("getDoctors:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data dokter",
        });
    }
};

const getDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const data =
            await doctorModel.getDoctorById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Dokter tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("getDoctor:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data dokter",
        });
    }
};

const createDoctor = async (req, res) => {
    try {
        const {
            user_id,
            full_name,
            specialization,
            phone,
            polyclinic_id,
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User dokter wajib dipilih",
            });
        }

        if (!full_name) {
            return res.status(400).json({
                success: false,
                message: "Nama dokter wajib diisi",
            });
        }

        if (!polyclinic_id) {
            return res.status(400).json({
                success: false,
                message: "Poliklinik wajib dipilih",
            });
        }

        const doctorUser =
            await doctorModel.findDoctorUser(user_id);

        if (!doctorUser) {
            return res.status(400).json({
                success: false,
                message:
                    "User tidak ditemukan atau bukan user dengan role dokter",
            });
        }

        const data =
            await doctorModel.createDoctor({
                user_id,
                full_name,
                specialization,
                phone,
                polyclinic_id,
            });

        return res.status(201).json({
            success: true,
            message: "Dokter berhasil ditambahkan",
            data,
        });

    } catch (error) {
        console.error("createDoctor:", error);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message:
                    "User atau poliklinik tidak ditemukan",
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message:
                    "Dokter sudah terdaftar di poliklinik tersebut",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan dokter",
        });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const existing =
            await doctorModel.getDoctorById(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Dokter tidak ditemukan",
            });
        }

        const {
            full_name,
            specialization,
            phone,
            polyclinic_id,
            is_active,
        } = req.body;

        if (!full_name) {
            return res.status(400).json({
                success: false,
                message: "Nama dokter wajib diisi",
            });
        }

        const data =
            await doctorModel.updateDoctor(
                id,
                {
                    full_name,
                    specialization,
                    phone,
                    polyclinic_id,
                    is_active,
                }
            );

        res.status(200).json({
            success: true,
            message: "Data dokter berhasil diperbarui",
            data,
        });
    } catch (error) {
        console.error("updateDoctor:", error);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Poliklinik tidak ditemukan",
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message:
                    "Dokter sudah terdaftar di poliklinik tersebut",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal memperbarui data dokter",
        });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const data =
            await doctorModel.deleteDoctor(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Dokter tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Dokter berhasil dihapus",
            data,
        });
    } catch (error) {
        console.error("deleteDoctor:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message:
                    "Dokter tidak dapat dihapus karena sudah memiliki data terkait",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal menghapus dokter",
        });
    }
};

module.exports = {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
};