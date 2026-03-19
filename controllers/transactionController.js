const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');

exports.createTransaction = async (req, res) => {
    const { userId, accountId, category, type, amount, note, date } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const decimalAmount = mongoose.Types.Decimal128.fromString(amount.toString());
        const newTransaction = new Transaction({
            userId, accountId, category, type, amount: decimalAmount, note, date
        });
        await newTransaction.save({ session });

        const numericAmount = parseFloat(amount.toString());
        const balanceChange = type === 'expense'? -numericAmount : numericAmount;

        // Cập nhật số dư ví (cho phép âm)
        const updatedAccount = await Account.findOneAndUpdate(
            { _id: accountId, userId: userId },
            { $inc: { balance: balanceChange } },
            { session, new: true }
        );

        if (!updatedAccount) throw new Error("Không tìm thấy tài khoản!");

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Tạo giao dịch thành công", transaction: newTransaction });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { date, newAccountId, newCategory, newAmount, newNote } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tx = await Transaction.findById(id).session(session);
        if (!tx) throw new Error("Không tìm thấy giao dịch");

        const oldAmount = parseFloat(tx.amount.toString());
        const currentAccountId = tx.accountId.toString();
        const targetAccountId = newAccountId || currentAccountId;
        const parsedNewAmount = newAmount!== undefined? parseFloat(newAmount) : oldAmount;

        // Nếu có thay đổi Ví hoặc thay đổi Số tiền
        if (currentAccountId!== targetAccountId || oldAmount!== parsedNewAmount) {
            // Hoàn tiền cho ví cũ
            const revertChange = tx.type === 'expense'? oldAmount : -oldAmount;
            await Account.findByIdAndUpdate(
                currentAccountId, 
                { $inc: { balance: revertChange } }, 
                { session }
            );

            // Trừ/cộng tiền cho ví mới
            const applyChange = tx.type === 'expense'? -parsedNewAmount : parsedNewAmount;
            await Account.findByIdAndUpdate(
                targetAccountId, 
                { $inc: { balance: applyChange } }, 
                { session }
            );

            tx.accountId = targetAccountId;
            if (newAmount!== undefined) {
                tx.amount = mongoose.Types.Decimal128.fromString(newAmount.toString());
            }
        }

        // Cập nhật các trường khác
        if (date) tx.date = date;
        if (newCategory) tx.category = newCategory;
        if (newNote!== undefined) tx.note = newNote;

        await tx.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Cập nhật thành công", transaction: tx });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tx = await Transaction.findById(id).session(session);
        if (!tx) throw new Error("Không tìm thấy giao dịch");

        // Hoàn tiền lại cho tài khoản trước khi xóa bản ghi
        const amountNum = parseFloat(tx.amount.toString());
        const revertChange = tx.type === 'expense'? amountNum : -amountNum;
        
        await Account.findByIdAndUpdate(tx.accountId, { $inc: { balance: revertChange } }, { session });
        await Transaction.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: "Xóa giao dịch thành công" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Lỗi xóa giao dịch", error: error.message });
    }
};

// LẤY DANH SÁCH GIAO DỊCH (Hỗ trợ Cuộn vô hạn)
exports.getTransactions = async (req, res) => {
    try {
        const { userId, cursor, limit = 20 } = req.query;
        let query = { userId };

        // Nếu có truyền cursor, chỉ lấy các giao dịch CŨ HƠN mốc thời gian của cursor 
        if (cursor) {
            query.date = { $lt: new Date(cursor) };
        }

        const transactions = await Transaction.find(query)
           .sort({ date: -1, _id: -1 }) // Sort theo ngày giảm dần. Dùng thêm _id để tránh sót nếu 2 giao dịch trùng đúng 1 mili-giây
           .limit(parseInt(limit));

        // Lấy cursor cho lần gọi API tiếp theo (là ngày của phần tử cuối cùng)
        const nextCursor = transactions.length > 0? transactions[transactions.length - 1].date : null;

        res.status(200).json({ transactions, nextCursor });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải giao dịch", error: error.message });
    }
};
// API CHUYỂN TIỀN GIỮA CÁC VÍ (Phục vụ Hình 6)
exports.transferMoney = async (req, res) => {
    const { userId, fromAccountId, toAccountId, amount, note, date } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const decimalAmount = mongoose.Types.Decimal128.fromString(amount.toString());
        const numericAmount = parseFloat(amount.toString());

        // 1. Trừ tiền ở ví nguồn (Ví dụ: Tiền mặt)
        const fromAccount = await Account.findOneAndUpdate(
            { _id: fromAccountId, userId },
            { $inc: { balance: -numericAmount } },
            { session, new: true }
        );

        // 2. Cộng tiền vào ví đích (Ví dụ: Thẻ)
        const toAccount = await Account.findOneAndUpdate(
            { _id: toAccountId, userId },
            { $inc: { balance: numericAmount } },
            { session, new: true }
        );

        if (!fromAccount ||!toAccount) {
            throw new Error("Không tìm thấy tài khoản nguồn hoặc đích.");
        }

        // 3. Ghi lại lịch sử chuyển tiền
        const transferTx = new Transaction({
            userId,
            accountId: fromAccountId,
            toAccountId: toAccountId,
            category: "Chuyển tiền",
            type: 'transfer',
            amount: decimalAmount,
            note: note || `Chuyển từ ${fromAccount.name} sang ${toAccount.name}`,
            date
        });
        await transferTx.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Chuyển tiền thành công", transaction: transferTx });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: "Lỗi chuyển tiền", error: error.message });
    }
};

// API ĐỒNG BỘ DỮ LIỆU OFFLINE (Bulk Sync)
exports.syncOfflineData = async (req, res) => {
    const { userId, transactions } = req.body; 
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let syncedCount = 0;

        // 1. Lưu các giao dịch mới từ điện thoại đẩy lên (nếu chưa tồn tại)
        if (transactions && transactions.length > 0) {
            for (let tx of transactions) {
                const exists = await Transaction.findOne({ offlineId: tx.offlineId }).session(session);
                
                if (!exists) {
                    const decimalAmount = mongoose.Types.Decimal128.fromString(tx.amount.toString());
                    const newTx = new Transaction({...tx, userId, amount: decimalAmount });
                    await newTx.save({ session });

                    const numericAmount = parseFloat(tx.amount.toString());
                    const balanceChange = tx.type === 'expense'? -numericAmount : numericAmount;
                    await Account.findOneAndUpdate(
                        { _id: tx.accountId, userId },
                        { $inc: { balance: balanceChange } },
                        { session }
                    );
                    syncedCount++;
                }
            }
        }

        await session.commitTransaction();
        session.endSession();

        // 2. GIẢI QUYẾT VẤN ĐỀ GỘP: 
        // Lấy TOÀN BỘ giao dịch hiện có của user này trên DB (Bao gồm cả cũ và mới)
        const allTransactions = await Transaction.find({ userId }).sort({ date: -1 });

        // Trả về cho Frontend để Frontend cập nhật lại cơ sở dữ liệu cục bộ
        res.status(200).json({ 
            message: `Đã đồng bộ ${syncedCount} bản ghi mới lên Cloud.`,
            totalRecords: allTransactions.length,
            data: allTransactions
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Lỗi đồng bộ dữ liệu", error: error.message });
    }
};