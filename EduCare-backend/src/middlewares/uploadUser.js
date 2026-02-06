import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/users";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `avatar-${req.user._id}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files allowed"), false);
  } else {
    cb(null, true);
  }
};

const uploadUserAvatar = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 2MB
  fileFilter,
});

export default uploadUserAvatar;
