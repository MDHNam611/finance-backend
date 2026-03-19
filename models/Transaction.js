const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    accountId: { type: String, required: true }, // Đổi từ ObjectId sang String
    toAccountId: { type: String }, // Đổi từ ObjectId sang String
    category: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true }, // Thêm 'transfer'
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    note: { type: String, default: "" },
    date: { type: Date, required: true, default: Date.now },
    offlineId: { type: String } // ID sinh ra ở điện thoại lúc mất mạng
}, { timestamps: true });

// Tối ưu hóa truy vấn
transactionSchema.index({ userId: 1, date: -1, category: 1 });
// Ngăn chặn đồng bộ trùng lặp 1 giao dịch nhiều lần
transactionSchema.index({ offlineId: 1 }, { unique: true, sparse: true }); 

module.exports = mongoose.model('Transaction', transactionSchema);