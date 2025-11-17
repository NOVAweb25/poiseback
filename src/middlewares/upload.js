const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");

// 🧠 إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 🟢 تخزين مؤقت في السيرفر (محليًا)
const tempDir = path.join(__dirname, "../../temp_uploads");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 🚀 رفع يدوي إلى Cloudinary بعد الحفظ المؤقت
const uploadToCloudinary = async (req, res, next) => {
  try {
    const uploadFile = async (file, folder) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
      });
      // حذف الملف المؤقت بعد الرفع
      fs.unlinkSync(file.path);
      return result.secure_url;
    };

    if (req.file) {
      // 🔹 تحديد المجلد حسب اسم الحقل
      const fieldName = req.file.fieldname;
      let folder = "uploads";

      if (fieldName === "paymentProof") folder = "payment_proofs";
      else if (fieldName === "mainImage") folder = "sections"; // ✅ هذا المجلد الخاص بالأقسام
      else if (fieldName === "profilePic") folder = "users";
      else if (fieldName === "barcode") folder = "bank";

      const url = await uploadFile(req.file, folder);
      req.body[fieldName] = url; // 🔹 حفظ الرابط في req.body بنفس اسم الحقل
    }


    if (req.files) {
      if (req.files.mainImage?.[0])
        req.body.mainImage = await uploadFile(req.files.mainImage[0], "products");

      if (req.files.images)
        req.body.images = await Promise.all(
          req.files.images.map((f) => uploadFile(f, "gallery"))
        );

      if (req.files.profilePic?.[0])
        req.body.profilePic = await uploadFile(req.files.profilePic[0], "users");

      if (req.files.aboutImages)
        req.body.aboutImages = await Promise.all(
          req.files.aboutImages.map((f) => uploadFile(f, "about"))
        );

      if (req.files.barcode?.[0])
        req.body.barcode = await uploadFile(req.files.barcode[0], "bank");

      if (req.files.bankCardImage?.[0])
        req.body.bankCardImage = await uploadFile(req.files.bankCardImage[0], "bank_cards");
    }

    console.log("✅ Uploaded to Cloudinary:", req.body);
    next();
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err);
    return res
      .status(500)
      .json({ error: "فشل رفع الصورة إلى Cloudinary", details: err.message });
  }
};

module.exports = { upload, uploadToCloudinary };
