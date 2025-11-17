const Setting = require("../models/Setting");

exports.createSetting = async (req, res) => res.json(await Setting.create(req.body));
exports.getSettings = async (req, res) => res.json(await Setting.find());
exports.getSettingById = async (req, res) => res.json(await Setting.findById(req.params.id));
exports.updateSetting = async (req, res) => res.json(await Setting.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteSetting = async (req, res) => { await Setting.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
