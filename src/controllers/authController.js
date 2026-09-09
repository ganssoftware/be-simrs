const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authModel = require("../models/authModel");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username dan password wajib diisi",
            });
        }

        const user = await authModel.findUserByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah",
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Akun tidak aktif",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah",
            });
        }

        const token = jwt.sign(
            {
                user_id: user.id,
                username: user.username,
                role: user.role_name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h",
            }
        );

        res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    profile_photo: user.profile_photo,
                    role: user.role_name,
                },
            },
        });
    } catch (error) {
        console.error("login:", error);

        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

const me = async (req, res) => {
    try {
        const user = await authModel.findUserById(
            req.user.user_id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                profile_photo: user.profile_photo,
                role: user.role_name,
            },
        });
    } catch (error) {
        console.error("me:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data user",
        });
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken =
            req.cookies.simrs_refresh_token;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token tidak ditemukan",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user =
            await authModel.findUserById(
                decoded.user_id
            );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Akun tidak aktif",
            });
        }

        const newAccessToken = jwt.sign(
            {
                user_id: user.id,
                username: user.username,
                role: user.role_name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Token berhasil diperbarui",
            data: {
                token: newAccessToken,
            },
        });

    } catch (error) {
        console.error(
            "refresh:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Refresh token tidak valid atau sudah expired",
        });
    }
};

module.exports = {
    login,
    me,
    refresh
};