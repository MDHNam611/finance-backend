const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String, default: 'default_icon' }, 
    color: { type: String, default: '#000000' },
    isSystem: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);