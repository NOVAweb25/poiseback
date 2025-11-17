const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const { upload, uploadToCloudinary } = require("../middlewares/upload");

// 🧾 إنشاء بيانات البنك مع رفع الباركود أو صورة البطاقة البنكية
router.post(
  "/",
  upload.fields([
    { name: "barcode", maxCount: 1 },
    { name: "bankCardImage", maxCount: 1 },
  ]),
  uploadToCloudinary,
  bankController.createBankDetail
);

// 📋 جلب جميع بيانات البنوك
router.get("/", bankController.getBankDetails);

// 🔍 جلب بيانات بنك واحد
router.get("/:id", bankController.getBankDetailById);

// ✏️ تحديث بيانات البنك مع رفع صور جديدة عند الحاجة
router.put(
  "/:id",
  upload.fields([
    { name: "barcode", maxCount: 1 },
    { name: "bankCardImage", maxCount: 1 },
  ]),
  uploadToCloudinary,
  bankController.updateBankDetail
);

// ❌ حذف بيانات البنك
router.delete("/:id", bankController.deleteBankDetail);

module.exports = router;
