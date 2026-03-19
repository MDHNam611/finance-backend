const Category = require('../models/Category');
const Account = require('../models/Account');

// LẤY DANH SÁCH DANH MỤC
exports.getCategories = async (req, res) => {
    try {
        const { userId, type } = req.query;
        
        // Chỉ lấy các danh mục không phải của hệ thống
        const filter = { userId, isSystem: false };
        if (type) filter.type = type;

        const categories = await Category.find(filter);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

// 2. Tạo danh mục mới (ÁP DỤNG LUẬT: Tối đa 9 danh mục / 1 tài khoản)
exports.createCategory = async (req, res) => {
    try {
        const { userId, name, type, icon, color } = req.body;
        
        // Kiểm tra giới hạn 9 danh mục (không đếm danh mục isSystem)
        const count = await Category.countDocuments({ userId, isSystem: false });
        if (count >= 9) {
            return res.status(400).json({ message: "Bạn chỉ được tạo tối đa 9 danh mục." });
        }

        const newCategory = new Category({ userId, name, type, icon, color, isSystem: false });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo danh mục", error: error.message });
    }
};

// SỬA TÊN, ICON, MÀU SẮC DANH MỤC
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name, icon, color },
            { new: true }
        );

        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

        res.status(200).json({ message: "Cập nhật thành công", category });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật danh mục", error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Tìm danh mục để lấy tên trước khi xóa
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        // 2. Xóa toàn bộ giao dịch có liên quan tới danh mục này
        await Transaction.deleteMany({ category: category.name });

        // 3. Xóa danh mục
        await Category.findByIdAndDelete(id);

        res.status(200).json({ message: "Đã xóa danh mục và toàn bộ giao dịch liên quan." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa danh mục", error: error.message });
    }
};