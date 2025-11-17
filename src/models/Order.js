const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  mainImage: String,
  quantity: { type: Number, default: 1 }
}, { _id: false });

const ShippingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  coords: { type: [Number] } // [lng, lat]
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  shipping: ShippingSchema,
  subtotal: Number,
  tax: Number,
  delivery: Number,
  total: Number,
  
  // ✅ الحالة بالعربي
  status: {
    type: String,
    enum: [
      'بانتظار تأكيد الطلب',
      'تم تأكيد الطلب',
      'طلبك في الطريق',
      'تم التسليم',
      'جاهز للاستلام',
      'تم رفض الطلب'
    ],
    default: 'بانتظار تأكيد الطلب'
  },

  paymentProof: { type: String }, // filepath or URL
  adminNote: String,
  transactionId: String,
  orderNumber: { type: String, unique: true }
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', OrderSchema);
