const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to identify user from token and pass to request and views.
// This runs on EVERY request. It does NOT protect routes.
exports.identifyUser = async (req, res, next) => {
    let token;

    // We prioritize the cookie for web page navigation
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Fallback to header for API calls
        token = req.headers.authorization.split(' ')[1];
    }

    // Set defaults
    req.user = null;
    res.locals.user = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_nln_2026');
            const user = await User.findById(decoded.id).select('-password');
            
            if (user) {
                req.user = user; // Attach Mongoose document to req
                res.locals.user = user.toObject(); // Attach plain object to locals for safety in templates
            }
        } catch (error) {
            // Token is invalid or expired. Clear it if it came from a cookie.
            if (req.cookies && req.cookies.token) {
                res.clearCookie('token');
            }
        }
    }
    
    next();
};

// Middleware to PROTECT routes. Requires identifyUser to have run first.
exports.protect = (req, res, next) => {
    // identifyUser middleware should have already populated req.user if token is valid
    if (req.user) {
        return next(); // User is authenticated, proceed
    }
    // User is not authenticated, block access
    if (req.accepts('html') && !req.path.startsWith('/api')) {
        // For web pages, redirect to home. A flash message could be added here.
        return res.redirect('/');
    }
    // For API requests, send a 401 Unauthorized error
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập, vui lòng đăng nhập!' });
};

// Xác thực người dùng (Không bắt buộc - Dành cho luồng Khách vãng lai mua hàng)
// This is now redundant because `identifyUser` runs on every request.
exports.optionalAuth = async (req, res, next) => {
    // `identifyUser` already populates `req.user` if a token exists, and does nothing if not.
    // So this middleware just needs to call next().
    next();
};

// Phân quyền truy cập theo Role (VD: admin, sales)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Tài khoản không có quyền thực hiện hành động này!' });
        }
        next();
    };
};