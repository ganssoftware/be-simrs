const express = require("express");

const {
    getAllMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
} = require("../controllers/medicineController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Semua role dapat melihat obat
router.get(
    "/",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getAllMedicines
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
    getMedicineById
);

// Admin mengelola master obat
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createMedicine
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateMedicine
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteMedicine
);

module.exports = router;