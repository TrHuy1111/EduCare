import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/cameras";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `camera-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("video/")) {
    cb(new Error("Only video allowed"), false);
  } else {
    cb(null, true);
  }
};

export const uploadCamera = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});
