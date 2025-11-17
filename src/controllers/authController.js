const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  try {
    const { username, firstName, lastName, phone, location, password, role } = req.body;

    // ✅ تحقق من تكرار رقم الجوال
    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res
        .status(400)
        .json({ message: "رقم الجوال مستخدم مسبقًا، لا يمكن إنشاء حساب جديد." });

    // ✅ تحقق من تكرار اسم المستخدم
    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res
        .status(400)
        .json({ message: "اسم المستخدم مستخدم مسبقًا، اختر اسمًا آخر." });

    // ✅ تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ✅ إنشاء الحساب الجديد
    const newUser = await User.create({
      username,
      firstName,
      lastName,
      phone,
      location,
      passwordHash,
      role: role || "client",
    });

    // ✅ الاستجابة النهائية
    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        phone: newUser.phone,
        location: newUser.location,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ خطأ أثناء التسجيل:", err);
    res.status(500).json({ message: "حدث خطأ غير متوقع أثناء التسجيل" });
  }
};



exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // البحث بالاسم أو رقم الجوال
    const user = await User.findOne({
      $or: [{ username }, { phone: username }]
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // إنشاء JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال التوكن + بيانات المستخدم المهمة فقط
    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        location: user.location,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // إذا عندك بلاك ليست (اختياري) حط التوكن فيها
    // حاليا فقط نرجع رسالة نجاح
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("bankDetail");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ التحقق من كلمة المرور (قبل السماح بتعديل الاسم أو كلمة المرور)
exports.verifyPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ message: "كلمة المرور غير صحيحة" });

    res.json({ success: true, message: "تم التحقق من كلمة المرور" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ تحديث اسم المستخدم بعد التحقق من كلمة المرور
exports.updateUsername = async (req, res) => {
  try {
    const { userId, password, newUsername } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ message: "كلمة المرور غير صحيحة" });

    // تحقق من عدم وجود اسم مستخدم مكرر
    const existing = await User.findOne({ username: newUsername });
    if (existing) return res.status(400).json({ message: "اسم المستخدم مستخدم مسبقًا" });

    user.username = newUsername;
    await user.save();

    res.json({ success: true, message: "تم تحديث اسم المستخدم بنجاح", username: newUsername });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ تحديث كلمة المرور (بعد التحقق من اسم المستخدم)
exports.updatePassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "تم تحديث كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

