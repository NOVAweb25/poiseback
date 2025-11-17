const Product = require("../models/Product");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");

// 🧠 إعداد Cloudinary من .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log("🔍 Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ موجودة" : "❌ مفقودة",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ موجودة" : "❌ مفقودة",
});


// 🧩 دالة مساعدة لرفع الصور إلى Cloudinary
const uploadToCloudinary = async (file, folder = "products") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "auto",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    fs.unlinkSync(file.path); // نحذف الملف المؤقت بعد الرفع
    return result.secure_url; // نحفظ الرابط النهائي
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    throw err;
  }
};

// ➕ إضافة منتج
exports.createProduct = async (req, res) => {
  try {
    console.log("Received req.body in create:", req.body);
    console.log("Received req.files in create:", req.files);

    const { name, category, section, price, description, stock, isActive } = req.body;

    if (!name?.trim() || !category?.trim() || !section?.trim() || !price?.trim()) {
      return res.status(400).json({ error: "البيانات الأساسية مطلوبة (name, category, section, price)" });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: "السعر يجب أن يكون رقماً إيجابياً" });
    }

    const data = {
      name: name.trim(),
      category,
      section,
      price: Number(price),
      description: description || "",
      stock: Number(stock) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      images: [],
    };

    // 📸 رفع الصورة الرئيسية إلى Cloudinary
    if (req.body.mainImage) data.mainImage = req.body.mainImage;
if (req.body.images) data.images = req.body.images;


    // 🖼️ رفع صور متعددة إلى Cloudinary
   if (req.body.images && Array.isArray(req.body.images)) data.images = req.body.images;


    const product = await Product.create(data);
    const populatedProduct = await Product.findById(product._id).populate("category section");

    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 جلب كل المنتجات
exports.getProducts = async (req, res) => {
  try {
    const { isActive, sectionId, categoryId } = req.query;
    const filters = {};

    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (sectionId) filters.section = sectionId;
    if (categoryId) filters.category = categoryId;

    const products = await Product.find(filters)
      .populate("category section")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔍 جلب منتج واحد
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category section");
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ تحديث منتج
exports.updateProduct = async (req, res) => {
  try {
    console.log("Received req.body in update:", req.body);
    console.log("Received req.files in update:", req.files);

    let { name, category, section, price, description, stock, isActive, deletedImages } = req.body;

    if (!name?.trim() || !category?.trim() || !section?.trim() || !price?.trim()) {
      return res.status(400).json({ error: "البيانات الأساسية مطلوبة (name, category, section, price)" });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: "السعر يجب أن يكون رقماً إيجابياً" });
    }

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return res.status(404).json({ error: "المنتج غير موجود" });

    const updateData = {
      name: name.trim(),
      category,
      section,
      price: Number(price),
      description: description || "",
      stock: Number(stock) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    // 🔄 تحديث الصورة الرئيسية (رفع جديد)
   if (req.body.mainImage) updateData.mainImage = req.body.mainImage;
if (req.body.images) updateData.images = req.body.images;

    // 🧹 حذف صور محددة (من Cloudinary)
    let updatedImages = [...existingProduct.images];

    if (typeof deletedImages === "string") {
      deletedImages = deletedImages.split(",").map((url) => url.trim());
    } else if (!Array.isArray(deletedImages)) {
      deletedImages = [];
    }

    // حذف الصور المحددة من القائمة فقط
    updatedImages = updatedImages.filter((url) => !deletedImages.includes(url));

    // 📤 رفع صور جديدة (إن وُجدت)
    // ✅ فقط استخدمي الروابط التي أرسلها middleware
if (req.body.images && Array.isArray(req.body.images)) {
  updatedImages = [...updatedImages, ...req.body.images];
}


    updateData.images = updatedImages;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("category section");

    res.json(updatedProduct);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ❌ حذف منتج
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

    // 🧹 حذف الصور من Cloudinary (اختياري)
    const extractPublicId = (url) => {
      try {
        const parts = url.split("/");
        const lastPart = parts.pop();
        const [publicId] = lastPart.split(".");
        return parts.slice(-2).join("/") + "/" + publicId;
      } catch {
        return null;
      }
    };

    if (product.mainImage) {
      const publicId = extractPublicId(product.mainImage);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    for (const img of product.images) {
      const publicId = extractPublicId(img);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "تم الحذف بنجاح" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
