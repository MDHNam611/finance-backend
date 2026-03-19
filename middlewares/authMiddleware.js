const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedToken');

exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[3];
    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    try {
        // Kiểm tra xem token đã bị hủy (người dùng đã đăng xuất) chưa
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};