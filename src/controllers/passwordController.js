const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const {
    findUserByEmail,
    createPasswordResetToken,
    findValidPasswordResetToken,
    updateUserPassword,
    markPasswordResetTokenUsed,
} = require("../models/registerModel");

const {
    sendPasswordResetEmail,
} = require("../utils/mailer");

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email wajib diisi",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findUserByEmail(normalizedEmail);

        if (!user) {
            return res.json({
                success: true,
                message:
                    "Jika email terdaftar, link reset password akan dikirim.",
            });
        }

        if (!user.is_active) {
            return res.json({
                success: true,
                message:
                    "Jika email terdaftar, link reset password akan dikirim.",
            });
        }

        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await createPasswordResetToken({
            userId: user.id,
            tokenHash,
            expiresAt,
        });

        const frontendUrl =
            process.env.FRONTEND_URL || "https://simrs-ten.vercel.app";

        const resetUrl =
            `${frontendUrl}/reset-password?token=${token}`;

        console.log("=================================");
        console.log("PASSWORD RESET URL:");
        console.log(resetUrl);
        console.log("=================================");

        await sendPasswordResetEmail({
            to: user.email,
            name: user.full_name,
            resetUrl,
        });

        return res.json({
            success: true,
            message:
                "Jika email terdaftar, link reset password akan dikirim.",
        });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal memproses forgot password",
        });
    }
};


/**
 * RESET PASSWORD
 */
const resetPassword = async (req, res) => {
    try {
        const {
            token,
            password,
        } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token dan password wajib diisi",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter",
            });
        }

        /*
         * Hash token dari frontend.
         */
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        /*
         * Cari token yang:
         * - cocok
         * - belum digunakan
         * - belum expired
         */
        const resetToken =
            await findValidPasswordResetToken(tokenHash);

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message:
                    "Token reset password tidak valid atau sudah kedaluwarsa",
            });
        }

        /*
         * Hash password baru.
         */
        const hashedPassword =
            await bcrypt.hash(password, 10);

        await updateUserPassword({
            userId: resetToken.user_id,
            password: hashedPassword,
        });

        /*
         * Token hanya boleh digunakan satu kali.
         */
        await markPasswordResetTokenUsed(
            resetToken.id
        );

        return res.json({
            success: true,
            message:
                "Password berhasil direset. Silakan login kembali.",
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mereset password",
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
};