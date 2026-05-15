const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware ghi nhật ký hoạt động
 * Sử dụng sau khi thực hiện action thành công
 */
exports.logActivity = (action, resource) => {
    return async (req, res, next) => {
        // Lưu response gốc
        const originalJson = res.json.bind(res);
        
        res.json = function(data) {
            // Chỉ log khi thành công
            if (data.success !== false && req.user) {
                const logData = {
                    user: req.user._id,
                    userName: req.user.name,
                    userRole: req.user.role,
                    action: action,
                    resource: resource,
                    resourceId: req.params.id || data.data?._id,
                    resourceName: data.data?.name || data.data?.title || data.data?.email,
                    description: generateDescription(action, resource, req.user.name, data.data),
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'SUCCESS'
                };

                // Lưu changes nếu là UPDATE
                if (action === 'UPDATE' && req.body) {
                    logData.changes = {
                        before: req.originalData, // Cần set trước đó trong controller
                        after: req.body
                    };
                }

                ActivityLog.create(logData).catch(err => {
                    console.error('Error logging activity:', err);
                });
            }
            
            return originalJson(data);
        };
        
        next();
    };
};

/**
 * Log thủ công từ controller
 */
exports.createLog = async (logData) => {
    try {
        await ActivityLog.create(logData);
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};

/**
 * Tạo mô tả tự động
 */
function generateDescription(action, resource, userName, data) {
    const resourceName = data?.name || data?.title || data?.email || 'N/A';
    
    const descriptions = {
        'CREATE': `${userName} đã tạo ${resource.toLowerCase()} mới: ${resourceName}`,
        'UPDATE': `${userName} đã cập nhật ${resource.toLowerCase()}: ${resourceName}`,
        'DELETE': `${userName} đã xóa ${resource.toLowerCase()}: ${resourceName}`,
        'BULK_UPDATE': `${userName} đã cập nhật hàng loạt ${resource.toLowerCase()}`,
        'IMPORT': `${userName} đã import dữ liệu ${resource.toLowerCase()}`,
        'EXPORT': `${userName} đã export dữ liệu ${resource.toLowerCase()}`,
        'LOGIN': `${userName} đã đăng nhập hệ thống`,
        'LOGOUT': `${userName} đã đăng xuất`,
        'LOGIN_FAILED': `Đăng nhập thất bại cho tài khoản: ${resourceName}`,
        'VIEW': `${userName} đã xem ${resource.toLowerCase()}: ${resourceName}`
    };
    
    return descriptions[action] || `${userName} đã thực hiện ${action} trên ${resource}`;
}