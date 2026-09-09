const registrationModel = require("../models/registrationModel");

const getAllRegistrations = async (req, res) => {
    try {
        const registrations =
            await registrationModel.getAllRegistrations();

        res.json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data pendaftaran",
        });
    }
};

const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;

        const registration =
            await registrationModel.getRegistrationById(id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Data pendaftaran tidak ditemukan",
            });
        }

        res.json({
            success: true,
            data: registration,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data pendaftaran",
        });
    }
};

const getTodayRegistrations = async (req, res) => {
    try {
        const { polyclinic_id } = req.query;

        const registrations =
            await registrationModel.getTodayRegistrations(
                polyclinic_id || null
            );

        res.json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil antrean hari ini",
        });
    }
};

const createRegistration = async (req, res) => {
    try {
        const {
            patient_id,
            doctor_id,
            polyclinic_id,
            complaint,
            visit_type,
        } = req.body;

        if (
            !patient_id ||
            !doctor_id ||
            !polyclinic_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "patient_id, doctor_id, dan polyclinic_id wajib diisi",
            });
        }

        if (
            visit_type &&
            !["baru", "lama"].includes(visit_type)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "visit_type harus 'baru' atau 'lama'",
            });
        }

        const registration =
            await registrationModel.createRegistration({
                patient_id,
                doctor_id,
                polyclinic_id,
                complaint,
                visit_type,
                registered_by: req.user.user_id,
            });

        res.status(201).json({
            success: true,
            message: "Pendaftaran berhasil",
            data: registration,
        });
    } catch (error) {
        console.error(error);

        if (error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Pasien tidak ditemukan",
            });
        }

        if (error.message === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message:
                    "Dokter tidak ditemukan atau tidak aktif",
            });
        }

        if (
            error.message ===
            "DOCTOR_POLYCLINIC_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Dokter tidak berada di poliklinik yang dipilih",
            });
        }

        if (error.message === "POLYCLINIC_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message:
                    "Poliklinik tidak ditemukan atau tidak aktif",
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message:
                    "Nomor antrean sudah digunakan, silakan coba lagi",
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal melakukan pendaftaran",
        });
    }
};

const callRegistration = async (req, res) => {
    try {
        const registration = await registrationModel.callRegistration(
            req.params.id
        );

        return res.json({
            success: true,
            message: "Pasien berhasil dipanggil",
            data: registration,
        });
    } catch (error) {
        console.error("callRegistration:", error);

        if (error.message === "REGISTRATION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Registrasi tidak ditemukan",
            });
        }

        if (error.message === "INVALID_STATUS_FOR_CALL") {
            return res.status(400).json({
                success: false,
                message:
                    "Pasien tidak dapat dipanggil karena status bukan menunggu",
            });
        }

        if (error.message === "PATIENT_ALREADY_CALLED") {
            return res.status(409).json({
                success: false,
                message:
                    "Masih ada pasien yang sedang dipanggil pada poli ini",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Gagal memanggil pasien",
        });
    }
};


const callNextRegistration = async (req, res) => {
    try {
        const { polyclinic_id, doctor_id } = req.body;

        if (!polyclinic_id) {
            return res.status(400).json({
                success: false,
                message: "polyclinic_id wajib diisi",
            });
        }

        if (!doctor_id) {
            return res.status(400).json({
                success: false,
                message: "doctor_id wajib diisi",
            });
        }

        const registration =
            await registrationModel.callNextRegistration(
                polyclinic_id,
                doctor_id
            );

        return res.json({
            success: true,
            message: "Pasien berhasil dipanggil",
            data: registration,
        });
    } catch (error) {
        console.error(
            "callNextRegistration error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const startRegistration = async (req, res) => {
    try {
        const registration =
            await registrationModel.startRegistration(
                req.params.id
            );

        return res.json({
            success: true,
            message: "Pemeriksaan berhasil dimulai",
            data: registration,
        });
    } catch (error) {
        console.error("startRegistration:", error);

        if (error.message === "REGISTRATION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Registrasi tidak ditemukan",
            });
        }

        if (error.message === "INVALID_STATUS_FOR_START") {
            return res.status(400).json({
                success: false,
                message:
                    "Pasien harus berstatus dipanggil sebelum pemeriksaan dimulai",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Gagal memulai pemeriksaan",
        });
    }
};


const cancelRegistration = async (req, res) => {
    try {
        const registration =
            await registrationModel.cancelRegistration(
                req.params.id
            );

        return res.json({
            success: true,
            message: "Antrean berhasil dibatalkan",
            data: registration,
        });
    } catch (error) {
        console.error("cancelRegistration:", error);

        if (error.message === "REGISTRATION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Registrasi tidak ditemukan",
            });
        }

        if (error.message === "INVALID_STATUS_FOR_CANCEL") {
            return res.status(400).json({
                success: false,
                message:
                    "Antrean tidak dapat dibatalkan karena statusnya tidak sesuai",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Gagal membatalkan antrean",
        });
    }
};

module.exports = {
    getAllRegistrations,
    getRegistrationById,
    getTodayRegistrations,
    createRegistration,
    callRegistration,
    callNextRegistration,
    startRegistration,
    cancelRegistration,
};