const Blog = require('../../models/Blog');
const slugify = require('slugify');

// @desc    Lấy danh sách bài viết (hỗ trợ phân trang, lọc, tìm kiếm)
// @route   GET /api/v1/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.category) query.category = req.query.category;
        if (req.query.tag) query.tags = req.query.tag;
        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        const blogs = await Blog.find({ ...query, status: 'published' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name');

        const total = await Blog.countDocuments({ ...query, status: 'published' });

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy chi tiết bài viết bằng slug
// @route   GET /api/v1/blogs/slug/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' }).populate('author', 'name');
        if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Tạo bài viết mới
// @route   POST /api/v1/blogs
// @access  Private (Admin/Content)
exports.createBlog = async (req, res) => {
    try {
        // Tự động tạo slug từ title nếu không được cung cấp
        if (!req.body.slug) {
            req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        }
        // Gán tác giả là user đang đăng nhập
        req.body.author = req.user.id;

        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo bài viết thành công', data: blog });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi tạo bài viết', error: error.message });
    }
};

// @desc    Cập nhật bài viết
// @route   PUT /api/v1/blogs/:id
// @access  Private (Admin/Content)
exports.updateBlog = async (req, res) => {
    try {
        // Nếu tiêu đề thay đổi, cập nhật lại slug
        if (req.body.title && !req.body.slug) {
            req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        }
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: blog });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi cập nhật', error: error.message });
    }
};

// @desc    Xóa bài viết
// @route   DELETE /api/v1/blogs/:id
// @access  Private (Admin/Content)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
        res.status(200).json({ success: true, message: 'Đã xóa bài viết' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa', error: error.message });
    }
};