const bcrypt = require("bcrypt");

const registerModel = require("../models/registerModel");

const ALLOWED_ROLES = [
    "admin",
    "petugas",
    "dokter",
    "perawat",
];

const register = async (req, res) => {
    try {
        const {
            username,
            password,
            full_name,
            role,
        } = req.body;

        // =========================
        // VALIDASI INPUT
        // =========================

        if (!username || !password || !full_name || !role) {
            return res.status(400).json({
                success: false,
                message:
                    "Username, password, full_name, dan role wajib diisi",
            });
        }

        // =========================
        // NORMALISASI INPUT
        // =========================

        const normalizedUsername = username
            .trim()
            .toLowerCase();

        const normalizedFullName = full_name.trim();

        const normalizedRole = role
            .trim()
            .toLowerCase();

        // =========================
        // VALIDASI USERNAME
        // =========================

        if (normalizedUsername.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username minimal 3 karakter",
            });
        }

        // =========================
        // VALIDASI PASSWORD
        // =========================

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter",
            });
        }

        // =========================
        // VALIDASI ROLE
        // =========================

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message:
                    "Role tidak valid. Gunakan admin, petugas, dokter, atau perawat",
            });
        }

        // =========================
        // CEK USERNAME
        // =========================

        const existingUser =
            await registerModel.findUserByUsername(
                normalizedUsername
            );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username sudah digunakan",
            });
        }

        // =========================
        // CEK ROLE
        // =========================

        const roleData =
            await registerModel.findRoleByName(
                normalizedRole
            );

        if (!roleData) {
            return res.status(400).json({
                success: false,
                message: "Role tidak ditemukan di database",
            });
        }

        // =========================
        // HASH PASSWORD
        // =========================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // =========================
        // CREATE USER
        // =========================

        const user = await registerModel.createUser({
            roleId: roleData.id,
            username: normalizedUsername,
            password: hashedPassword,
            fullName: normalizedFullName,
        });

        // =========================
        // RESPONSE
        // =========================

        return res.status(201).json({
            success: true,
            message: "Registrasi berhasil",
            data: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: roleData.name,
                is_active: user.is_active,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error("register:", error);

        // PostgreSQL unique violation
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Username sudah digunakan",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

module.exports = {
    register,
};
