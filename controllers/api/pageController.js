const Page = require('../../models/Page');
const slugify = require('slugify');

// @desc    Lấy danh sách các trang tĩnh (Chỉ lấy title và slug để làm menu)
// @route   GET /api/v1/pages
// @access  Public
exports.getPages = async (req, res) => {
    try {
        const pages = await Page.find({ isActive: true }).select('title slug createdAt');
        res.status(200).json({ success: true, count: pages.length, data: pages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách trang', error: error.message });
    }
};

// @desc    Lấy chi tiết trang tĩnh bằng slug (Dùng để hiển thị nội dung)
// @route   GET /api/v1/pages/slug/:slug
// @access  Public
exports.getPageBySlug = async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug, isActive: true });
        if (!page) return res.status(404).json({ success: false, message: 'Không tìm thấy trang' });
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Tạo trang tĩnh mới
// @route   POST /api/v1/pages
// @access  Private (Admin, Super_Admin, Content)
exports.createPage = async (req, res) => {
    try {
        if (!req.body.slug && req.body.title) {
            req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        }
        const page = await Page.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo trang thành công', data: page });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi tạo trang', error: error.message });
    }
};

// @desc    Cập nhật trang tĩnh
// @route   PUT /api/v1/pages/:id
// @access  Private (Admin, Super_Admin, Content)
exports.updatePage = async (req, res) => {
    try {
        if (req.body.title && !req.body.slug) {
            req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        }
        const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!page) return res.status(404).json({ success: false, message: 'Không tìm thấy trang' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: page });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
};

// @desc    Xóa trang tĩnh
// @route   DELETE /api/v1/pages/:id
// @access  Private (Admin, Super_Admin)
exports.deletePage = async (req, res) => {
    try { const page = await Page.findByIdAndDelete(req.params.id); if (!page) return res.status(404).json({ success: false, message: 'Không tìm thấy trang' }); res.status(200).json({ success: true, message: 'Đã xóa trang' }); } catch (error) { res.status(500).json({ success: false, message: 'Lỗi xóa', error: error.message }); }
};