const Section = require("../models/Section");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// 🧠 إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 🧩 دالة مساعدة لرفع الصور
const uploadToCloudinary = async (file, folder = "sections") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    fs.unlinkSync(file.path); // نحذف الملف المؤقت بعد الرفع
    return result.secure_url;
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    throw err;
  }
};

// ➕ إضافة قسم جديد
exports.createSection = async (req, res) => {
  try {
    const { name, description, slug, isActive, extra, mainImage } = req.body;

    if (!name) {
      return res.status(400).json({ error: "اسم القسم مطلوب" });
    }

    const data = {
      name,
      description: description || "",
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      isActive: isActive !== undefined ? isActive : true,
      extra: extra ? JSON.parse(extra) : {},
      mainImage: mainImage || null, // ✅ هنا أخذنا الرابط من req.body
    };

    const section = await Section.create(data);
    res.status(201).json(section);
  } catch (err) {
    console.error("❌ Create section error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 📜 جميع الأقسام (مع فلترة الـ active)
exports.getSections = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const sections = await Section.find(query).sort({ createdAt: -1 });
    res.json(sections);
  } catch (err) {
    console.error("❌ Get sections error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔍 قسم واحد
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "القسم غير موجود" });
    res.json(section);
  } catch (err) {
    console.error("❌ Get section by ID error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✏️ تحديث قسم
exports.updateSection = async (req, res) => {
  try {
    const { name, description, slug, isActive, extra, mainImage } = req.body;

    if (!name) {
      return res.status(400).json({ error: "اسم القسم مطلوب" });
    }

    const updateData = {
      name,
      description: description || "",
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      isActive: isActive !== undefined ? isActive : true,
      extra: extra ? JSON.parse(extra) : {},
    };

    // ✅ استخدم الرابط من req.body بدل متغير مفقود
    if (mainImage) updateData.mainImage = mainImage;

    const section = await Section.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!section) return res.status(404).json({ error: "القسم غير موجود" });
    res.json(section);
  } catch (err) {
    console.error("❌ Update section error:", err);
    res.status(500).json({ error: err.message });
  }
};
// ❌ حذف قسم
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "القسم غير موجود" });

    // 🧹 حذف الصورة من Cloudinary إن وُجدت
    if (section.mainImage) {
      try {
        // استخراج الـ public_id من الرابط
        const parts = section.mainImage.split("/");
        const fileName = parts.pop();
        const [publicId] = fileName.split(".");
        const folder = parts.slice(-2).join("/");
        const fullPublicId = `${folder}/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId);
        console.log("🧹 Deleted image from Cloudinary:", fullPublicId);
      } catch (e) {
        console.warn("⚠️ Failed to delete image from Cloudinary:", e);
      }
    }

    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "تم الحذف بنجاح" });
  } catch (err) {
    console.error("❌ Delete section error:", err);
    res.status(500).json({ error: err.message });
  }
};
