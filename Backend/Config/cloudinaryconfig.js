import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}_${safeName}`);
    },
});

export const uploadFileToCloudinary = async (file) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const filename = path.basename(file.path);
    return {
        secure_url: `${baseUrl}/uploads/${filename}`,
    };
};

export const multerMiddleware = multer({ storage }).single("profilePicture");

export const uploadFileMiddleware = multer({ storage }).single("file");
