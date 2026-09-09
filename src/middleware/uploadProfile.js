const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    __dirname,
    "../uploads/profiles"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path
            .extname(file.originalname)
            .toLowerCase();

        const userId = req.user?.user_id || "unknown";

        const filename =
            `user-${userId}-${Date.now()}${ext}`;

        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format foto harus JPG, PNG, atau WEBP"
            ),
            false
        );
    }
};

const uploadProfile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

module.exports = uploadProfile;