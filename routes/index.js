const express = require('express');
const router = express.Router();

// Nạp Controller chứa các hàm xử lý giao diện Client
const clientController = require('../controllers/clientController');

// 1. Tuyến đường cho Trang chủ
router.get('/', clientController.getHomePage);

// 2. Tuyến đường cho Sản phẩm & Cửa hàng
router.get('/category', clientController.getCategoryPage);
router.get('/product/:slug', clientController.getProductDetailPage);

// 3. Tuyến đường cho Tin tức & Blog (Phần chúng ta vừa thêm)
router.get('/tin-tuc', clientController.getBlogList);
router.get('/tin-tuc/:slug', clientController.getBlogDetail);

// 4. Tuyến đường cho các Trang tĩnh (Giới thiệu, Chính sách,...)
router.get('/trang/:slug', clientController.getStaticPage);

// 5. Tuyến đường cho Trang Liên Hệ
router.get('/lien-he', clientController.getContactPage);

// 6. Tuyến đường cho Trang Dự án công trình
router.get('/du-an', clientController.getProjectList);

// 7. Tuyến đường cho Trang Tài Khoản Người Dùng
router.get('/tai-khoan', clientController.getProfilePage);

// 8. Tuyến đường cho Giỏ Hàng
router.get('/cart', clientController.getCartPage);

// 9. Tuyến đường cho Thanh Toán (Checkout)
router.get('/checkout', clientController.getCheckoutPage);

// Xuất router để sử dụng ở server.js
module.exports = router;