const express = require("express");

const {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
} = require("../controllers/patientController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("admin", "petugas", "dokter", "perawat"),
    getPatients
);

router.get(
    "/:id",
    authenticate,
    authorize("admin", "petugas", "dokter", "perawat"),
    getPatient
);

router.post(
    "/",
    authenticate,
    authorize("admin", "petugas"),
    createPatient
);

router.put(
    "/:id",
    authenticate,
    authorize("admin", "petugas"),
    updatePatient
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deletePatient
);

module.exports = router;