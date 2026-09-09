const express = require("express");

const {
    getPolyclinics,
    getPolyclinic,
    createPolyclinic,
    updatePolyclinic,
    deletePolyclinic,
} = require("../controllers/polyclinicController");

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
    getPolyclinics
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
    getPolyclinic
);

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createPolyclinic
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updatePolyclinic
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deletePolyclinic
);

module.exports = router;