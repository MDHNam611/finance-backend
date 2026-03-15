const Category = require('../models/Category');
const Account = require('../models/Account');

// 1. Lấy danh sách danh mục (Lọc theo tài khoản và chưa bị xóa)
exports.getCategories = async (req, res) => {
    try {
        const { accountId } = req.query;
        if (!accountId) return res.status(400).json({ success: false, message: 'Thiếu accountId' });

        const categories = await Category.find({ accountId: accountId, isDeleted: false });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// 2. Tạo danh mục mới (ÁP DỤNG LUẬT: Tối đa 9 danh mục / 1 tài khoản)
exports.createCategory = async (req, res) => {
    try {
        const { userId, accountId, name, type, color, icon } = req.body;
        
        if (!userId ||!accountId ||!name ||!type ||!color ||!icon) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin' });
        }

        // KIỂM TRA LUẬT: Đếm số danh mục hiện có của tài khoản này
        const currentCategoryCount = await Category.countDocuments({ accountId: accountId, isDeleted: false });
        if (currentCategoryCount >= 9) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tài khoản này đã đạt giới hạn tối đa 9 danh mục. Vui lòng xóa bớt để thêm mới.' 
            });
        }

        const newCategory = await Category.create({ userId, accountId, name, type, color, icon });
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// 3. Xóa mềm danh mục (Thay vì null, ta ẩn nó đi)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        
        if (!updatedCategory) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        res.status(200).json({ success: true, message: 'Đã xóa (ẩn) danh mục thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};