const Order = require('../../models/Order');
const Product = require('../../models/Product');

// [POST] /api/v1/orders
// Tạo đơn hàng mới (Dùng cho luồng Checkout của Khách hàng)
exports.createOrder = async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            shippingAddress,
            items,
            subTotal,
            shippingFee,
            discount,
            totalAmount,
            paymentMethod,
            note
        } = req.body;

        // Tự động sinh mã đơn hàng (Ví dụ: DH-849201)
        const orderCode = 'DH-' + Math.floor(100000 + Math.random() * 900000);

        // Lấy ID user nếu khách hàng đã đăng nhập (Thông qua authMiddleware)
        const customerId = req.user ? req.user._id : null;

        // Xử lý mapping slug -> _id cho items (vì Frontend gửi lên slug)
        const slugs = items.map(item => item.product);
        const products = await Product.find({ slug: { $in: slugs } });
        
        const mappedItems = items.map(item => {
            const productDoc = products.find(p => p.slug === item.product);
            return { ...item, product: productDoc ? productDoc._id : item.product };
        });

        const newOrder = new Order({
            orderCode,
            customer: customerId,
            customerName,
            customerPhone,
            customerEmail,
            shippingAddress,
            items: mappedItems,
            subTotal,
            shippingFee,
            discount,
            totalAmount,
            paymentMethod,
            note,
            status: 'pending',
            syncStatus: 'pending' // Chờ đồng bộ qua ERP
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công!',
            data: savedOrder
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/v1/orders
// Lấy danh sách đơn hàng (Dùng cho Admin Quản lý)
exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        
        // Lọc theo trạng thái đơn (Ví dụ: ?status=pending)
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Lọc theo phương thức thanh toán
        if (req.query.paymentMethod) {
            query.paymentMethod = req.query.paymentMethod;
        }

        // Lọc theo ngày tạo
        if (req.query.fromDate || req.query.toDate) {
            query.createdAt = {};
            if (req.query.fromDate) {
                query.createdAt.$gte = new Date(req.query.fromDate);
            }
            if (req.query.toDate) {
                query.createdAt.$lte = new Date(req.query.toDate);
            }
        }

        // Tìm kiếm theo Mã đơn hàng, SĐT khách, Email, Tên khách
        if (req.query.search) {
            query.$or = [
                { orderCode: { $regex: req.query.search, $options: 'i' } },
                { customerPhone: { $regex: req.query.search, $options: 'i' } },
                { customerEmail: { $regex: req.query.search, $options: 'i' } },
                { customerName: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Mới nhất lên đầu
            .skip(skip)
            .limit(limit)
            .populate('customer', 'name email crm_id customerType'); // Map thông tin CRM

        const total = await Order.countDocuments(query);

        // Thống kê theo trạng thái
        const statusStats = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            },
            stats: {
                byStatus: statusStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/v1/orders/stats
// Lấy thống kê đơn hàng cho Dashboard
exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippingOrders = await Order.countDocuments({ status: 'shipping' });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        // Tổng doanh thu từ đơn hoàn thành
        const revenueResult = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Đơn hàng mới trong 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newOrdersToday = await Order.countDocuments({ 
            createdAt: { $gte: yesterday } 
        });

        res.status(200).json({
            success: true,
            data: {
                total: totalOrders,
                pending: pendingOrders,
                processing: processingOrders,
                shipping: shippingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                totalRevenue,
                newOrdersToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/v1/orders/:id
// Lấy chi tiết một đơn hàng
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone crm_id customerType')
            .populate('items.product', 'name sku images retailPrice erp_id'); // Khớp mã ERP

        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PUT] /api/v1/orders/:id/status
// Cập nhật trạng thái đơn hàng (Dùng cho Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái truyền lên không hợp lệ!' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        
        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });

        res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công!', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PUT] /api/v1/orders/:id
// Cập nhật thông tin đơn hàng (ghi chú nội bộ, thông tin giao hàng)
exports.updateOrder = async (req, res) => {
    try {
        const allowedUpdates = ['note', 'shippingAddress', 'customerPhone', 'customerEmail', 'erp_order_code'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });

        res.status(200).json({ success: true, message: 'Cập nhật đơn hàng thành công!', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/v1/orders/my-orders
// Lấy danh sách đơn hàng của User đang đăng nhập
exports.getMyOrders = async (req, res) => {
    try {
        // Truy vấn dựa theo reference 'customer' lưu trong models/Order.js
        const orders = await Order.find({ customer: req.user._id || req.user.id })
            .sort({ createdAt: -1 }); // Mới nhất lên đầu

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng của tôi:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ.', error: error.message });
    }
};

// [DELETE] /api/v1/orders/:id
// Xóa đơn hàng (chỉ cho phép xóa đơn pending hoặc cancelled)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }

        // Chỉ cho phép xóa đơn pending hoặc cancelled
        if (!['pending', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Chỉ có thể xóa đơn hàng ở trạng thái Chờ xử lý hoặc Đã hủy!' 
            });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Đã xóa đơn hàng thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};