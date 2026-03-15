const Account = require('../models/Account');

// 1. Lấy danh sách ví (chỉ lấy những ví chưa bị xóa mềm)
exports.getAccounts = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });

        const accounts = await Account.find({ userId: userId, isDeleted: false });
        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// 2. Tạo ví mới
exports.createAccount = async (req, res) => {
    try {
        const { userId, name, type, balance, icon } = req.body;

        if (!userId ||!name ||!type) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin' });
        }

        const newAccount = await Account.create({
            userId, 
            name, 
            type, 
            balance: balance || 0,
            icon: icon || 'wallet'
        });

        res.status(201).json({ success: true, data: newAccount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// 3. Xóa mềm ví (Ẩn ví đi thay vì xóa vĩnh viễn)
exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAccount = await Account.findByIdAndUpdate(
            id, 
            { isDeleted: true }, 
            { new: true }
        );
        
        if (!updatedAccount) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
        res.status(200).json({ success: true, message: 'Đã xóa (ẩn) tài khoản thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};