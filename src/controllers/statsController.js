const User = require("../models/User");
const Order = require("../models/Order");
const Booking = require("../models/Booking");

// helper لتحويل فترة الأيام إلى تاريخ بداية
const getStartDate = (range) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(today.getTime() - range * 24 * 60 * 60 * 1000);
};

exports.getStats = async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const startDate = getStartDate(parseInt(range));

    // 📊 إجماليات المستخدمين والحجوزات
    const users = await User.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });

    // 📦 إجماليات الطلبات حسب الحالة
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: "تم التسليم" });
    const cancelledOrders = await Order.countDocuments({ status: "تم رفض الطلب" });
    const pendingOrders = await Order.countDocuments({ status: "بانتظار تأكيد الطلب" });

    // 🧮 حساب النسب المئوية
    const deliveredPercentage = totalOrders
      ? ((deliveredOrders / totalOrders) * 100).toFixed(1)
      : 0;
    const cancelledPercentage = totalOrders
      ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
      : 0;

    // 📈 نمو المستخدمين (مثلاً آخر 30 يوم)
    const aggregation = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const userGrowth = aggregation.map((item) => ({
      date: item._id,
      users: item.count,
    }));

    // 📦 إرسال النتائج
    res.json({
      users,
      confirmedBookings,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      deliveredPercentage,
      cancelledPercentage,
      userGrowth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
