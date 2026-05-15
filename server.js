const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load cấu hình biến môi trường
dotenv.config();

const app = express();

// Kết nối cơ sở dữ liệu MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected successfully.'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Cấu hình View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ================= API ROUTES =================
const apiRoutes = require('./routes/api');

app.use('/api/v1', apiRoutes); // Gắn tất cả API vào một endpoint duy nhất /api/v1

// ================= CLIENT ROUTES =================
const indexRouter = require('./routes/index');

// Gắn tất cả các route của giao diện Khách hàng (Trang chủ, Sản phẩm, Tin tức...)
app.use('/', indexRouter);

// ================= ADMIN ROUTES =================
const adminRoutes = require('./routes/admin');

// Gắn tất cả các route của giao diện Quản trị (Admin)
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 89;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Export app để Vercel có thể chạy được dưới dạng Serverless Function
module.exports = app;