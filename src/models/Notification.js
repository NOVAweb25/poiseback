const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  body: String,
  meta: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ toUser: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
