const Survey = require("../models/Survey");

exports.createSurvey = async (req, res) => res.json(await Survey.create(req.body));
exports.getSurveys = async (req, res) => res.json(await Survey.find());
exports.getSurveyById = async (req, res) => res.json(await Survey.findById(req.params.id));
exports.updateSurvey = async (req, res) => res.json(await Survey.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteSurvey = async (req, res) => { await Survey.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
