const Category = require('../../models/Category');

// @desc    Lấy danh sách tất cả danh mục
// @route   GET /api/categories
exports.getAllCategories = async (req, res) => {
    try {
        // Lấy tất cả danh mục và dùng Aggregation đếm số lượng sản phẩm thuộc mỗi danh mục
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'productsList'
                }
            },
            {
                $addFields: { productCount: { $size: '$productsList' } }
            },
            {
                $project: { productsList: 0 } // Bỏ mảng chi tiết đi để tối ưu băng thông
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh mục', error: error.message });
    }
};

// @desc    Lấy chi tiết một danh mục theo ID
// @route   GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server hoặc ID không hợp lệ', error: error.message });
    }
};

// @desc    Thêm danh mục mới
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, message: 'Thêm danh mục thành công', data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi thêm danh mục', error: error.message });
    }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi cập nhật', error: error.message });
    }
};

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        res.status(200).json({ success: true, message: 'Đã xóa danh mục khỏi hệ thống' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa', error: error.message });
    }
};