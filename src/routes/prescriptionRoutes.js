const express = require("express");

const {
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByMedicalRecord,
    createPrescription,
    processPrescription,
    finishPrescription,
} = require("../controllers/prescriptionController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Lihat resep
router.get(
    "/",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getAllPrescriptions
);

router.get(
    "/medical-record/:medicalRecordId",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getPrescriptionsByMedicalRecord
);

router.get(
    "/:id",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getPrescriptionById
);

// Dokter membuat resep
router.post(
    "/",
    authenticate,
    authorize("dokter"),
    createPrescription
);

// Petugas farmasi memproses resep
router.patch(
    "/:id/process",
    authenticate,
    authorize("admin", "petugas"),
    processPrescription
);

// Petugas farmasi menyelesaikan resep
router.patch(
    "/:id/finish",
    authenticate,
    authorize("admin", "petugas"),
    finishPrescription
);

module.exports = router;