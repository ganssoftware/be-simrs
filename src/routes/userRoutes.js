const express = require("express");

const {
    getUsers,
    userSummary,
    editUser,
    updateProfile,
    toggleUserStatus
} = require("../controllers/userController");

const {
    forgotPassword,
    resetPassword,
} = require("../controllers/passwordController");

const authenticate =
    require("../middleware/authMiddleware");

const uploadProfile =
    require("../middleware/uploadProfile");

const router = express.Router();

router.get("/", getUsers);
router.get("/summary", userSummary);
router.put("/profile", authenticate, uploadProfile.single("profile_photo"), updateProfile);
router.put("/:id", editUser);
// Forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/:id/status", toggleUserStatus);

module.exports = router;