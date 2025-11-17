// src/models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  description: { type: String, default: "" },
  slug: { type: String, index: true, sparse: true } // اختياري للروابط
}, { timestamps: true });

// ضمان عدم تكرار اسم التصنيف ضمن نفس القسم
CategorySchema.index({ name: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);
