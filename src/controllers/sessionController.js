const Session = require("../models/Session");

exports.createSession = async (req, res) => res.json(await Session.create(req.body));
exports.getSessions = async (req, res) => res.json(await Session.find().populate("section category survey"));
exports.getSessionById = async (req, res) => res.json(await Session.findById(req.params.id).populate("section category survey"));
exports.updateSession = async (req, res) => res.json(await Session.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteSession = async (req, res) => { await Session.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
