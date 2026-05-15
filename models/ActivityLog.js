const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
            'BULK_UPDATE', 'IMPORT', 'EXPORT', 'VIEW', 'LOGIN_FAILED'
        ]
    },
    resource: {
        type: String,
        required: true,
        enum: [
            'PRODUCT', 'CATEGORY', 'ORDER', 'QUOTE', 'CUSTOMER',
            'BLOG', 'PROJECT', 'BRAND', 'PAGE', 'SETTING',
            'INVENTORY', 'PRICE', 'USER', 'SYSTEM'
        ]
    },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    resourceName: { type: String },
    description: { type: String, required: true },
    changes: {
        before: { type: mongoose.Schema.Types.Mixed },
        after: { type: mongoose.Schema.Types.Mixed }
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    errorMessage: { type: String }
}, { timestamps: true });

// Index cho truy vấn nhanh
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);