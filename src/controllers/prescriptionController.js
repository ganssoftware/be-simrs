const prescriptionModel =
    require("../models/prescriptionModel");

const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions =
            await prescriptionModel
                .getAllPrescriptions();

        res.json({
            success: true,
            data: prescriptions,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Gagal mengambil data resep",
        });
    }
};

const getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription =
            await prescriptionModel
                .getPrescriptionById(id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Resep tidak ditemukan",
            });
        }

        res.json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil resep",
        });
    }
};

const getPrescriptionsByMedicalRecord =
    async (req, res) => {
        try {
            const {
                medicalRecordId,
            } = req.params;

            const prescriptions =
                await prescriptionModel
                    .getPrescriptionsByMedicalRecord(
                        medicalRecordId
                    );

            return res.json({
                success: true,
                data: prescriptions,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil resep berdasarkan rekam medis",
            });
        }
    };
    
const createPrescription = async (req, res) => {
    try {
        const {
            medical_record_id,
            items,
        } = req.body;

        if (!medical_record_id) {
            return res.status(400).json({
                success: false,
                message:
                    "medical_record_id wajib diisi",
            });
        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Item resep wajib diisi",
            });
        }

        const prescription =
            await prescriptionModel.createPrescription({
                medical_record_id,
                items,
                userId: req.user.user_id,
            });

        return res.status(201).json({
            success: true,
            message:
                "Resep berhasil dibuat",
            data: prescription,
        });
    } catch (error) {
        console.error(error);

        switch (error.code) {
            case "MEDICAL_RECORD_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message:
                        "Rekam medis tidak ditemukan",
                });

            case "DOCTOR_NOT_ASSIGNED":
                return res.status(403).json({
                    success: false,
                    message:
                        "Anda tidak memiliki akses ke rekam medis ini",
                });

            case "ITEMS_REQUIRED":
                return res.status(400).json({
                    success: false,
                    message:
                        "Item resep wajib diisi",
                });

            case "INVALID_ITEM":
                return res.status(400).json({
                    success: false,
                    message:
                        "Data item resep tidak valid",
                });

            case "MEDICINE_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message:
                        error.message,
                });

            case "MEDICINE_INACTIVE":
                return res.status(400).json({
                    success: false,
                    message:
                        error.message,
                });

            case "INSUFFICIENT_STOCK":
                return res.status(400).json({
                    success: false,
                    message:
                        error.message,
                });

            default:
                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal membuat resep",
                });
        }
    }
};

const processPrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription =
            await prescriptionModel
                .processPrescription(id);

        res.json({
            success: true,
            message:
                "Resep berhasil diproses dan stok obat dikurangi",
            data: prescription,
        });
    } catch (error) {
        console.error(error);

        if (
            error.message ===
            "PRESCRIPTION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Resep tidak ditemukan",
            });
        }

        if (
            error.message ===
            "INVALID_PRESCRIPTION_STATUS"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status resep tidak dapat diproses",
            });
        }

        if (
            error.message ===
            "PRESCRIPTION_EMPTY"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Resep tidak memiliki obat",
            });
        }

        if (
            error.message ===
            "INSUFFICIENT_STOCK"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Stok obat ${error.medicineName} tidak mencukupi. Stok tersedia: ${error.availableStock}`,
            });
        }

        res.status(500).json({
            success: false,
            message:
                "Gagal memproses resep",
        });
    }
};

const finishPrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription =
            await prescriptionModel
                .finishPrescription(id);

        if (!prescription) {
            return res.status(400).json({
                success: false,
                message:
                    "Resep tidak ditemukan atau belum diproses",
            });
        }

        res.json({
            success: true,
            message:
                "Resep berhasil diselesaikan",
            data: prescription,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Gagal menyelesaikan resep",
        });
    }
};

module.exports = {
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByMedicalRecord,
    createPrescription,
    processPrescription,
    finishPrescription,
};