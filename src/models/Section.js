//src/models/Section.js

const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  mainImage: { type: String }, // مسار الصورة الرئيسية فقط (مثل: /uploads/section1.jpg)
  slug: { type: String, index: true, unique: true, sparse: true },
  isActive: { type: Boolean, default: true }, // للتحكم في النشاط
  extra: { type: mongoose.Schema.Types.Mixed } // metadata إضافية (اختياري)
}, { timestamps: true });

SectionSchema.index({ name: 'text', description: 'text' }); // للبحث النصي

module.exports = mongoose.model('Section', SectionSchema);