const express = require("express");

const router = express.Router();

const {
    getAllRegistrations,
    getRegistrationById,
    getTodayRegistrations,
    createRegistration,
    callRegistration,
    callNextRegistration,
    startRegistration,
    cancelRegistration,
} = require("../controllers/registrationController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const allRoles = [
    "admin",
    "petugas",
    "dokter",
    "perawat",
];

const queueStaffRoles = [
    "admin",
    "petugas",
    "perawat",
];

const doctorRoles = [
    "admin",
    "dokter",
];

router.get(
    "/",
    authenticate,
    authorize(...allRoles),
    getAllRegistrations
);


router.get(
    "/today",
    authenticate,
    authorize(...allRoles),
    getTodayRegistrations
);

router.post(
    "/queue/next",
    authenticate,
    authorize(...queueStaffRoles),
    callNextRegistration
);


router.patch(
    "/:id/call",
    authenticate,
    authorize(...queueStaffRoles),
    callRegistration
);


router.patch(
    "/:id/start",
    authenticate,
    authorize(...doctorRoles),
    startRegistration
);


router.patch(
    "/:id/cancel",
    authenticate,
    authorize(...queueStaffRoles),
    cancelRegistration
);

router.get(
    "/:id",
    authenticate,
    authorize(...allRoles),
    getRegistrationById
);

router.post(
    "/",
    authenticate,
    authorize("admin", "petugas"),
    createRegistration
);

module.exports = router;