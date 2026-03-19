const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Ép Mongoose dùng String thay vì ObjectId tự động
    userId: { type: String, required: true },
    name: { type: String, required: true }, 
    balance: { type: mongoose.Schema.Types.Decimal128, required: true, default: 0 },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false } // Đã thêm trường này để phục vụ Soft Delete
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);