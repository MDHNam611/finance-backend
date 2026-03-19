const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors'); // Cho phép gọi API từ môi trường khác

const app = express();

// Middleware để Node.js hiểu được dữ liệu JSON gửi lên
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/finance_db')
.then(() => console.log('Đã kết nối MongoDB!'))
.catch(err => console.error('Lỗi kết nối:', err));

// --- GẮN ROUTES VÀO ĐÂY ---
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const accountRoutes = require('./routes/accountRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/auth', authRoutes);

app.listen(3000, () => console.log('Server chạy ở port 3000'));