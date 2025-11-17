// controllers/reviewController.js
const Review = require("../models/Review");
const User = require("../models/User");

// إضافة رأي جديد
exports.addReview = async (req, res) => {
  try {
    const { userId, content, rating } = req.body;

    // جلب بيانات المستخدم من قاعدة البيانات
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userName = `${user.firstName} ${user.lastName}`; // الاسم الكامل

    const review = await Review.create({ userId, userName, content, rating });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding review" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};
