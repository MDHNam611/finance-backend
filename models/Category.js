const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true }, // Ràng buộc danh mục thuộc về 1 tài khoản cụ thể
  name: { type: String, required: true }, // Tên tùy ý
  type: { type: String, enum: ['income', 'expense'], required: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
  isDeleted: { type: Boolean, default: false } // Xóa mềm theo ý của bạn
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);