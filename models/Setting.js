const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    link: { type: String },
    title: { type: String }
});

const settingSchema = new mongoose.Schema({
    // Thông tin liên hệ công ty (Hiển thị Footer & Header)
    companyInfo: {
        hotline: { type: String, default: '0901234567' },
        email: { type: String, default: 'contact@nhatlinhnhi.com' },
        address: { type: String, default: '123 Đường Điện Nước, TP.HCM' },
        zalo: { type: String },
        facebook: { type: String }
    },
    // Cờ điều khiển giao diện động (Feature Flags)
    uiFlags: {
        showCategoriesCard: { type: Boolean, default: true }, // Bật/tắt khối 10 Danh mục
        showFlashSale: { type: Boolean, default: true }, // Bật/tắt khối Flash Sale
        showNewsSection: { type: Boolean, default: true }, // Bật/tắt khối Tin tức
        showBrands: { type: Boolean, default: true }, // Bật/tắt dải Băng chuyền thương hiệu
        // Cờ điều khiển 9 khối Grid danh mục sản phẩm (sử dụng tên chung)
        productGrids: {
            component1: { type: Boolean, default: true },
            component2: { type: Boolean, default: true },
            component3: { type: Boolean, default: true },
            component4: { type: Boolean, default: true },
            component5: { type: Boolean, default: true },
            component6: { type: Boolean, default: true },
            component7: { type: Boolean, default: true },
            component8: { type: Boolean, default: true },
            component9: { type: Boolean, default: true }
        },
        searchSuggestionType: {
            type: String,
            enum: ['newest', 'hot', 'flash_sale'],
            default: 'newest'
        }
    },
    // Cấu hình đếm ngược Flash Sale
    flashSale: {
        endTime: { type: Date },
        title: { type: String, default: 'GIÁ SỐC HÔM NAY' } // Đã thêm trường title
    },
    mainSliders: [bannerSchema], // Cấu hình Slider Banner chính
    subBanners: [bannerSchema], // Cấu hình các Banner phụ
    // --- THÊM MỚI: Dành cho các tiêu điểm trên Header ---
    headerUsps: [{
        text: { type: String, required: true },
        icon: { type: String }, // VD: 'fa-truck'
        link: { type: String, default: '#' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);