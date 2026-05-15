const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Xác thực người dùng (Kiểm tra Token)
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra header có chứa Bearer token không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập, vui lòng đăng nhập!' });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_nln_2026');
        
        // Đính kèm thông tin user vào request để các Controller khác sử dụng
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Người dùng không tồn tại!' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// Xác thực người dùng (Không bắt buộc - Dành cho luồng Khách vãng lai mua hàng)
exports.optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_nln_2026');
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        // Nếu token sai hoặc hết hạn, vẫn cho đi tiếp với tư cách khách vãng lai
        next();
    }
};

// Phân quyền truy cập theo Role (VD: admin, sales)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) { return res.status(403).json({ success: false, message: 'Tài khoản không có quyền thực hiện hành động này!' }); }
        next();
    };
};