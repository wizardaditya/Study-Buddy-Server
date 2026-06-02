const router = require("express").Router();
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");
const { authenticate } = require("../middleware/auth.middleware");
const { sendSuccess, sendError } = require("../utils/response.utils");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post("/image", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return sendError(res, "No file uploaded", 400);
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "study-buddy",
      resource_type: "image",
    });
    return sendSuccess(res, { url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    return sendError(res, "Upload failed", 500);
  }
});

module.exports = router;
