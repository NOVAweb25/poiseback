const mongoose = require('mongoose');

const BankDetailSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  ownerName: { type: String, required: true },
  iban: { type: String },
  accountNumber: { type: String },
  barcode: { type: String }, // يمكن حفظه كصورة أو كـ string
  bankCardImage: { type: String }, // صورة البطاقة البنكية لاستخراج البيانات
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Middleware قبل الحفظ: يحاول التنبؤ باسم البنك
BankDetailSchema.pre('save', function(next) {
  if (!this.bankName && (this.iban || this.accountNumber)) {
    // مثال ذكي: تخمين اسم البنك بناءً على بداية رقم الايبان أو الحساب
    const bankPrefixes = {
      "SA03": "الأهلي",
      "SA04": "الراجحي",
      "SA05": "الرياض",
      "SA06": "ساب",
      "SA07": "البنك الفرنسي"
    };
    const prefix = (this.iban || this.accountNumber).substring(0,4);
    this.bankName = bankPrefixes[prefix] || "غير معروف";
  }
  next();
});

module.exports = mongoose.model('BankDetail', BankDetailSchema);