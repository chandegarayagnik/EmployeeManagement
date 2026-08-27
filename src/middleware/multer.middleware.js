import fs from "fs";
import multer from "multer";
import path from "path";

// Ensure media directory exists
const mediaDir = "./media";
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, mediaDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "emp-" + uniqueSuffix + ext);
    }
});

// File filter to restrict uploads to image mime types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files (jpg, jpeg, png, gif, webp, svg) are allowed!"));
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
}).fields([
    { name: "empphoto", maxCount: 10 },
    { name: "Img", maxCount: 10 },
    { name: "image", maxCount: 10 },
    { name: "photo", maxCount: 10 }
]);