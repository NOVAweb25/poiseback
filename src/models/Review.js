// models/Review.js
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true }, // الاسم للعرض
    content: { type: String, required: true },
    rating: { type: Number, default: 5 }, // تقييم من 1 إلى 5 نجوم
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
