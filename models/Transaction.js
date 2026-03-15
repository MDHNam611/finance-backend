const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  syncId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true }, // Đã thêm 'transfer'
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Bỏ trống nếu là transfer
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true }, // Ví bị trừ/cộng tiền
  toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // Dùng khi type là 'transfer'
  description: { type: String }, // VD: "Nước 0 độ", "sữa fami" như trong ảnh 2
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);