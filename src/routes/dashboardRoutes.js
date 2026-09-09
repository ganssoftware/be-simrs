const express = require("express");

const router = express.Router();

const {
    getDashboard,
    getTodayQueue,
    getCurrentCalledPatients,
    getTodayByPolyclinic,
    getLowStockMedicines,
    getRegistrationTrend,
} = require("../controllers/dashboardController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const dashboardRoles = [
    "admin",
    "petugas",
    "dokter",
    "perawat",
];


router.get(
    "/",
    authenticate,
    authorize(...dashboardRoles),
    getDashboard
);


router.get(
    "/queue",
    authenticate,
    authorize(...dashboardRoles),
    getTodayQueue
);


router.get(
    "/called",
    authenticate,
    authorize(...dashboardRoles),
    getCurrentCalledPatients
);


router.get(
    "/polyclinics",
    authenticate,
    authorize(...dashboardRoles),
    getTodayByPolyclinic
);


router.get(
    "/low-stock",
    authenticate,
    authorize(...dashboardRoles),
    getLowStockMedicines
);


router.get(
    "/registration-trend",
    authenticate,
    authorize(...dashboardRoles),
    getRegistrationTrend
);


module.exports = router;