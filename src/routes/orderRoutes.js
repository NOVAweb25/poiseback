const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { upload, uploadToCloudinary } = require("../middlewares/upload"); 

router.post("/", orderController.createOrder);
router.post(
  "/with-proof",
  upload.single("file"),
  uploadToCloudinary,
  orderController.createOrderWithReceipt
);

router.get("/", orderController.getOrders);
router.get("/user/:userId", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

// رفع إيصال الدفع
router.post("/:id/payment-proof", upload.single('file'),   uploadToCloudinary, orderController.uploadPaymentProof);

module.exports = router;