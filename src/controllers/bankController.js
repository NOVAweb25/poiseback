const BankDetail = require("../models/BankDetail");
const { createWorker } = require("tesseract.js");
const path = require("path");

// 🧩 دالة مساعدة لتنظيف الأرقام
const cleanNumbers = (text) => (text ? text.replace(/\D/g, "") : "");

// 🏦 دالة لتخمين اسم البنك من الآيبان أو النص
const detectBankName = (ibanOrText = "") => {
  const knownBanks = {
    SA03: "الأهلي",
    SA04: "الراجحي",
    SA05: "الرياض",
    SA06: "ساب",
    SA07: "البنك الفرنسي",
    SA08: "البلاد",
    SA09: "الجزيرة",
    SA10: "الإنماء",
  };

  const prefix = ibanOrText.substring(0, 4).toUpperCase();
  if (knownBanks[prefix]) return knownBanks[prefix];

  const banksByText = [
    "الأهلي",
    "الراجحي",
    "الرياض",
    "ساب",
    "البنك الفرنسي",
    "البلاد",
    "الجزيرة",
    "الإنماء",
    "Ahli",
    "Rajhi",
    "Riyad",
    "SAB",
    "Fransi",
  ];
  const found = banksByText.find((b) => ibanOrText.includes(b));
  return found || "غير محدد";
};

// 🟢 إنشاء حساب بنكي جديد
exports.createBankDetail = async (req, res) => {
  try {
    let ownerName = req.body.ownerName?.trim();
    let iban = req.body.iban?.replace(/\s/g, "").toUpperCase();
    let accountNumber = cleanNumbers(req.body.accountNumber);
    let barcode = req.body.barcode || "";
    let bankCardImage = req.body.bankCardImage || "";
    let bankName = req.body.bankName?.trim() || "";

    // ✅ تحقق من صحة الآيبان
    if (iban && !/^SA\d{22}$/.test(iban)) {
      return res.status(400).json({
        message:
          "رقم الآيبان يجب أن يبدأ بـ SA ويتكون من 24 خانة (SA + 22 رقم).",
      });
    }

    // ✅ تحقق من رقم الحساب
    if (accountNumber && accountNumber.length > 21) {
      return res.status(400).json({
        message: "رقم الحساب يجب ألا يتجاوز 21 رقمًا.",
      });
    }

    // ✅ اكتشاف اسم البنك تلقائيًا من الآيبان
    if (!bankName && iban) {
      bankName = detectBankName(iban);
    }

    // 🧠 تحليل النص من صورة البطاقة (OCR)
    if (bankCardImage && !bankCardImage.endsWith(".svg")) {
      try {
        const worker = await createWorker("eng+ara");

        const imageSource = bankCardImage.startsWith("http")
          ? bankCardImage // Cloudinary
          : path.join(__dirname, "..", "..", bankCardImage); // مسار محلي

        const {
          data: { text },
        } = await worker.recognize(imageSource);
        await worker.terminate();

        const cleanedText = text.replace(/\s/g, "");
        const lines = text.split("\n");

        // 🔍 استخراج البيانات من الصورة
        const ibanMatch = cleanedText.match(/SA\d{22}/);
        if (ibanMatch && !iban) iban = ibanMatch[0];

        const accountMatch = cleanedText.match(/\d{10,21}/);
        if (accountMatch && !accountNumber) accountNumber = accountMatch[0];

        const nameLine = lines.find(
          (line) =>
            line.trim() &&
            line.match(/[\u0600-\u06FFA-Z ]+/i) &&
            line.split(/\s+/).length > 1
        );
        if (nameLine && !ownerName) ownerName = nameLine.trim();

        if (!bankName) {
          bankName = detectBankName(text);
        }
      } catch (ocrErr) {
        console.error("⚠️ OCR failed:", ocrErr);
      }
    }

    // 💾 إنشاء السجل الجديد
    const detail = new BankDetail({
      ownerName,
      iban,
      accountNumber,
      bankName,
      barcode,
      bankCardImage,
    });

    await detail.save();
    res.json(detail);
  } catch (err) {
    console.error("❌ Error in createBankDetail:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟡 تحديث بيانات البنك
exports.updateBankDetail = async (req, res) => {
  try {
    let data = {
      ownerName: req.body.ownerName?.trim(),
      iban: req.body.iban?.replace(/\s/g, "").toUpperCase(),
      accountNumber: cleanNumbers(req.body.accountNumber),
      bankName: req.body.bankName?.trim() || "",
      barcode: req.body.barcode,
      bankCardImage: req.body.bankCardImage,
    };

    if (data.iban && !/^SA\d{22}$/.test(data.iban)) {
      return res.status(400).json({
        message:
          "رقم الآيبان يجب أن يبدأ بـ SA ويتكون من 24 خانة (SA + 22 رقم).",
      });
    }

    if (data.accountNumber && data.accountNumber.length > 21) {
      return res.status(400).json({
        message: "رقم الحساب يجب ألا يتجاوز 21 رقمًا.",
      });
    }

    if (!data.bankName && data.iban) {
      data.bankName = detectBankName(data.iban);
    }

    // 🧠 تحليل الصورة من جديد إذا تم رفعها
    if (data.bankCardImage && !data.bankCardImage.endsWith(".svg")) {
      try {
        const worker = await createWorker("eng+ara");

        const imageSource = data.bankCardImage.startsWith("http")
          ? data.bankCardImage
          : path.join(__dirname, "..", "..", data.bankCardImage);

        const {
          data: { text },
        } = await worker.recognize(imageSource);
        await worker.terminate();

        const cleanedText = text.replace(/\s/g, "");
        const lines = text.split("\n");

        if (!data.iban) {
          const ibanMatch = cleanedText.match(/SA\d{22}/);
          if (ibanMatch) data.iban = ibanMatch[0];
        }

        if (!data.accountNumber) {
          const accountMatch = cleanedText.match(/\d{10,21}/);
          if (accountMatch) data.accountNumber = accountMatch[0];
        }

        if (!data.ownerName) {
          const nameLine = lines.find(
            (line) =>
              line.trim() &&
              line.match(/[\u0600-\u06FFA-Z ]+/i) &&
              line.split(/\s+/).length > 1
          );
          if (nameLine) data.ownerName = nameLine.trim();
        }

        if (!data.bankName) {
          data.bankName = detectBankName(text);
        }
      } catch (ocrErr) {
        console.error("⚠️ OCR failed:", ocrErr);
      }
    }

    const detail = await BankDetail.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    res.json(detail);
  } catch (err) {
    console.error("❌ Error in updateBankDetail:", err);
    res.status(500).json({ message: err.message });
  }
};

// 📋 عرض جميع البنوك
exports.getBankDetails = async (req, res) => {
  try {
    const details = await BankDetail.find();
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 عرض بنك واحد
exports.getBankDetailById = async (req, res) => {
  try {
    const detail = await BankDetail.findById(req.params.id);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ حذف بنك
exports.deleteBankDetail = async (req, res) => {
  try {
    await BankDetail.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
