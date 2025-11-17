//src/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth"); 
const User = require("../models/User");
// تأكد من الاسم والمسار

// Auth
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .populate({
        path: "cart.product",
        model: "Product",
      })
      .populate("favorites")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// تحديثات الحساب
router.post("/verify-password", authController.verifyPassword);
router.put("/update-username", authController.updateUsername);
router.put("/update-password", authController.updatePassword);



module.exports = router;
