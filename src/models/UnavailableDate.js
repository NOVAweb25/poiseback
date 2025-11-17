const mongoose = require('mongoose');

const UnavailableDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  reason: { type: String, default: '' },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' } // optional link to session
}, { timestamps: true });

UnavailableDateSchema.index({ date: 1, session: 1 }, { unique: false });

module.exports = mongoose.model('UnavailableDate', UnavailableDateSchema);
