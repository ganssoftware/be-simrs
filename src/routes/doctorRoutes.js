const express = require("express");

const {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
} = require("../controllers/doctorController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize(
        "admin",
        "petugas",
        "dokter",
        "perawat"
    ),
    getDoctors
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
    getDoctor
);

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createDoctor
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateDoctor
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteDoctor
);

module.exports = router;