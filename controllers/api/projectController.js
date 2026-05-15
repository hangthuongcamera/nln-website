const Project = require('../../models/Project');

// @desc    Lấy danh sách tất cả dự án (có hỗ trợ phân trang)
// @route   GET /api/v1/projects
// @access  Public
exports.getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        // Lọc theo trạng thái hoặc danh mục dự án nếu client có gửi lên
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Project.countDocuments(query);

        res.status(200).json({
            success: true,
            data: projects,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách dự án', error: error.message });
    }
};

// @desc    Lấy chi tiết một dự án
// @route   GET /api/v1/projects/:id
// @access  Public
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
        
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Thêm dự án mới
// @route   POST /api/v1/projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo dự án thành công', data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi tạo dự án', error: error.message });
    }
};

// Cập nhật dự án
// @route   PUT /api/v1/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
};

// Xóa dự án
// @route   DELETE /api/v1/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => { try { const project = await Project.findByIdAndDelete(req.params.id); if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' }); res.status(200).json({ success: true, message: 'Đã xóa dự án' }); } catch (error) { res.status(500).json({ success: false, message: 'Lỗi xóa', error: error.message }); } };