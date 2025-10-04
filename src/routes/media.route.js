const express = require("express");
const multer = require("multer");
const cloudinary = require("../../lib/cloudinary");

const router = express.Router();

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload helper
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "", resource_type: "image" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      })
      .end(buffer);
  });

// ==================== Upload Single or Multiple Files ====================
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const { fileIds } = req.body; // optional, old fileIds to delete
    if (fileIds) {
      const idsToDelete = Array.isArray(fileIds) ? fileIds : [fileIds];
      await Promise.all(idsToDelete.map((id) => cloudinary.uploader.destroy(id)));
    }

    const uploadResults = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );

    const files = uploadResults.map((r) => ({ url: r.secure_url, fileId: r.public_id }));

    res.json({ success: true, files });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

module.exports = router;
