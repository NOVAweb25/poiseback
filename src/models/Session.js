const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  unavailableDates: [{ type: Date }], // تواريخ كتواريخ بسيطة
  timeSlots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot' }],
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
  mainImage: { type: String },
  images: [{ type: String }],
  capacityPerSlot: { type: Number, default: 1 }, // كم شخص في كل زمن
  active: { type: Boolean, default: true },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
