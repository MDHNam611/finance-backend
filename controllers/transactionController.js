const Transaction = require('../models/Transaction');

// API Thêm mới một giao dịch
exports.createTransaction = async (req, res) => {
    try {
        // Tạm thời lấy dữ liệu từ request (Sẽ cần validate sau để giải quyết câu hỏi 1)
        const { userId, syncId, amount, type, categoryId } = req.body;

        const newTx = await Transaction.create({
            userId, syncId, amount, type, categoryId
        });

        res.status(201).json({ success: true, data: newTx });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// API Lấy danh sách giao dịch
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 }); // Sắp xếp mới nhất lên đầu
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};