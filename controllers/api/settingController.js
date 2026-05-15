const Setting = require('../../models/Setting');

// @desc    Lấy cấu hình hệ thống
// @route   GET /api/v1/settings
// @access  Public (Frontend gọi để render giao diện)
exports.getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        // Nếu database trống, tự động tạo cấu hình mặc định
        if (!setting) {
            setting = await Setting.create({});
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy cấu hình', error: error.message });
    }
};

// @desc    Cập nhật cấu hình hệ thống
// @route   PUT /api/v1/settings
// @access  Private (Admin, Super_Admin)
exports.updateSettings = async (req, res) => {
    try {
        // Tìm bản ghi đầu tiên và cập nhật, nếu không có thì nó tự Upsert (do tuân theo logic Singleton)
        const setting = await Setting.findOneAndUpdate({}, req.body, { new: true, runValidators: true, upsert: true });
        
        res.status(200).json({ success: true, message: 'Cập nhật cấu hình thành công', data: setting });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi cập nhật cấu hình', error: error.message });
    }
};