const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const admin = require("../../firebase");
const { v2: cloudinary } = require("cloudinary");
const Product = require("../models/Product");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.createOrder = async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const nextNum = lastOrder && lastOrder.orderNumber ? parseInt(lastOrder.orderNumber) + 1 : 1;
    const orderNumber = nextNum.toString().padStart(6, "0");

    // إنشاء الطلب
    const order = await Order.create({
      ...req.body,
      orderNumber,
      status: "بانتظار تأكيد الطلب",
    });
await User.findByIdAndUpdate(parsedData.user, { cart: [] });
    // 🟢 إنشاء إشعار في قاعدة البيانات
    await Notification.create({
      toRole: "admin", // 🔹 لكل المسؤولين
      title: "📦 طلب جديد بانتظار التأكيد",
      body: `طلب رقم ${order.orderNumber} من ${order.shipping?.name || "عميل"}`,
      meta: { orderId: order._id, orderNumber: order.orderNumber },
    });

    // 🟣 إرسال إشعار Firebase لكل المسؤولين
    const admins = await User.find({
      role: "admin",
      fcmToken: { $exists: true, $ne: null },
    });

    for (const adminUser of admins) {
      const message = {
        token: adminUser.fcmToken,
        notification: {
          title: "📦 طلب جديد بانتظار التأكيد",
          body: `طلب رقم ${order.orderNumber} من ${order.shipping?.name || "عميل"}`,
        },
        data: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          type: "new_order",
        },
      };

      try {
        await admin.messaging().send(message);
        console.log(`✅ تم إرسال إشعار إلى ${adminUser.firstName || "Admin"}`);
      } catch (e) {
        console.error(`⚠️ فشل إرسال الإشعار للمسؤول ${adminUser._id}:`, e);
      }
    }

    res.json(order);
  } catch (err) {
    console.error("❌ خطأ أثناء إنشاء الطلب:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  let query = Order.find()
    .populate("items.product")
    .populate('user', 'firstName lastName phone');

  if (req.query.status) query = query.where('status').equals(req.query.status);
  if (req.query.orderNumber) query = query.where('orderNumber').equals(req.query.orderNumber);
  if (req.query.name) query = query.where('shipping.name').regex(new RegExp(req.query.name, 'i'));
  if (req.query.phone) query = query.where('shipping.phone').equals(req.query.phone);

 const orders = await query.sort({ createdAt: -1 }).exec();

  res.json(orders);
};

exports.getUserOrders = async (req, res) => {
  let query = Order.find({ user: req.params.userId }).populate("items.product");

  if (req.query.status) query = query.where('status').equals(req.query.status);
  if (req.query.orderNumber) query = query.where('orderNumber').equals(req.query.orderNumber);

  const orders = await query.exec();
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  res.json(order);
};

exports.updateOrder = async (req, res) => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    const updates = { ...req.body };

    const noteAllowedStatuses = ["تم تأكيد الطلب", "تم رفض الطلب"];
    if (!noteAllowedStatuses.includes(req.body.status)) {
      delete updates.adminNote;
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate("user");

    // ✅ إرسال إشعار عند تغيير الحالة
    if (req.body.status && req.body.status !== oldOrder.status) {
      const user = await User.findById(updated.user);

      // 🟢 حفظ الإشعار في قاعدة البيانات
      await Notification.create({
        toUser: user._id,
        title: "📦 تحديث حالة الطلب",
        body: `تم تحديث حالة الطلب رقم ${updated.orderNumber} إلى: ${req.body.status}`,
        meta: {
          orderId: updated._id,
          orderNumber: updated.orderNumber,
          newStatus: req.body.status,
        },
      });

      // 🔸 إرسال إشعار FCM إذا المستخدم عنده توكن
      if (user?.fcmToken) {
        const message = {
          token: user.fcmToken,
          notification: {
            title: "📦 تم تحديث حالة طلبك",
            body: `تم تحديث حالة الطلب رقم ${updated.orderNumber} إلى: ${req.body.status}`,
          },
          data: {
            orderId: updated._id.toString(),
            status: req.body.status,
            type: "order_update",
          },
        };

        await admin.messaging().send(message);
        console.log(`✅ إشعار أُرسل للمستخدم ${user.firstName} (${req.body.status})`);
      } else {
        console.log(`⚠️ المستخدم ${updated.user} لا يملك fcmToken`);
      }
    }
// =============================
// ✨ خصم المخزون عند تأكيد الطلب
// =============================
if (req.body.status === "تم تأكيد الطلب" && oldOrder.status !== "تم تأكيد الطلب") {
  console.log("🔻 بدء خصم المخزون للطلب:", oldOrder.orderNumber);

  for (const item of oldOrder.items) {
    const product = await Product.findById(item.product);

    if (!product) continue;

    // تأكد أن المخزون يكفي
    if (product.stock < item.quantity) {
      return res.status(400).json({
        error: `المخزون غير كافٍ للمنتج: ${product.name}`,
      });
    }

    product.stock -= item.quantity; // خصم الكمية
    await product.save();
  }

  console.log("✅ تم خصم المخزون بنجاح");
}

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

exports.uploadPaymentProof = async (req, res) => {
  try {
    // ✅ التأكد أن Cloudinary رفع الملف فعلاً
    const proofUrl = req.body.paymentProof || req.body.file;
    if (!proofUrl || !proofUrl.startsWith("http")) {
      return res.status(400).json({ error: "لم يتم رفع الإيصال بنجاح إلى Cloudinary" });
    }

    // ✅ حفظ الرابط في قاعدة البيانات فقط
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentProof: proofUrl,
        status: "بانتظار تأكيد الطلب",
      },
      { new: true }
    );

    console.log("✅ إيصال محفوظ في الطلب:", proofUrl);
    res.json(order);
  } catch (err) {
    console.error("❌ Error saving payment proof:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createOrderWithReceipt = async (req, res) => {
  try {
    // 1) تأكد من وجود ملف إيصال
   const cloudUrl = req.cloudinaryUrl || req.body.paymentProof || req.body.file;

if (!cloudUrl || !cloudUrl.startsWith("http")) {
  return res.status(400).json({
    error: "لم يتم رفع الإيصال. يرجى المحاولة مرة أخرى."
  });
}


    // 2) استقبل بيانات الطلب من الـ body
    const { orderData } = req.body;

    if (!orderData) {
      return res.status(400).json({ error: "بيانات الطلب ناقصة" });
    }

    const parsedData = JSON.parse(orderData);

    // 3) جهّز رقم الطلب
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const nextNum = lastOrder?.orderNumber
      ? parseInt(lastOrder.orderNumber) + 1
      : 1;

    const orderNumber = nextNum.toString().padStart(6, "0");

    // 4) إنشاء الطلب
    const order = await Order.create({
      ...parsedData,
      orderNumber,
      paymentProof: req.cloudinaryUrl,
      status: "بانتظار تأكيد الطلب"
    });

    // 5) إرسال إشعار للإدارة
    await Notification.create({
      toRole: "admin",
      title: "🧾 طلب جديد بانتظار التأكيد",
      body: `طلب رقم ${order.orderNumber} من ${order.shipping?.name || "عميل"}`,
      meta: { orderId: order._id, orderNumber: order.orderNumber }
    });

    // 6) إرسال إشعار FCM للإدارة
    const admins = await User.find({
      role: "admin",
      fcmToken: { $exists: true, $ne: null }
    });

    for (const adminUser of admins) {
      try {
        await admin.messaging().send({
          token: adminUser.fcmToken,
          notification: {
            title: "📦 طلب جديد",
            body: `طلب رقم ${order.orderNumber}`
          },
          data: { orderId: order._id.toString() }
        });
      } catch (err) {
        console.error("فشل إرسال إشعار:", err);
      }
    }

    res.json({
      message: "تم إنشاء الطلب بنجاح",
      order
    });

  } catch (err) {
    console.error("❌ createOrderWithProof Error:", err);
    res.status(500).json({ error: err.message });
  }
};

