const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => res.json(await Notification.create(req.body));
exports.getNotifications = async (req, res) => res.json(await Notification.find());
exports.getNotificationById = async (req, res) => res.json(await Notification.findById(req.params.id));
exports.markAsRead = async (req, res) => res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true }));
exports.deleteNotification = async (req, res) => { await Notification.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); };
