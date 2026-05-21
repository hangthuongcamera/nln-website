const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_nln_2026';

// Hàm tạo token sống trong 30 ngày
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Hàm helper để gửi token về client và set cookie
const sendTokenResponse = (user, statusCode, res) => {
    // Tạo token
    const token = generateToken(user._id);

    const options = {
        // Cookie hết hạn sau 30 ngày, khớp với JWT
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Ngăn JavaScript phía client truy cập cookie
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true; // Chỉ gửi cookie qua HTTPS ở môi trường production
    }

    res.status(statusCode)
        .cookie('token', token, options) // Gửi cookie về cho trình duyệt
        // Vẫn gửi token trong body để logic cũ ở client không bị lỗi
        .json({ success: true, token, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};

// @desc    Đăng ký tài khoản khách hàng mới
// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }

        // Kiểm tra xem email hoặc sđt đã tồn tại chưa
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email hoặc Số điện thoại đã được sử dụng' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'customer' // Mặc định tài khoản đăng ký mới là khách hàng
        });

        // Gửi token và cookie về cho client
        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký', error: error.message });
    }
};

// @desc    Đăng nhập hệ thống
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
        }

        // Tìm user theo email
        const user = await User.findOne({ email }).select('+password');
        if (!user) { return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' }); }

        // Kiểm tra mật khẩu (Hỗ trợ cả so sánh chuỗi thường và bcrypt nếu có method matchPassword)
        let isMatch = false;
        if (typeof user.matchPassword === 'function') {
            isMatch = await user.matchPassword(password);
        } else {
            // Hỗ trợ kiểm tra cả mật khẩu hash (từ hàm register) và mật khẩu chuỗi thường (từ file test-db)
            try {
                isMatch = await bcrypt.compare(password, user.password);
            } catch (err) {
                isMatch = false;
            }
            if (!isMatch) {
                isMatch = (user.password === password);
            }
        }

        if (!isMatch) { return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' }); }

        // Sử dụng hàm helper để gửi token và cookie
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Đăng xuất người dùng
// @route   GET /api/v1/auth/logout
exports.logout = async (req, res, next) => {
    // Ghi đè cookie cũ bằng một cookie rỗng và hết hạn ngay lập tức
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
};

// @desc    Lấy thông tin User hiện tại (Profile) đang đăng nhập
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    // Nhờ middleware protect, ta chắc chắn req.user đã tồn tại ở đây
    res.status(200).json({ success: true, data: req.user });
};

// @desc    Cập nhật thông tin Profile của User đang đăng nhập
// @route   PUT /api/v1/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, dob, address } = req.body;

        // Tìm và cập nhật user dựa trên id của người dùng đang đăng nhập (được gán từ middleware protect)
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id || req.user.id,
            { name, phone, dob, address },
            { new: true, runValidators: true }
        ).select('-password'); // Không trả về trường mật khẩu bảo mật

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
        }

        res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công.', data: updatedUser });
    } catch (error) {
        console.error('Lỗi khi cập nhật profile:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ.', error: error.message });
    }
};