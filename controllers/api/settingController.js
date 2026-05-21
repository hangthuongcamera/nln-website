const Setting = require('../../models/Setting');

/**
 * @desc    Lấy tất cả cài đặt
 * @route   GET /api/v1/settings
 * @access  Public
 */
exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne().lean();
        res.status(200).json({
            success: true,
            data: settings || {}
        });
    } catch (error) {
        console.error('Lỗi khi lấy cài đặt:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy cài đặt' });
    }
};

/**
 * @desc    Cập nhật cài đặt
 * @route   PUT /api/v1/settings
 * @access  Private (Admin)
 */
exports.updateSettings = async (req, res) => {
    try {
        // Lọc ra các tiêu điểm rỗng trước khi lưu
        if (req.body.headerUsps && Array.isArray(req.body.headerUsps)) {
            req.body.headerUsps = req.body.headerUsps.filter(usp => usp && usp.text && usp.text.trim() !== '');
        }

        const updatePayload = {};

        // Xây dựng đối tượng cập nhật với cú pháp "dot notation" để cập nhật các trường lồng nhau một cách an toàn.
        // Ví dụ: { flashSale: { endTime: '...' } } -> { 'flashSale.endTime': '...' }
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
                // Xử lý các đối tượng lồng nhau như 'flashSale', 'uiFlags', 'secondaryBanners'
                Object.keys(req.body[key]).forEach(nestedKey => {
                    updatePayload[`${key}.${nestedKey}`] = req.body[key][nestedKey];
                });
            } else {
                // Xử lý các trường ở cấp cao nhất
                updatePayload[key] = req.body[key];
            }
        });

        const updatedSettings = await Setting.findOneAndUpdate(
            {}, // Tìm đến document cài đặt duy nhất
            { $set: updatePayload }, // Chỉ cập nhật các trường được chỉ định
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật cài đặt thành công!',
            data: updatedSettings
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật cài đặt:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật cài đặt', error: error.message });
    }
};