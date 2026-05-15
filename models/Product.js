const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
});

const variantSchema = new mongoose.Schema({
    variantName: { type: String, required: true }, // Tên phân loại (VD: Phi 21 - Dày 1.6mm)
    sku: { type: String, required: true }, // Mã SKU riêng
    retailPrice: { type: Number, required: true }, // Giá bán lẻ riêng
    oldPrice: { type: Number }, // Giá cũ riêng (nếu có)
    wholesalePrice: { type: Number }, // Giá sỉ riêng
    stock: { type: Number, default: 0 }, // Tồn kho riêng
    image: { type: String } // Ảnh riêng cho biến thể này (tùy chọn)
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true }, // Mã SKU cha
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String },
    shortDescription: { type: String },
    description: { type: String },
    images: [{ type: String }],
    oldPrice: { type: Number }, // Đổi originalPrice thành oldPrice cho đồng bộ với logic Frontend
    retailPrice: { type: Number, required: true }, // Giá cơ sở
    wholesalePrice: { type: Number },
    stock: { type: Number, default: 0 }, // Tổng tồn kho
    specs: [specSchema], // Thông số kỹ thuật chung

    // Hệ thống Đa phân loại (Variants)
    hasVariants: { type: Boolean, default: false }, // Cờ đánh dấu
    variants: [variantSchema], // Danh sách phân loại

    flags: {
        isNewProduct: { type: Boolean, default: false },
        isHot: { type: Boolean, default: false },
        isFlashSale: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);