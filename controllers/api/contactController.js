const Contact = require('../../models/Contact');

// @desc    Gửi tin nhắn liên hệ mới
// @route   POST /api/v1/contacts
// @access  Public (Khách hàng vãng lai cũng có thể gửi)
exports.submitContact = async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        res.status(201).json({ success: true, message: 'Gửi tin nhắn liên hệ thành công!', data: contact });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi gửi tin nhắn', error: error.message });
    }
};

// @desc    Lấy danh sách tin nhắn liên hệ (Hỗ trợ phân trang và lọc)
// @route   GET /api/v1/contacts
// @access  Private (Admin, Sales)
exports.getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.status) query.status = req.query.status;

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments(query);

        res.status(200).json({
            success: true,
            data: contacts,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy chi tiết 1 tin nhắn
// @route   GET /api/v1/contacts/:id
// @access  Private (Admin, Sales)
exports.getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
        res.status(200).json({ success: true, data: contact });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Cập nhật trạng thái tin nhắn (Ví dụ: Đánh dấu đã xử lý)
// @route   PUT /api/v1/contacts/:id/status
// @access  Private (Admin, Sales)
exports.updateContactStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true, runValidators: true });
        if (!contact) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
        res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: contact });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
};

// @desc    Xóa tin nhắn liên hệ
// @route   DELETE /api/v1/contacts/:id
// @access  Private (Admin, Super_Admin)
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
        res.status(200).json({ success: true, message: 'Đã xóa tin nhắn' });
    } catch (error) { res.status(500).json({ success: false, message: 'Lỗi xóa', error: error.message }); }
};