const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => res.json(await Booking.create(req.body));
exports.getBookings = async (req, res) => res.json(await Booking.find().populate("user session"));
exports.getBookingById = async (req, res) => res.json(await Booking.findById(req.params.id).populate("user session"));
exports.updateBooking = async (req, res) => res.json(await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteBooking = async (req, res) => { await Booking.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };

// Reschedule
exports.requestReschedule = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { rescheduleRequest: req.body, status: "reschedule_requested" },
    { new: true }
  );
  res.json(booking);
};

exports.respondReschedule = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { rescheduleResponse: req.body, status: req.body.approved ? "reschedule_approved" : "reschedule_rejected" },
    { new: true }
  );
  res.json(booking);
};
