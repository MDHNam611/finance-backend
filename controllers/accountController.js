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
        const { userId, name, initialBalance } = req.body;
        
        // Kiểm tra giới hạn tối đa 5 tài khoản
        const accountCount = await Account.countDocuments({ userId });
        if (accountCount >= 5) {
            return res.status(400).json({ message: "Bạn chỉ được tạo tối đa 5 tài khoản." });
        }

        const newAccount = new Account({
            userId,
            name: name || "Tiền mặt", // Có thể tuỳ ý đổi tên
            balance: initialBalance? parseFloat(initialBalance) : 0,
            isDefault: accountCount === 0 // Nếu là ví đầu tiên, tự động thành mặc định
        });
        await newAccount.save();
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo tài khoản", error: error.message });
    }
};

// 3. Xóa mềm ví (Ẩn ví đi thay vì xóa vĩnh viễn)
exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const account = await Account.findById(id).session(session);
        if (!account) throw new Error("Không tìm thấy tài khoản");

        // Thay vì xóa vĩnh viễn, ta cập nhật cờ isDeleted thành true
        await Account.findByIdAndUpdate(
            id, 
            { isDeleted: true, balance: 0 }, // Xóa mềm và có thể reset số dư về 0 nếu muốn
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: "Đã xóa mềm tài khoản thành công." });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Lỗi xóa tài khoản", error: error.message });
    }
};