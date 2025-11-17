//src/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { upload, uploadToCloudinary } = require("../middlewares/upload");


// Routes بدون رفع
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);
router.put("/:id/fcm-token", userController.updateFcmToken);
// Route للتحديث مع دعم رفع الصور (profilePic, aboutImages)
router.put("/:id", upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'aboutImages', maxCount: 10 } // حد أقصى 10 صور لـ "من أنا"
 ]), uploadToCloudinary, userController.updateUser);


// Favorites
router.post("/:id/favorites", userController.addFavorite);
router.delete("/:id/favorites/:productId", userController.removeFavorite);

// Cart
router.post("/:id/cart", userController.addToCart);
router.put("/:id/cart/:itemId", userController.updateCartItem);
router.delete("/:id/cart/:itemId", userController.removeFromCart);

module.exports = router;