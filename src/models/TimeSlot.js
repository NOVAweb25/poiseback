const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "09:00", "09:00 AM"
  hour: { type: Number, required: true, min: 0, max: 23 },
  minute: { type: Number, required: true, min: 0, max: 59 },
  period: { type: String, enum: ['AM','PM'], required: false },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

TimeSlotSchema.index({ hour: 1, minute: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);
