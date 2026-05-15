const User = require('../../models/User');
const { createLog } = require('../../middleware/activityLogger');

/**
 * @desc    Lấy danh sách người dùng theo vai trò
 * @access  Private (Admin, Super Admin)
 */
exports.getUsersByRole = async (req, res) => {
    try {
        const { role, page = 1, limit = 20, search } = req.query;

        const filter = {};
        if (role && role !== 'all') {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Thống kê người dùng theo vai trò
 * @access  Private (Admin, Super Admin)
 */
exports.getRoleStats = async (req, res) => {
    try {
        const roleStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const activeStats = await User.aggregate([
            { $group: { _id: '$isActive', count: { $sum: 1 } } }
        ]);

        const customerTypeStats = await User.aggregate([
            { $match: { role: 'customer' } },
            { $group: { _id: '$customerType', count: { $sum: 1 } } }
        ]);

        const total = await User.countDocuments();

        res.json({
            success: true,
            data: {
                total,
                roleStats,
                activeStats,
                customerTypeStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Cập nhật vai trò người dùng
 * @access  Private (Super Admin only)
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles = ['customer', 'agent', 'sales', 'content', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vai trò không hợp lệ' 
            });
        }

        // Không cho phép tự thay đổi vai trò của chính mình
        if (userId === req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không thể thay đổi vai trò của chính mình' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log activity
        await createLog({
            user: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'UPDATE',
            resource: 'USER',
            resourceId: user._id,
            resourceName: user.name,
            description: `${req.user.name} đã thay đổi vai trò của ${user.name} từ ${oldRole} thành ${role}`,
            changes: {
                before: { role: oldRole },
                after: { role: role }
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            message: 'Cập nhật vai trò thành công',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Kích hoạt/Vô hiệu hóa tài khoản
 * @access  Private (Admin, Super Admin)
 */
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // Không cho phép tự vô hiệu hóa tài khoản của chính mình
        if (userId === req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không thể vô hiệu hóa tài khoản của chính mình' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        // Log activity
        await createLog({
            user: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'UPDATE',
            resource: 'USER',
            resourceId: user._id,
            resourceName: user.name,
            description: `${req.user.name} đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản ${user.name}`,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            message: `Đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Lấy danh sách quyền theo vai trò
 * @access  Private (Admin, Super Admin)
 */
exports.getRolePermissions = async (req, res) => {
    try {
        const permissions = {
            super_admin: {
                name: 'Super Admin',
                description: 'Toàn quyền quản trị hệ thống',
                permissions: [
                    'Quản lý tất cả người dùng và vai trò',
                    'Cấu hình hệ thống',
                    'Xem và xóa nhật ký hoạt động',
                    'Toàn quyền với tất cả module'
                ]
            },
            admin: {
                name: 'Admin',
                description: 'Quản trị viên',
                permissions: [
                    'Quản lý sản phẩm, danh mục',
                    'Quản lý đơn hàng, báo giá',
                    'Quản lý khách hàng',
                    'Xem báo cáo và thống kê',
                    'Quản lý nội dung (blog, dự án)'
                ]
            },
            sales: {
                name: 'Nhân viên bán hàng',
                description: 'Xử lý đơn hàng và báo giá',
                permissions: [
                    'Xem danh sách sản phẩm',
                    'Quản lý đơn hàng',
                    'Quản lý báo giá',
                    'Xem thông tin khách hàng',
                    'Xem báo cáo bán hàng'
                ]
            },
            content: {
                name: 'Nhân viên nội dung',
                description: 'Quản lý nội dung website',
                permissions: [
                    'Quản lý blog/tin tức',
                    'Quản lý dự án',
                    'Quản lý trang tĩnh',
                    'Quản lý banner',
                    'Quản lý thương hiệu'
                ]
            },
            warehouse_staff: {
                name: 'Nhân viên kho',
                description: 'Quản lý tồn kho',
                permissions: [
                    'Xem danh sách sản phẩm',
                    'Cập nhật tồn kho',
                    'Import/Export tồn kho',
                    'Xem lịch sử tồn kho'
                ]
            },
            agent: {
                name: 'Đại lý',
                description: 'Đại lý bán sỉ',
                permissions: [
                    'Xem sản phẩm và giá đại lý',
                    'Đặt hàng sỉ',
                    'Xem lịch sử đơn hàng của mình',
                    'Yêu cầu báo giá'
                ]
            },
            customer: {
                name: 'Khách hàng',
                description: 'Khách hàng thông thường',
                permissions: [
                    'Xem sản phẩm',
                    'Đặt hàng',
                    'Xem lịch sử đơn hàng của mình',
                    'Yêu cầu báo giá'
                ]
            }
        };

        res.json({
            success: true,
            data: permissions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};