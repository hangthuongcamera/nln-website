const Brand = require('../../models/Brand');
const slugify = require('slugify');

// @desc    Lấy danh sách tất cả thương hiệu (Chỉ lấy những thương hiệu đang active)
// @route   GET /api/v1/brands
// @access  Public
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách thương hiệu', error: error.message });
    }
};

// @desc    Lấy chi tiết một thương hiệu theo ID
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Thêm thương hiệu mới
// @route   POST /api/v1/brands
// @access  Private (Admin, Super_Admin, Content)
exports.createBrand = async (req, res) => {
    try {
        if (!req.body.slug && req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true, strict: true });
        }
        const brand = await Brand.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo thương hiệu thành công', data: brand });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi tạo thương hiệu', error: error.message });
    }
};

// @desc    Cập nhật thương hiệu
// @route   PUT /api/v1/brands/:id
// @access  Private (Admin, Super_Admin, Content)
exports.updateBrand = async (req, res) => {
    try {
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name, { lower: true, strict: true });
        }
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!brand) return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: brand });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
};

// @desc    Xóa thương hiệu
// @route   DELETE /api/v1/brands/:id
// @access  Private (Admin, Super_Admin)
exports.deleteBrand = async (req, res) => { try { const brand = await Brand.findByIdAndDelete(req.params.id); if (!brand) return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' }); res.status(200).json({ success: true, message: 'Đã xóa thương hiệu' }); } catch (error) { res.status(500).json({ success: false, message: 'Lỗi xóa', error: error.message }); } };