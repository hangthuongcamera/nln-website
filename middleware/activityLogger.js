const ActivityLog = require('../models/ActivityLog');

/**
 * Log thủ công từ controller
 * @param {object} logData - Dữ liệu cần ghi log.
 * @returns {Promise<void>}
 */
exports.createLog = async (logData) => {
    try {
        // Đảm bảo các trường bắt buộc có giá trị
        const requiredFields = ['user', 'userName', 'userRole', 'action', 'resource', 'description'];
        for (const field of requiredFields) {
            if (!logData[field]) {
                console.error(`Activity Log Error: Missing required field '${field}'.`);
                return;
            }
        }

        // Gán các giá trị mặc định nếu thiếu
        const finalLogData = {
            status: 'SUCCESS',
            ...logData
        };

        await ActivityLog.create(finalLogData);
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};