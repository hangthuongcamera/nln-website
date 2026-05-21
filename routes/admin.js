const express = require('express');
const router = express.Router();

// LƯU Ý: Việc bảo vệ (Protect) các trang Admin đang được xử lý ở phía Frontend 
// (chạy script kiểm tra Token trong localStorage). Nếu không có Token, 
// Javascript sẽ tự động chuyển hướng về trang /admin/login.

// ==================================
//         AUTH & DASHBOARD
// ==================================
router.get('/login', (req, res) => {
    res.render('admin/login');
});

router.get('/', (req, res) => {
    res.render('admin/dashboard');
});

router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

// ==================================
//         PRODUCTS & CATEGORIES
// ==================================
router.get('/categories', (req, res) => {
    res.render('admin/categories');
});

router.get('/products', (req, res) => {
    res.render('admin/products');
});

router.get('/product-form', (req, res) => {
    res.render('admin/product-form');
});

router.get('/data-quality', (req, res) => {
    res.render('admin/data-quality', { currentPath: '/admin/data-quality' });
});

// ==================================
//         INVENTORY & PRICING
// ==================================
router.get('/inventory', (req, res) => {
    res.render('admin/inventory');
});

router.get('/prices', (req, res) => {
    res.render('admin/prices');
});

// ==================================
//         CÁC TRANG KHÁC (DỰ ÁN, BRANDS, LIÊN HỆ, V.V...)
// ==================================
router.get('/orders', (req, res) => {
    res.render('admin/orders'); 
});

router.get('/quotes', (req, res) => {
    res.render('admin/quotes'); 
});

router.get('/customers', (req, res) => {
    res.render('admin/customers'); 
});

router.get('/projects', (req, res) => {
    res.render('admin/projects', { currentPath: '/admin/projects' });
});

router.get('/brands', (req, res) => {
    res.render('admin/brands', { currentPath: '/admin/brands' });
});

router.get('/contacts', (req, res) => {
    res.render('admin/contacts', { currentPath: '/admin/contacts' });
});

router.get('/static-pages', (req, res) => {
    res.render('admin/static-pages', { currentPath: '/admin/static-pages' });
});

router.get('/dynamic-ui', (req, res) => {
    res.render('admin/dynamic-ui', { currentPath: '/admin/dynamic-ui' });
});

// ==================================
//         PHÂN QUYỀN & VẬN HÀNH
// ==================================
router.get('/activity-logs', (req, res) => {
    res.render('admin/activity-logs', { currentPath: '/admin/activity-logs' });
});

router.get('/roles', (req, res) => {
    res.render('admin/roles', { currentPath: '/admin/roles' });
});

router.get('/settings', (req, res) => {
    res.render('admin/settings', { currentPath: '/admin/settings' });
});

module.exports = router;
