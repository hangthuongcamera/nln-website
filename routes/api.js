const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Import Middlewares
// Giả định đã có authMiddleware để kiểm tra JWT và phân quyền
const { protect, authorize } = require('../middleware/authMiddleware');

// Import Controllers
const authController = require('../controllers/api/authController');
const categoryController = require('../controllers/api/categoryController');
const productController = require('../controllers/api/productController');
const orderController = require('../controllers/api/orderController');
const quoteController = require('../controllers/api/quoteController');
const customerController = require('../controllers/api/customerController');
const projectController = require('../controllers/api/projectController');
const blogController = require('../controllers/api/blogController');
const settingController = require('../controllers/api/settingController');
const brandController = require('../controllers/api/brandController');
const contactController = require('../controllers/api/contactController');
const pageController = require('../controllers/api/pageController');
const inventoryController = require('../controllers/api/inventoryController');
const priceController = require('../controllers/api/priceController');
const wishlistController = require('../controllers/api/wishlistController');
const activityLogController = require('../controllers/api/activityLogController');
const roleController = require('../controllers/api/roleController');
const systemController = require('../controllers/api/systemController');

// ==================================
//         AUTH & USER ROUTES
// ==================================
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);
router.get('/auth/logout', authController.logout); // API đăng xuất
router.post('/auth/register', authController.register);
router.put('/auth/profile', protect, authController.updateProfile); // API Cập nhật thông tin User

// ==================================
//         CATEGORY ROUTES
// ==================================
router.route('/categories')
    .get(categoryController.getAllCategories) // Lấy tất cả danh mục
    .post(protect, authorize('admin', 'super_admin'), categoryController.createCategory); // Tạo danh mục mới

router.route('/categories/:id')
    .get(categoryController.getCategoryById) // Lấy chi tiết 1 danh mục
    .put(protect, authorize('admin', 'super_admin'), categoryController.updateCategory) // Cập nhật
    .delete(protect, authorize('admin', 'super_admin'), categoryController.deleteCategory); // Xóa

// ==================================
//         PRODUCT ROUTES
// ==================================
router.route('/products')
    .get(productController.getAllProducts) // Lấy danh sách sản phẩm (public)
    .post(protect, authorize('admin', 'super_admin'), productController.createProduct); // Tạo sản phẩm mới

router.get('/products/stats', protect, authorize('admin', 'super_admin'), productController.getProductStats); // Thống kê sản phẩm cho admin
router.get('/products/export', protect, authorize('admin', 'super_admin'), productController.exportProducts); // Xuất CSV
router.post('/products/import', protect, authorize('admin', 'super_admin'), upload.single('file'), productController.importProducts); // Nhập CSV
router.post('/products/bulk', protect, authorize('admin', 'super_admin'), productController.bulkUpdateProducts); // Thao tác hàng loạt
router.get('/products/data-quality', protect, authorize('admin', 'super_admin'), productController.getProductDataQuality); // Kiểm tra dữ liệu lỗi

// API để lấy thông tin nhiều sản phẩm theo danh sách ID (phục vụ trang so sánh)
router.post('/products/by-ids', productController.getProductsByIds);

router.route('/products/:id')
    .get(productController.getProductById) // Lấy chi tiết sản phẩm (public)
    .put(protect, authorize('admin', 'super_admin'), productController.updateProduct) // Cập nhật
    .delete(protect, authorize('admin', 'super_admin'), productController.deleteProduct); // Xóa

// ==================================
//         INVENTORY ROUTES
// ==================================
router.get('/inventory', protect, authorize('admin', 'super_admin', 'warehouse_staff'), inventoryController.getInventory);
router.get('/inventory/stats', protect, authorize('admin', 'super_admin', 'warehouse_staff'), inventoryController.getInventoryStats);
router.put('/inventory/:id', protect, authorize('admin', 'super_admin', 'warehouse_staff'), inventoryController.updateInventory);
router.put('/inventory/bulk', protect, authorize('admin', 'super_admin', 'warehouse_staff'), inventoryController.bulkUpdateInventory);
router.post('/inventory/import', protect, authorize('admin', 'super_admin', 'warehouse_staff'), upload.single('file'), inventoryController.importInventory);
router.get('/inventory/export', protect, authorize('admin', 'super_admin', 'warehouse_staff'), inventoryController.exportInventory);
router.get('/inventory/history/:id', protect, authorize('admin', 'super_admin', 'warehouse_staff'), inventoryController.getInventoryHistory);

// ==================================
//         PRICE ROUTES
// ==================================
router.get('/prices', protect, authorize('admin', 'super_admin', 'sales'), priceController.getPrices);
router.get('/prices/stats', protect, authorize('admin', 'super_admin'), priceController.getPriceStats);
router.put('/prices/:id', protect, authorize('admin', 'super_admin'), priceController.updatePrice);
router.put('/prices/bulk', protect, authorize('admin', 'super_admin'), priceController.bulkUpdatePrices);
router.post('/prices/import', protect, authorize('admin', 'super_admin'), upload.single('file'), priceController.importPrices);
router.get('/prices/export', protect, authorize('admin', 'super_admin'), priceController.exportPrices);
router.get('/prices/history/:id', protect, authorize('admin', 'super_admin'), priceController.getPriceHistory);

// ==================================
//         ORDER API ROUTES
// ==================================

// @route   POST /api/v1/orders
// @desc    Tạo đơn hàng mới
// @access  Public (Khách vãng lai hoặc đã đăng nhập)
router.post(
    '/orders',
    orderController.createOrder
);

// @route   GET /api/v1/orders
// @desc    Lấy danh sách đơn hàng (hỗ trợ filter, pagination)
// @access  Private (Admin, Sales)
router.get(
    '/orders', 
    protect, 
    authorize('admin', 'super_admin', 'sales'), 
    orderController.getOrders
);

// @route   GET /api/v1/orders/stats
// @desc    Lấy thống kê đơn hàng
// @access  Private (Admin, Sales)
router.get(
    '/orders/stats',
    protect,
    authorize('admin', 'super_admin', 'sales'),
    orderController.getOrderStats
);

// @route   GET /api/v1/orders/my-orders
// @desc    Lấy danh sách đơn hàng của User đang đăng nhập
// @access  Private (Khách hàng đã đăng nhập)
router.get('/orders/my-orders', protect, orderController.getMyOrders);

// @route   GET /api/v1/orders/:id
// @desc    Lấy chi tiết một đơn hàng
// @access  Private (Admin, Sales, hoặc chủ của đơn hàng)
router.get(
    '/orders/:id', 
    protect, 
    orderController.getOrderById // Controller sẽ tự kiểm tra quyền sở hữu
);

// @route   PUT /api/v1/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng
// @access  Private (Admin, Sales)
router.put(
    '/orders/:id/status', 
    protect, 
    authorize('admin', 'super_admin', 'sales'), 
    orderController.updateOrderStatus
);

// @route   DELETE /api/v1/orders/:id
// @desc    Xóa đơn hàng
// @access  Private (Admin)
router.delete(
    '/orders/:id',
    protect,
    authorize('admin', 'super_admin'),
    orderController.deleteOrder
);

// ==================================
//         QUOTE API ROUTES
// ==================================

// @route   POST /api/v1/quotes
// Khách hàng vãng lai hoặc đã đăng nhập đều có thể gửi báo giá (không bắt buộc protect)
router.post('/quotes', quoteController.createQuote);

// @route   GET /api/v1/quotes
// Lấy danh sách báo giá (Dành cho Admin/Sales)
router.get('/quotes', protect, authorize('admin', 'super_admin', 'sales'), quoteController.getQuotes);

// @route   GET /api/v1/quotes/stats
// Lấy thống kê báo giá
router.get('/quotes/stats', protect, authorize('admin', 'super_admin', 'sales'), quoteController.getQuoteStats);

// @route   GET /api/v1/quotes/:id
// Lấy chi tiết báo giá
router.get('/quotes/:id', protect, authorize('admin', 'super_admin', 'sales'), quoteController.getQuoteById);

// @route   PUT /api/v1/quotes/:id/status
// Cập nhật trạng thái báo giá
router.put('/quotes/:id/status', protect, authorize('admin', 'super_admin', 'sales'), quoteController.updateQuoteStatus);

// @route   DELETE /api/v1/quotes/:id
// Xóa báo giá
router.delete('/quotes/:id', protect, authorize('admin', 'super_admin'), quoteController.deleteQuote);

// ==================================
//         CUSTOMER API ROUTES
// ==================================

// @route   GET /api/v1/customers
// @desc    Lấy danh sách khách hàng (hỗ trợ filter, pagination, sort)
// @access  Private (Admin, Sales)
router.get(
    '/customers',
    protect,
    authorize('admin', 'super_admin', 'sales'),
    customerController.getCustomers
);

// @route   GET /api/v1/customers/stats
// @desc    Lấy thống kê khách hàng
// @access  Private (Admin, Sales)
router.get(
    '/customers/stats',
    protect,
    authorize('admin', 'super_admin', 'sales'),
    customerController.getCustomerStats
);

// @route   GET /api/v1/customers/:id
// @desc    Lấy chi tiết một khách hàng
// @access  Private (Admin, Sales)
router.get(
    '/customers/:id',
    protect,
    authorize('admin', 'super_admin', 'sales'),
    customerController.getCustomerById
);

// ==================================
//         PROJECT ROUTES
// ==================================

router.route('/projects')
    .get(projectController.getAllProjects) // Khách hàng xem danh sách dự án
    .post(protect, authorize('admin', 'super_admin', 'content'), projectController.createProject); // Admin/Content tạo dự án

router.route('/projects/:id')
    .get(projectController.getProjectById) // Khách hàng xem chi tiết
    .put(protect, authorize('admin', 'super_admin', 'content'), projectController.updateProject) // Admin cập nhật
    .delete(protect, authorize('admin', 'super_admin', 'content'), projectController.deleteProject); // Admin xóa


// ==================================
//         BLOG API ROUTES
// ==================================

router.route('/blogs')
    .get(blogController.getAllBlogs) // Lấy danh sách bài viết (public)
    .post(protect, authorize('admin', 'super_admin', 'content'), blogController.createBlog); // Tạo bài viết

router.get('/blogs/slug/:slug', blogController.getBlogBySlug); // Lấy bài viết theo slug (public)

router.route('/blogs/:id')
    .put(protect, authorize('admin', 'super_admin', 'content'), blogController.updateBlog) // Cập nhật
    .delete(protect, authorize('admin', 'super_admin', 'content'), blogController.deleteBlog); // Xóa

// ==================================
//         SETTINGS API ROUTES
// ==================================
router.route('/settings')
    .get(settingController.getSettings) // Frontend lấy cấu hình (Public)
    .put(protect, authorize('admin', 'super_admin'), settingController.updateSettings); // Admin lưu cấu hình

// ==================================
//         BRAND API ROUTES
// ==================================
router.route('/brands')
    .get(brandController.getAllBrands) // Khách hàng xem danh sách thương hiệu
    .post(protect, authorize('admin', 'super_admin', 'content'), brandController.createBrand); // Admin tạo thương hiệu

router.route('/brands/:id')
    .get(brandController.getBrandById)
    .put(protect, authorize('admin', 'super_admin', 'content'), brandController.updateBrand)
    .delete(protect, authorize('admin', 'super_admin'), brandController.deleteBrand);

// ==================================
//         CONTACT API ROUTES
// ==================================
router.route('/contacts')
    .post(contactController.submitContact) // Khách hàng gửi liên hệ (Public)
    .get(protect, authorize('admin', 'super_admin', 'sales'), contactController.getContacts); // Admin xem danh sách

router.route('/contacts/:id')
    .get(protect, authorize('admin', 'super_admin', 'sales'), contactController.getContactById) // Admin xem chi tiết
    .delete(protect, authorize('admin', 'super_admin'), contactController.deleteContact); // Admin xóa

router.put('/contacts/:id/status', protect, authorize('admin', 'super_admin', 'sales'), contactController.updateContactStatus); // Đánh dấu đã xử lý

// ==================================
//         STATIC PAGE API ROUTES
// ==================================
router.route('/pages')
    .get(pageController.getPages) // Danh sách trang tĩnh (Public)
    .post(protect, authorize('admin', 'super_admin', 'content'), pageController.createPage); // Tạo trang

router.get('/pages/slug/:slug', pageController.getPageBySlug); // Chi tiết trang theo slug (Public)

router.route('/pages/:id')
    .put(protect, authorize('admin', 'super_admin', 'content'), pageController.updatePage)
    .delete(protect, authorize('admin', 'super_admin'), pageController.deletePage);

// ==================================
//         ACTIVITY LOG ROUTES
// ==================================
router.get('/activity-logs', protect, authorize('admin', 'super_admin'), activityLogController.getActivityLogs);
router.get('/activity-logs/stats', protect, authorize('admin', 'super_admin'), activityLogController.getActivityStats);
router.get('/activity-logs/export', protect, authorize('admin', 'super_admin'), activityLogController.exportLogs);
router.get('/activity-logs/:id', protect, authorize('admin', 'super_admin'), activityLogController.getActivityLogById);

// ==================================
//         ROLE & USER MANAGEMENT ROUTES
// ==================================
router.get('/roles/permissions', protect, authorize('admin', 'super_admin'), roleController.getRolePermissions);
router.get('/roles/stats', protect, authorize('admin', 'super_admin'), roleController.getRoleStats);
router.get('/roles/users', protect, authorize('admin', 'super_admin'), roleController.getUsersByRole);
router.put('/roles/users/:id/role', protect, authorize('super_admin'), roleController.updateUserRole);
router.put('/roles/users/:id/status', protect, authorize('admin', 'super_admin'), roleController.toggleUserStatus);

// ==================================
//         SYSTEM CONFIGURATION ROUTES
// ==================================
router.get('/system/status', protect, authorize('admin', 'super_admin'), systemController.getServerStatus);
router.get('/system/config', protect, authorize('admin', 'super_admin'), systemController.getSystemConfig);
router.put('/system/config', protect, authorize('super_admin'), systemController.updateSystemConfig);
router.put('/system/maintenance', protect, authorize('super_admin'), systemController.toggleMaintenance);

// ==================================
//         WISHLIST ROUTES
// ==================================
router.post('/wishlist/toggle', protect, wishlistController.toggleWishlist);
router.get('/wishlist', protect, wishlistController.getWishlist);
router.get('/wishlist/check/:productId', protect, wishlistController.checkWishlistStatus);

module.exports = router;
