const Setting = require('../../models/Setting');
const { createLog } = require('../../middleware/activityLogger');

/**
 * @desc    Lấy cấu hình hệ thống
 * @access  Private (Admin, Super Admin)
 */
exports.getSystemConfig = async (req, res) => {
    try {
        const settings = await Setting.findOne({ type: 'system' });
        
        // Default config nếu chưa có
        const defaultConfig = {
            siteName: 'Nhất Linh Nhi',
            siteDescription: 'Camera và thiết bị an ninh',
            contact: {
                phone: '0909xxxxxx',
                email: 'contact@nhatlinhnhi.vn',
                address: 'TP.HCM'
            },
            social: {
                facebook: '',
                zalo: '',
                youtube: ''
            },
            maintenance: {
                enabled: false,
                message: 'Hệ thống đang bảo trì'
            },
            security: {
                maxLoginAttempts: 5,
                lockoutDuration: 30, // minutes
                sessionTimeout: 120, // minutes
                requireStrongPassword: true
            },
            email: {
                notifications: true,
                orderConfirmation: true,
                newsletter: false
            }
        };

        const config = settings?.data || defaultConfig;

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Cập nhật cấu hình hệ thống
 * @access  Private (Super Admin only)
 */
exports.updateSystemConfig = async (req, res) => {
    try {
        const configData = req.body;

        let setting = await Setting.findOne({ type: 'system' });
        
        if (setting) {
            setting.data = { ...setting.data, ...configData };
            await setting.save();
        } else {
            setting = await Setting.create({
                type: 'system',
                data: configData
            });
        }

        // Log activity
        await createLog({
            user: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'UPDATE',
            resource: 'SETTING',
            resourceId: setting._id,
            resourceName: 'Cấu hình hệ thống',
            description: `${req.user.name} đã cập nhật cấu hình hệ thống`,
            changes: {
                before: setting._previousData,
                after: configData
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            message: 'Cập nhật cấu hình thành công',
            data: setting.data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Lấy thông tin hệ thống (server status)
 * @access  Private (Admin, Super Admin)
 */
exports.getServerStatus = async (req, res) => {
    try {
        const os = require('os');
        const mongoose = require('mongoose');

        const Product = require('../../models/Product');
        const User = require('../../models/User');
        const Order = require('../../models/Order');

        const [
            productCount,
            userCount,
            orderCount,
            dbStatus
        ] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),
            mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        ]);

        const serverInfo = {
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                system: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB'
            },
            cpu: os.cpus().length + ' cores',
            platform: os.platform(),
            nodeVersion: process.version,
            database: dbStatus,
            counts: {
                products: productCount,
                users: userCount,
                orders: orderCount
            }
        };

        res.json({
            success: true,
            data: serverInfo
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Bật/tắt chế độ bảo trì
 * @access  Private (Super Admin only)
 */
exports.toggleMaintenance = async (req, res) => {
    try {
        const { enabled, message } = req.body;

        let setting = await Setting.findOne({ type: 'system' });
        
        if (!setting) {
            setting = await Setting.create({
                type: 'system',
                data: {}
            });
        }

        setting.data.maintenance = {
            enabled: enabled,
            message: message || 'Hệ thống đang bảo trì'
        };
        await setting.save();

        // Log activity
        await createLog({
            user: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'UPDATE',
            resource: 'SYSTEM',
            resourceName: 'Chế độ bảo trì',
            description: `${req.user.name} đã ${enabled ? 'bật' : 'tắt'} chế độ bảo trì`,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            message: enabled ? 'Đã bật chế độ bảo trì' : 'Đã tắt chế độ bảo trì',
            data: setting.data.maintenance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Lấy thống kê tổng quan hệ thống
 * @access  Private (Admin, Super Admin)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const Product = require('../../models/Product');
        const User = require('../../models/User');
        const Order = require('../../models/Order');
        const Quote = require('../../models/Quote');
        const Blog = require('../../models/Blog');
        const Contact = require('../../models/Contact');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [
            totalProducts,
            totalUsers,
            totalOrders,
            totalQuotes,
            totalBlogs,
            totalContacts,
            newOrdersToday,
            newQuotesToday,
            newUsersToday,
            pendingOrders,
            pendingQuotes,
            pendingContacts
        ] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments({ role: { $ne: 'super_admin' } }),
            Order.countDocuments(),
            Quote.countDocuments(),
            Blog.countDocuments(),
            Contact.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Quote.countDocuments({ createdAt: { $gte: today } }),
            User.countDocuments({ createdAt: { $gte: today }, role: 'customer' }),
            Order.countDocuments({ status: 'pending' }),
            Quote.countDocuments({ status: 'pending' }),
            Contact.countDocuments({ status: 'new' })
        ]);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Revenue stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueStats = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $nin: ['cancelled', 'failed'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totals: {
                    products: totalProducts,
                    users: totalUsers,
                    orders: totalOrders,
                    quotes: totalQuotes,
                    blogs: totalBlogs,
                    contacts: totalContacts
                },
                today: {
                    orders: newOrdersToday,
                    quotes: newQuotesToday,
                    newUsers: newUsersToday
                },
                pending: {
                    orders: pendingOrders,
                    quotes: pendingQuotes,
                    contacts: pendingContacts
                },
                ordersByStatus,
                revenueStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};