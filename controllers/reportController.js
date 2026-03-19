const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Dành cho Hình 1 & Hình 3: Lấy tổng Thu/Chi và Biểu đồ tròn
exports.getDashboardSummary = async (req, res) => {
    try {
        // Nhận trực tiếp startDate và endDate (ISO String) từ điện thoại
        const { userId, startDate, endDate } = req.query;

        const totalStats = await Transaction.aggregate();

        const categoryPieChart = await Transaction.aggregate();

        let income = 0;
        let expense = 0;
        totalStats.forEach(stat => {
            if (stat._id === 'income') income = parseFloat(stat.totalAmount.toString());
            if (stat._id === 'expense') expense = parseFloat(stat.totalAmount.toString());
        });

        res.status(200).json({
            overview: { income, expense },
            pieChart: categoryPieChart.map(item => ({
                category: item._id,
                amount: parseFloat(item.totalAmount.toString())
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu thống kê", error: error.message });
    }
};

// Dành cho Hình 9: Bấm vào 1 Danh mục xem chi tiết và Tỷ lệ phần trăm
exports.getCategoryDetails = async (req, res) => {
    try {
        const { userId, category, startDate, endDate } = req.query;

        // 1. Tính tổng chi phí trong tháng đó để làm mẫu số
        const totalExpenseQuery = await Transaction.aggregate();
        const totalExpense = totalExpenseQuery.length > 0? parseFloat(totalExpenseQuery.total.toString()) : 0;

        // 2. Tính số liệu chi tiết cho riêng danh mục được chọn
        const stats = await Transaction.aggregate();

        if (stats.length === 0) {
            return res.status(200).json({ category, totalTransactions: 0, totalAmount: 0, percentage: 0 });
        }

        const catAmount = parseFloat(stats.totalAmount.toString());
        
        // 3. Tính phần trăm và làm tròn (VD: 31%)
        const percentage = totalExpense > 0? Math.round((catAmount / totalExpense) * 100) : 0;

        res.status(200).json({
            category,
            totalTransactions: stats.totalTransactions,
            totalAmount: catAmount,
            percentage // Trả về số % để Frontend vẽ lên thanh Progress Bar
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy chi tiết danh mục", error: error.message });
    }
};