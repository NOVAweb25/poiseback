// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const { addReview, getReviews } = require("../controllers/reviewController");

router.post("/", addReview); // إضافة رأي
router.get("/", getReviews);  // جلب الآراء

module.exports = router;
