const Location = require("../models/Location");

exports.createLocation = async (req, res) => res.json(await Location.create(req.body));
exports.getLocations = async (req, res) => res.json(await Location.find());
exports.getLocationById = async (req, res) => res.json(await Location.findById(req.params.id));
exports.updateLocation = async (req, res) => res.json(await Location.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteLocation = async (req, res) => { await Location.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
