const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, default: '' },       // اسم المكان
  address: { type: String, default: '' },    // العنوان المفصل
  coords: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined } // [lng, lat]
  },
  note: String
}, { timestamps: true });

LocationSchema.index({ coords: '2dsphere' }); // لدعم البحث الجغرافي

module.exports = mongoose.model('Location', LocationSchema);
