const bcrypt = require("bcryptjs");
const {
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByEmail,
    findRoleByName,
    getUserSummary,
    updateUser,
    updateUserProfile,
    updateUserStatus,
} = require("../models/registerModel");

const getUsers = async (req, res) => {
    try {
        const users = await findAllUsers();

        return res.json({
            success: true,
            data: users,
        });

    } catch (error) {
        console.error(
            "GET USERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil data user",
        });
    }
};

const userSummary = async (req, res) => {
    try {
        const summary = await getUserSummary();

        return res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        console.error("USER SUMMARY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil summary user",
        });
    }
};

const editUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            username,
            full_name,
            email,
            role,
            password,
        } = req.body;

        if (
            !username ||
            !full_name ||
            !email ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Username, nama lengkap, email, dan role wajib diisi",
            });
        }

        const existingUser =
            await findUserById(id);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        if (
            username !== existingUser.username
        ) {
            const usernameExists =
                await findUserByUsername(
                    username
                );

            if (
                usernameExists &&
                Number(usernameExists.id) !== Number(id)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Username sudah digunakan",
                });
            }
        }

        const roleData =
            await findRoleByName(role);

        if (!roleData) {
            return res.status(400).json({
                success: false,
                message: "Role tidak ditemukan",
            });
        }

        let hashedPassword = null;

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password minimal 8 karakter",
                });
            }

            hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );
        }

        const updatedUser =
            await updateUser({
                id,
                roleId: roleData.id,
                username,
                email,
                fullName: full_name,
                password: hashedPassword,
            });

        const completeUser =
            await findUserById(
                updatedUser.id
            );

        return res.json({
            success: true,
            message: "User berhasil diperbarui",
            data: completeUser,
        });
    } catch (error) {
        console.error(
            "EDIT USER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui user",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const {
            full_name,
            email,
            password,
        } = req.body;

        if (!full_name) {
            return res.status(400).json({
                success: false,
                message: "Nama lengkap wajib diisi",
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email wajib diisi",
            });
        }

        if (password && password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 6 karakter",
            });
        }

        const existingUser = await findUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        const existingEmail =
            await findUserByEmail(email);

        if (
            existingEmail &&
            Number(existingEmail.id) !== Number(userId)
        ) {
            return res.status(409).json({
                success: false,
                message: "Email sudah digunakan oleh user lain",
            });
        }

        let profilePhoto = existingUser.profile_photo;

        // Upload foto baru ke Supabase Storage
        if (req.file) {
            const supabase = require("../config/supabase");

            const ext = req.file.originalname
                .split(".")
                .pop()
                .toLowerCase();

            const fileName =
                `user-${userId}-${Date.now()}.${ext}`;

            const filePath = `profiles/${fileName}`;

            const { error: uploadError } =
                await supabase.storage
                    .from("uploads")
                    .upload(
                        filePath,
                        req.file.buffer,
                        {
                            contentType: req.file.mimetype,
                            upsert: true,
                        }
                    );

            if (uploadError) {
                console.error(
                    "SUPABASE UPLOAD ERROR:",
                    uploadError
                );

                return res.status(500).json({
                    success: false,
                    message: "Gagal mengupload foto profile",
                });
            }

            const {
                data: publicUrlData,
            } = supabase.storage
                .from("uploads")
                .getPublicUrl(filePath);

            profilePhoto =
                publicUrlData.publicUrl;
        }

        let hashedPassword = null;

        if (password) {
            hashedPassword =
                await bcrypt.hash(password, 12);
        }

        const updatedUser =
            await updateUserProfile({
                id: userId,
                fullName: full_name,
                email,
                profilePhoto,
                password: hashedPassword,
            });

        return res.json({
            success: true,
            message: "Profile berhasil diperbarui",
            data: updatedUser,
        });

    } catch (error) {
        console.error(
            "UPDATE USER PROFILE ERROR:",
            error
        );

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Email sudah digunakan",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui profile",
        });
    }
};

/**
 * UPDATE STATUS USER
 */
const toggleUserStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (
            typeof is_active !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "is_active harus berupa boolean",
            });
        }

        const existingUser =
            await findUserById(id);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        const updatedUser =
            await updateUserStatus({
                id,
                isActive: is_active,
            });

        const completeUser =
            await findUserById(
                updatedUser.id
            );

        return res.json({
            success: true,
            message: is_active
                ? "User berhasil diaktifkan"
                : "User berhasil dinonaktifkan",
            data: completeUser,
        });
    } catch (error) {
        console.error(
            "TOGGLE USER STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengubah status user",
        });
    }
};

module.exports = {
    getUsers,
    userSummary,
    editUser,
    updateProfile,
    toggleUserStatus
};