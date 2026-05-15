const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Tiêu đề bài viết là bắt buộc'] },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String }, // Đoạn tóm tắt ngắn hiển thị ở danh sách bài viết
    content: { type: String, required: [true, 'Nội dung bài viết là bắt buộc'] }, // Nội dung HTML từ Rich Text Editor
    thumbnail: { type: String }, // Ảnh đại diện
    category: { type: String, default: 'Tin tức' }, // Chuyên mục (VD: Tin tức, Kinh nghiệm, Khuyến mãi)
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    isFeatured: { type: Boolean, default: false }, // Đánh dấu bài viết nổi bật

    // SEO Fields
    metaTitle: { type: String },
    metaDescription: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);