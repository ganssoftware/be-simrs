const medicalRecordModel =
    require("../models/medicalRecordModel");

const getAllMedicalRecords = async (
    req,
    res
) => {
    try {
        const records =
            await medicalRecordModel
                .getAllMedicalRecords({
                    userId: req.user.user_id,
                    role: req.user.role,
                });

        res.json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Gagal mengambil data rekam medis",
        });
    }
};

const getMedicalRecordById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const record =
            await medicalRecordModel
                .getMedicalRecordById(id, {
                    userId: req.user.user_id,
                    role: req.user.role,
                });

        if (!record) {
            return res.status(404).json({
                success: false,
                message:
                    "Rekam medis tidak ditemukan",
            });
        }

        res.json({
            success: true,
            data: record,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Gagal mengambil rekam medis",
        });
    }
};

const getByRegistration = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const record =
            await medicalRecordModel
                .getMedicalRecordByRegistrationId(
                    registrationId,
                    {
                        userId: req.user.user_id,
                        role: req.user.role,
                    }
                );

        // Belum ada rekam medis bukan error.
        // Dokter tetap boleh membuat rekam medis baru.
        if (!record) {
            return res.json({
                success: true,
                data: null,
                message: "Rekam medis belum tersedia",
            });
        }

        return res.json({
            success: true,
            data: record,
        });
    } catch (error) {
        console.error("getByRegistration:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil rekam medis",
        });
    }
};

const createMedicalRecord = async (
    req,
    res
) => {
    try {
        const {
            registration_id,
            anamnesis,
            examination,
            diagnosis,
            treatment,
            notes,
        } = req.body;

        if (!registration_id) {
            return res.status(400).json({
                success: false,
                message:
                    "registration_id wajib diisi",
            });
        }

        console.log("=== CREATE MEDICAL RECORD ===");
        console.log("req.user =", req.user);
        console.log("req.user.id =", req.user?.id);
        console.log("req.user.user_id =", req.user?.user_id);
        console.log("registration_id =", registration_id);

        const record =
            await medicalRecordModel
                .createMedicalRecord({
                    registration_id,
                    anamnesis,
                    examination,
                    diagnosis,
                    treatment,
                    notes,

                    // Dari token/login
                    userId: req.user.user_id,
                });

        res.status(201).json({
            success: true,
            message:
                "Rekam medis berhasil dibuat",
            data: record,
        });
    } catch (error) {
        console.error(error);

        if (
            error.message ===
            "REGISTRATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Data pendaftaran tidak ditemukan",
            });
        }

        if (
            error.message ===
            "DOCTOR_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Data dokter tidak ditemukan",
            });
        }

        if (
            error.message ===
            "DOCTOR_NOT_ASSIGNED"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Anda tidak ditugaskan untuk pasien ini",
            });
        }

        if (
            error.message ===
            "MEDICAL_RECORD_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Rekam medis untuk pendaftaran ini sudah ada",
            });
        }

        if (
            error.message ===
            "REGISTRATION_ALREADY_CLOSED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Pendaftaran sudah selesai atau dibatalkan",
            });
        }

        res.status(500).json({
            success: false,
            message:
                "Gagal membuat rekam medis",
        });
    }
};

const updateMedicalRecord = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            anamnesis,
            examination,
            diagnosis,
            treatment,
            notes,
        } = req.body;

        const record =
            await medicalRecordModel
                .updateMedicalRecord(
                    id,
                    {
                        anamnesis,
                        examination,
                        diagnosis,
                        treatment,
                        notes,
                    },
                    {
                        userId: req.user.user_id,
                        role: req.user.role,
                    }
                );

        if (!record) {
            return res.status(404).json({
                success: false,
                message:
                    "Rekam medis tidak ditemukan atau bukan pasien yang ditugaskan kepada Anda",
            });
        }

        res.json({
            success: true,
            message:
                "Rekam medis berhasil diperbarui",
            data: record,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Gagal memperbarui rekam medis",
        });
    }
};

const finishMedicalRecord = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const record =
            await medicalRecordModel
                .finishMedicalRecord(
                    id,
                    {
                        userId: req.user.user_id,
                        role: req.user.role,
                    }
                );

        res.json({
            success: true,
            message:
                "Pemeriksaan berhasil diselesaikan",
            data: record,
        });
    } catch (error) {
        console.error(error);

        if (
            error.message ===
            "MEDICAL_RECORD_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Rekam medis tidak ditemukan",
            });
        }

        if (
            error.message ===
            "DOCTOR_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Data dokter tidak ditemukan",
            });
        }

        if (
            error.message ===
            "DOCTOR_NOT_ASSIGNED"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Anda tidak ditugaskan untuk pasien ini",
            });
        }

        res.status(500).json({
            success: false,
            message:
                "Gagal menyelesaikan pemeriksaan",
        });
    }
};

module.exports = {
    getAllMedicalRecords,
    getMedicalRecordById,
    getByRegistration,
    createMedicalRecord,
    updateMedicalRecord,
    finishMedicalRecord,
};