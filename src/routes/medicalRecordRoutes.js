const express = require("express");

const {
    getAllMedicalRecords,
    getMedicalRecordById,
    getByRegistration,
    createMedicalRecord,
    updateMedicalRecord,
    finishMedicalRecord,
} = require("../controllers/medicalRecordController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Semua role dapat melihat rekam medis
router.get(
    "/",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getAllMedicalRecords
);

// Cari rekam medis berdasarkan pendaftaran
router.get(
    "/registration/:registrationId",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getByRegistration
);

// Detail rekam medis
router.get(
    "/:id",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getMedicalRecordById
);

// Dokter membuat rekam medis
router.post(
    "/",
    authenticate,
    authorize("dokter"),
    createMedicalRecord
);

// Dokter mengubah rekam medis
router.put(
    "/:id",
    authenticate,
    authorize("dokter"),
    updateMedicalRecord
);

// Dokter menyelesaikan pemeriksaan
router.patch(
    "/:id/finish",
    authenticate,
    authorize("dokter"),
    finishMedicalRecord
);

module.exports = router;