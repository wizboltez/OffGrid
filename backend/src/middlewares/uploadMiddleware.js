import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];
  const ext = path.extname(file.originalname.toLowerCase());
  if (!allowed.includes(ext)) {
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
