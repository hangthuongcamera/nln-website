const User = require('../../models/User');

// @desc    Lấy danh sách khách hàng
// @route   GET /api/v1/customers
// @access  Private (Admin, Sales)
exports.getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = { role: { $in: ['customer', 'agent'] } }; // Chỉ lấy khách hàng, không lấy admin/staff

        // Lọc theo loại khách hàng
        if (req.query.customerType) {
            query.customerType = req.query.customerType;
        }

        // Lọc theo trạng thái active
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        // Tìm kiếm theo tên, email, số điện thoại
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { phone: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const customers = await User.find(query)
            .select('-password') // Không trả về password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        // Thống kê theo loại khách hàng
        const typeStats = await User.aggregate([
            { $match: { role: { $in: ['customer', 'agent'] } } },
            { $group: { _id: '$customerType', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: customers,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            },
            stats: {
                byType: typeStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách khách hàng', error: error.message });
    }
};

// @desc    Lấy thống kê khách hàng
// @route   GET /api/v1/customers/stats
// @access  Private (Admin, Sales)
exports.getCustomerStats = async (req, res) => {
    try {
        const total = await User.countDocuments({ role: { $in: ['customer', 'agent'] } });
        const retail = await User.countDocuments({ customerType: 'retail' });
        const wholesale = await User.countDocuments({ customerType: 'wholesale' });
        const dealer = await User.countDocuments({ customerType: 'dealer' });
        const active = await User.countDocuments({ role: { $in: ['customer', 'agent'] }, isActive: true });
        const inactive = await User.countDocuments({ role: { $in: ['customer', 'agent'] }, isActive: false });

        // Khách hàng mới trong 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newCustomersToday = await User.countDocuments({
            role: { $in: ['customer', 'agent'] },
            createdAt: { $gte: yesterday }
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                retail,
                wholesale,
                dealer,
                active,
                inactive,
                newCustomersToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê khách hàng', error: error.message });
    }
};

// @desc    Lấy chi tiết một khách hàng
// @route   GET /api/v1/customers/:id
// @access  Private (Admin, Sales)
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id).select('-password');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng!' });
        }

        // Lấy thêm thông tin đơn hàng và báo giá của khách hàng này
        const Order = require('../../models/Order');
        const Quote = require('../../models/Quote');

        const orders = await Order.find({ customer: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);

        const quotes = await Quote.find({ customer: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);

        const orderStats = {
            total: await Order.countDocuments({ customer: req.params.id }),
            completed: await Order.countDocuments({ customer: req.params.id, status: 'completed' }),
            cancelled: await Order.countDocuments({ customer: req.params.id, status: 'cancelled' })
        };

        const quoteStats = {
            total: await Quote.countDocuments({ customer: req.params.id }),
            pending: await Quote.countDocuments({ customer: req.params.id, status: 'pending' }),
            replied: await Quote.countDocuments({ customer: req.params.id, status: 'replied' })
        };

        res.status(200).json({
            success: true,
            data: {
                customer,
                recentOrders: orders,
                recentQuotes: quotes,
                orderStats,
                quoteStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin khách hàng', error: error.message });
    }
};

// @desc    Cập nhật thông tin khách hàng
// @route   PUT /api/v1/customers/:id
// @access  Private (Admin, Sales)
exports.updateCustomer = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'phone', 'customerType', 'isActive', 'crm_id', 'address', 'dob'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const customer = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng!' });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin khách hàng thành công!',
            data: customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật khách hàng', error: error.message });
    }
};

// @desc    Cập nhật loại khách hàng (retail/wholesale/dealer)
// @route   PUT /api/v1/customers/:id/type
// @access  Private (Admin)
exports.updateCustomerType = async (req, res) => {
    try {
        const { customerType } = req.body;
        const validTypes = ['retail', 'wholesale', 'dealer'];

        if (!validTypes.includes(customerType)) {
            return res.status(400).json({ success: false, message: 'Loại khách hàng không hợp lệ!' });
        }

        const customer = await User.findByIdAndUpdate(
            req.params.id,
            { customerType },
            { new: true }
        ).select('-password');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng!' });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật loại khách hàng thành công!',
            data: customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật loại khách hàng', error: error.message });
    }
};

// @desc    Kích hoạt/Vô hiệu hóa tài khoản khách hàng
// @route   PUT /api/v1/customers/:id/status
// @access  Private (Admin)
exports.updateCustomerStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const customer = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng!' });
        }

        res.status(200).json({
            success: true,
            message: `Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản khách hàng!`,
            data: customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái khách hàng', error: error.message });
    }
};

// @desc    Xóa khách hàng
// @route   DELETE /api/v1/customers/:id
// @access  Private (Super Admin only)
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng!' });
        }

        // Kiểm tra xem khách hàng có đơn hàng không
        const Order = require('../../models/Order');
        const orderCount = await Order.countDocuments({ customer: req.params.id });

        if (orderCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa khách hàng đã có đơn hàng! Hãy vô hiệu hóa tài khoản thay vì xóa.'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Đã xóa khách hàng thành công!'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa khách hàng', error: error.message });
    }
};

// @desc    Xuất danh sách khách hàng ra CSV
// @route   GET /api/v1/customers/export
// @access  Private (Admin, Sales)
exports.exportCustomers = async (req, res) => {
    try {
        const query = { role: { $in: ['customer', 'agent'] } };

        if (req.query.customerType) query.customerType = req.query.customerType;
        if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

        const customers = await User.find(query).select('-password').sort({ createdAt: -1 });

        // Tạo CSV content
        const csvHeader = 'ID,Tên,Email,Số điện thoại,Loại khách hàng,Trạng thái,CRM ID,Ngày đăng ký\n';
        const csvRows = customers.map(c => {
            return `${c._id},"${c.name}","${c.email}","${c.phone}","${c.customerType}","${c.isActive ? 'Hoạt động' : 'Vô hiệu'}","${c.crm_id || ''}","${c.createdAt}"`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=customers-${Date.now()}.csv`);
        res.status(200).send('\uFEFF' + csv); // BOM for UTF-8
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xuất danh sách khách hàng', error: error.message });
    }
};