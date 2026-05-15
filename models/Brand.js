const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Tên thương hiệu là bắt buộc'], unique: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String }, // Link ảnh Logo
    description: { type: String }, // Mô tả ngắn về thương hiệu
    isActive: { type: Boolean, default: true } // Cho phép ẩn thương hiệu nếu ngừng hợp tác
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);