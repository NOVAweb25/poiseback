const UnavailableDate = require("../models/UnavailableDate");

exports.createUnavailableDate = async (req, res) => res.json(await UnavailableDate.create(req.body));
exports.getUnavailableDates = async (req, res) => res.json(await UnavailableDate.find());
exports.getUnavailableDateById = async (req, res) => res.json(await UnavailableDate.findById(req.params.id));
exports.updateUnavailableDate = async (req, res) => res.json(await UnavailableDate.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteUnavailableDate = async (req, res) => { await UnavailableDate.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
