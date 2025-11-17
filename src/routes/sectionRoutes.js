//src/routes/sectionRoutes.js

const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middlewares/upload");
const sectionController = require("../controllers/sectionController");

// middleware للتحقق من المسؤول (عدله حسب auth عندك، مثل JWT)
const requireAdmin = (req, res, next) => {
  // مثال: if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: "غير مصرح لك" });
  next(); // أو أضف التحقق الحقيقي هنا
};

// POST: إنشاء قسم مع صورة رئيسية واحدة
router.post(
  "/",
  requireAdmin,
  upload.single("mainImage"),
 uploadToCloudinary,
  sectionController.createSection
);

// GET: جلب كل الأقسام (عام للجميع)
router.get("/", sectionController.getSections);

// GET: جلب قسم واحد
router.get("/:id", sectionController.getSectionById);

// PUT: تحديث قسم (مع صورة رئيسية اختيارية)
router.put(
  "/:id",
  requireAdmin,
  upload.single("mainImage"),
  uploadToCloudinary,
  sectionController.updateSection
);

// DELETE: حذف قسم
router.delete("/:id", requireAdmin, sectionController.deleteSection);

module.exports = router;