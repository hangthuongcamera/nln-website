const ActivityLog = require('../../models/ActivityLog');
const User = require('../../models/User');

/**
 * @desc    Lấy danh sách nhật ký hoạt động
 * @access  Private (Admin, Super Admin)
 */
exports.getActivityLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            user,
            action,
            resource,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        // Build filter
        const filter = {};

        if (user) filter.user = user;
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (status) filter.status = status;

        // Date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        // Search
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { resourceName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .populate('user', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ActivityLog.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: logs,
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
 * @desc    Lấy chi tiết một nhật ký
 * @access  Private (Admin, Super Admin)
 */
exports.getActivityLogById = async (req, res) => {
    try {
        const log = await ActivityLog.findById(req.params.id)
            .populate('user', 'name email role phone');

        if (!log) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhật ký' });
        }

        res.json({ success: true, data: log });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Thống kê nhật ký hoạt động
 * @access  Private (Admin, Super Admin)
 */
exports.getActivityStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        // Stats by action
        const actionStats = await ActivityLog.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Stats by resource
        const resourceStats = await ActivityLog.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$resource', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Stats by user
        const userStats = await ActivityLog.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$user', userName: { $first: '$userName' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Stats by status
        const statusStats = await ActivityLog.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Daily activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dailyActivity = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Total
        const total = await ActivityLog.countDocuments(dateFilter);

        res.json({
            success: true,
            data: {
                total,
                actionStats,
                resourceStats,
                userStats,
                statusStats,
                dailyActivity
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Xóa nhật ký cũ (dọn dẹp)
 * @access  Private (Super Admin only)
 */
exports.cleanOldLogs = async (req, res) => {
    try {
        const { days = 90 } = req.body;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const result = await ActivityLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        res.json({
            success: true,
            message: `Đã xóa ${result.deletedCount} nhật ký cũ hơn ${days} ngày`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Export nhật ký ra CSV
 * @access  Private (Admin, Super Admin)
 */
exports.exportLogs = async (req, res) => {
    try {
        const { startDate, endDate, user, action, resource } = req.query;

        const filter = {};
        if (user) filter.user = user;
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        const logs = await ActivityLog.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10000);

        // Convert to CSV
        const csvHeader = 'Thời gian,Người dùng,Email,Vai trò,Hành động,Tài nguyên,Mô tả,IP,Trạng thái\n';
        const csvRows = logs.map(log => {
            return [
                log.createdAt.toISOString(),
                log.userName,
                log.user?.email || '',
                log.userRole,
                log.action,
                log.resource,
                `"${(log.description || '').replace(/"/g, '""')}"`,
                log.ipAddress || '',
                log.status
            ].join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${Date.now()}.csv`);
        res.send('\ufeff' + csvHeader + csvRows); // \ufeff for UTF-8 BOM
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};