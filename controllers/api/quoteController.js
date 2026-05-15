const Quote = require('../../models/Quote');

// @desc    Tạo yêu cầu báo giá mới (Dùng cho Khách hàng trên Frontend)
// @route   POST /api/v1/quotes
// @access  Public (Khách vãng lai cũng có thể gửi yêu cầu)
exports.createQuote = async (req, res) => {
    try {
        // Sinh mã báo giá tự động (VD: BG-491028)
        const quoteCode = 'BG-' + Math.floor(100000 + Math.random() * 900000);

        // Nếu user đã đăng nhập (có truyền token), gắn thêm ID của user đó vào
        const customerId = req.user ? req.user._id : null;

        const newQuote = new Quote({
            ...req.body,
            quoteCode,
            customer: customerId,
            status: 'pending' // Trạng thái mặc định: Chờ xử lý
        });

        const savedQuote = await newQuote.save();

        res.status(201).json({
            success: true,
            message: 'Gửi yêu cầu báo giá thành công! Chúng tôi sẽ liên hệ lại sớm nhất.',
            data: savedQuote
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo báo giá', error: error.message });
    }
};

// @desc    Lấy danh sách yêu cầu báo giá
// @route   GET /api/v1/quotes
// @access  Private (Admin, Sales)
exports.getQuotes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) query.status = req.query.status;

        if (req.query.fromDate || req.query.toDate) {
            query.createdAt = {};
            if (req.query.fromDate) query.createdAt.$gte = new Date(req.query.fromDate);
            if (req.query.toDate) query.createdAt.$lte = new Date(req.query.toDate);
        }

        if (req.query.search) {
            query.$or = [
                { quoteCode: { $regex: req.query.search, $options: 'i' } },
                { customerName: { $regex: req.query.search, $options: 'i' } },
                { customerPhone: { $regex: req.query.search, $options: 'i' } },
                { customerEmail: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const quotes = await Quote.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('customer', 'name email phone customerType');

        const total = await Quote.countDocuments(query);
        const statusStats = await Quote.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: quotes,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
            stats: { byStatus: statusStats }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách báo giá', error: error.message });
    }
};

// @desc    Lấy thống kê báo giá
// @route   GET /api/v1/quotes/stats
// @access  Private (Admin, Sales)
exports.getQuoteStats = async (req, res) => {
    try {
        const total = await Quote.countDocuments();
        const pending = await Quote.countDocuments({ status: 'pending' });
        const replied = await Quote.countDocuments({ status: 'replied' });
        const rejected = await Quote.countDocuments({ status: 'rejected' });

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newQuotesToday = await Quote.countDocuments({ createdAt: { $gte: yesterday } });

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                replied,
                rejected,
                newQuotesToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê báo giá', error: error.message });
    }
};

// @desc    Lấy chi tiết một yêu cầu báo giá
// @route   GET /api/v1/quotes/:id
// @access  Private (Admin, Sales)
exports.getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id)
            .populate('customer', 'name email phone customerType')
            .populate('items.product', 'name sku retailPrice wholesalePrice');

        if (!quote) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu báo giá!' });

        res.status(200).json({ success: true, data: quote });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Cập nhật trạng thái báo giá (Đã liên hệ, Đã gửi giá, Từ chối...)
// @route   PUT /api/v1/quotes/:id/status
// @access  Private (Admin, Sales)
exports.updateQuoteStatus = async (req, res) => {
    try {
        const validStatuses = ['pending', 'replied', 'rejected'];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái báo giá không hợp lệ!' });
        }

        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
                adminNote: req.body.adminNote,
                attachedFile: req.body.attachedFile
            },
            { new: true }
        );

        if (!quote) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu báo giá!' });
        res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: quote });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật', error: error.message });
    }
};

// @desc    Cập nhật nội dung xử lý báo giá
// @route   PUT /api/v1/quotes/:id
// @access  Private (Admin, Sales)
exports.updateQuote = async (req, res) => {
    try {
        const allowedUpdates = ['adminNote', 'attachedFile', 'status', 'content'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) updates[key] = req.body[key];
        });

        if (updates.status && !['pending', 'replied', 'rejected'].includes(updates.status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái báo giá không hợp lệ!' });
        }

        const quote = await Quote.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (!quote) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu báo giá!' });
        res.status(200).json({ success: true, message: 'Cập nhật báo giá thành công', data: quote });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật báo giá', error: error.message });
    }
};

// @desc    Xóa yêu cầu báo giá
// @route   DELETE /api/v1/quotes/:id
// @access  Private (Admin, Super Admin)
exports.deleteQuote = async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);

        if (!quote) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu báo giá!' });
        res.status(200).json({ success: true, message: 'Đã xóa yêu cầu báo giá thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa báo giá', error: error.message });
    }
};