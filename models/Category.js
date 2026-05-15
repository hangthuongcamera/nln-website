const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String }, // Tên class FontAwesome
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Trỏ tới danh mục cha
    level: { type: Number, default: 1 }, // Cấp bậc danh mục (1, 2, 3...)
    isActive: { type: Boolean, default: true } // Trạng thái hiển thị/ẩn
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);