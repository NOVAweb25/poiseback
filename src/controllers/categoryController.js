const Category = require("../models/Category");

exports.createCategory = async (req, res) => res.json(await Category.create(req.body));
exports.getCategories = async (req, res) => res.json(await Category.find().populate("section"));
exports.getCategoryById = async (req, res) => res.json(await Category.findById(req.params.id));
exports.updateCategory = async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }));
exports.deleteCategory = async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
