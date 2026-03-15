const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true }, // Tên ví do người dùng tự đặt (VD: "Tiền mặt", "Thẻ đen")
  type: { type: String, enum: ['cash', 'bank', 'credit'], required: true }, // Phân loại ngầm để xử lý logic cấm âm tiền mặt
  balance: { type: Number, default: 0 }, // Số dư hiện tại
  icon: { type: String, default: 'wallet' }, // Tên icon hiển thị trên app Flutter
  isDeleted: { type: Boolean, default: false } // Dùng để xóa mềm, không làm hỏng lịch sử giao dịch
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);