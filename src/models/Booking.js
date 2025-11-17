const mongoose = require('mongoose');

const RescheduleSchema = new mongoose.Schema({
  requestedDate: Date,
  requestedTimeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot' },
  reason: String,
  adminNote: String,
  approved: { type: Boolean },
  respondedAt: Date
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
  status: {
    type: String,
    enum: ['pending_payment','pending_review','confirmed','attended','reschedule_requested','reschedule_rejected','rescheduled','cancelled'],
    default: 'pending_payment'
  },
  rescheduleRequest: RescheduleSchema,
  notes: String,
  createdByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

BookingSchema.index({ session: 1, date: 1, timeSlot: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
