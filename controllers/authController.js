const Account = require('../models/Account');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

exports.linkGoogleAccount = async (req, res) => {
    // FE sẽ gửi ID thiết bị cũ và Email Google mới lên
    const { deviceId, googleEmail } = req.body;

    try {
        if (deviceId && googleEmail && deviceId!== googleEmail) {
            // Cập nhật toàn bộ dữ liệu của thiết bị nặc danh thành của Email này
            await Account.updateMany({ userId: deviceId }, { $set: { userId: googleEmail } });
            await Category.updateMany({ userId: deviceId }, { $set: { userId: googleEmail } });
            await Transaction.updateMany({ userId: deviceId }, { $set: { userId: googleEmail } });
        }

        res.status(200).json({ 
            message: "Đồng bộ tài khoản thành công", 
            userId: googleEmail 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đồng bộ tài khoản", error: error.message });
    }
};