const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Tiêu đề trang là bắt buộc'] },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: [true, 'Nội dung trang là bắt buộc'] }, // Nội dung HTML
    isActive: { type: Boolean, default: true }, // Cho phép ẩn trang nếu cần
    
    // SEO Fields
    metaTitle: { type: String },
    metaDescription: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);