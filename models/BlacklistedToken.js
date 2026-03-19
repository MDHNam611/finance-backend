const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    // Document này sẽ tự động bị MongoDB xóa sau 7 ngày (nên thiết lập bằng thời gian sống của JWT)
    createdAt: { type: Date, default: Date.now, expires: '7d' } 
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);