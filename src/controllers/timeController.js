const TimeSlot = require("../models/TimeSlot");

exports.createTimeSlot = async (req, res) => res.json(await TimeSlot.create(req.body));
exports.getTimeSlots = async (req, res) => res.json(await TimeSlot.find());
exports.getTimeSlotById = async (req, res) => res.json(await TimeSlot.findById(req.params.id));
exports.updateTimeSlot = async (req, res) => res.json(await TimeSlot.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteTimeSlot = async (req, res) => { await TimeSlot.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
