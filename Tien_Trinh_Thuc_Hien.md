# TIẾN TRÌNH THỰC HIỆN DỰ ÁN (TRACKING CHECKLIST)
**Dự án:** Website E-commerce Nhất Linh Nhi  
**Trạng thái:** ⏳ Đang triển khai  
**Ngày cập nhật:** 11/05/2026
*Sử dụng file này để cung cấp bối cảnh (context) cho AI khi bắt đầu phiên làm việc mới.*

---

## 🏗️ QUYẾT ĐỊNH KIẾN TRÚC HỆ THỐNG (CẬP NHẬT CHÍNH THỨC)

- **Hủy bỏ kế hoạch tách Frontend sang Next.js/React.**
- **Kiến trúc chốt lại (Monolithic):** Sử dụng toàn bộ **Node.js + Express + EJS** cho cả giao diện Khách hàng (Client) và Quản trị (Admin).
- **Mục đích:** Tối ưu hóa thời gian phát triển, tận dụng hệ thống code EJS hiện có, đồng bộ dữ liệu trực tiếp từ controller không cần qua API trung gian quá nhiều.

---

## � TÓM TẮT TRẠNG THÁI HIỆN TẠI (CURRENT STATE)

- **Phần 1 - Giao diện Khách hàng (Frontend):** HOÀN THIỆN 100% UI.
- **Phần 2 - Giao diện Quản trị (Web Admin):** Đã có UI admin cơ bản, nhưng cần tái cấu trúc lại để phù hợp hệ thống lớn hơn 15.000 mã hàng.
- **Phần 3 - Tích hợp hệ thống (Backend & Frontend Binding):** Đã tích hợp API chính cho Trang chủ, Blog, Trang tĩnh, Dự án, Giỏ hàng, Thanh toán, User Auth, Product, Category.
- **Phần 4 - Nâng cấp trọng tâm mới:** Tái cấu trúc Admin thành hệ thống quản trị dữ liệu lớn, ưu tiên Catalog/Product Center. **Đã hoàn thành Giai đoạn E - Tách module tồn kho và giá. Đang hoàn thành Giai đoạn F - Phân quyền & Vận hành (LÀM DỞ).**

---

## 🔜 BƯỚC TIẾP THEO ƯU TIÊN (NEXT STEPS)

### Ưu tiên cao nhất hiện tại: Hoàn thành Giai đoạn F - Phân quyền & Vận hành

- [x] Lập kế hoạch tái cấu trúc Admin trong `website/Ke_Hoach_Xay_Dung_Admin_UI.md`.
- [x] Xác định trọng tâm mới: quản trị dữ liệu lớn, không chỉ là UI danh sách đơn giản.
- [x] Sửa lỗi API sản phẩm khiến số lượng ở trang người dùng/admin không khớp.
- [ ] **HOÀN THÀNH GIAI ĐOẠN F:** Kiểm tra server chạy được sau khi tạo module Phân quyền & Vận hành.
- [ ] Nâng cấp API sản phẩm cho bộ lọc nâng cao.
- [ ] Nâng cấp trang `website/views/admin/products.ejs`.
- [ ] Bổ sung thống kê sản phẩm vào Dashboard.
- [ ] Chuẩn bị nền tảng thao tác hàng loạt.
- [ ] Chuẩn bị Import/Export Excel.
- [ ] Xây dựng trang kiểm tra chất lượng dữ liệu sản phẩm.

---

# PHẦN 1: GIAO DIỆN NGƯỜI DÙNG (FRONTEND / GIAO DIỆN KHÁCH HÀNG)

## 🔴 Giai đoạn 1: Chuẩn hóa UI & Cập nhật Trang Chủ (Index)

- [ ] **1.1. Tái cấu trúc file HTML hiện tại**
  - [ ] Tách Header, Footer thành các đoạn code tái sử dụng.
  - [x] Khởi tạo biến màu sắc, font chữ chuẩn trong cấu hình Tailwind CSS.

- [x] **1.2. Nâng cấp Banner Chính**
  - [x] Chuyển đổi thành Slider (Carousel) 3 ảnh.
  - [x] Thêm nút điều hướng (Trái/Phải).
  - [x] Thêm hiệu ứng chuyển slide sinh động.

- [x] **1.3. Cập nhật "Danh mục nổi bật"**
  - [x] Thêm đủ 10 card danh mục.
  - [x] Thiết lập layout hiển thị 5 card trên 1 dòng.
  - [x] Thêm hiệu ứng hover sinh động cho từng card.

- [x] **1.4. Thêm Section "Tin tức & Kinh nghiệm"**
  - [x] Đặt vị trí dưới section "Sản phẩm bán chạy".
  - [x] Thiết kế layout card bài viết.

- [x] **1.5. Kiểm tra Tiêu chuẩn & Tối ưu (SEO & UX)**
  - [x] Rà soát heading.
  - [x] Đảm bảo ảnh có `alt`.
  - [x] Thêm Favicon.
  - [x] Thay thế Logo text bằng hình ảnh.
  - [x] Kiểm tra hover/click.
  - [x] Gỡ bỏ Header cố định.

- [x] **1.6. Nâng cấp Header & Tính năng Mở rộng**
  - [x] Mega Menu danh mục 3 cấp.
  - [x] Live Search.
  - [x] Typewriter effect cho ô tìm kiếm.
  - [x] Flash Sale slider.
  - [x] Sản phẩm mới nhất slider.

- [x] **1.7. Bổ sung Component nâng cao cho Trang Chủ**
  - [x] USPs Bar.
  - [x] Brands Carousel.
  - [x] CTA báo giá sỉ.
  - [x] Back to Top.
  - [x] Testimonials / Social Proof.

- [x] **1.8. Mở rộng hiển thị Trang Chủ**
  - [x] 9 Component danh mục cấp 2 dạng Product Grid.
  - [x] Card sản phẩm có icon yêu thích.
  - [x] Grid 10 sản phẩm / danh mục.
  - [x] Nút "Xem tất cả".

---

## 🔴 Giai đoạn 2: Xây dựng Luồng Sản phẩm & Nội dung

- [x] **2.1. Trang Danh sách Sản phẩm**
  - [x] Giao diện danh sách sản phẩm, bộ lọc, phân trang.

- [x] **2.2. Trang Chi tiết Sản phẩm**
  - [x] Gallery ảnh.
  - [x] Bảng thông số kỹ thuật.
  - [x] Form yêu cầu báo giá sỉ.
  - [x] Sản phẩm liên quan.

- [x] **2.3. Trang Blog / Tin tức**
  - [x] Danh sách bài viết.
  - [x] Chi tiết bài viết chuẩn SEO.

- [x] **2.4. Trang Dự án công trình**
  - [x] Danh sách dự án.
  - [x] Chi tiết dự án.
  - [x] Phân loại dự án.

---

## 🔴 Giai đoạn 3: Luồng Giỏ hàng, Thanh toán & Người dùng

- [x] **3.1. Giỏ hàng & Thanh toán**
  - [x] Giỏ hàng động.
  - [x] Checkout.

- [x] **3.2. Hệ thống Người dùng**
  - [x] Đăng nhập / Đăng ký.
  - [x] Profile người dùng.

- [x] **3.3. Các trang tĩnh & Tiện ích**
  - [x] Trang liên hệ.
  - [x] Giao diện chuẩn bị Chatbox.

---

## 🔴 Giai đoạn 4: Các trang thông tin & Chính sách

- [x] **4.1. Trang Giới thiệu**
  - [x] Dựng layout giới thiệu công ty.
  - [x] Hiển thị năng lực cốt lõi, đội ngũ, chứng nhận/đối tác.

---

# PHẦN 2: GIAO DIỆN QUẢN TRỊ (WEB ADMIN)

> Ghi chú mới: Admin UI hiện có đã đủ khung cơ bản, nhưng với dữ liệu 15.000+ mã hàng cần nâng cấp thành hệ thống quản trị dữ liệu lớn.

## 🔴 Giai đoạn 1: Khởi tạo & Dashboard

- [x] **1.1. Dựng khung Admin**
  - [x] Sidebar.
  - [x] Topbar.
  - [x] Trang đăng nhập Admin.

- [x] **1.2. Dashboard Tổng quan cơ bản**
  - [x] Card thống kê.
  - [x] Cảnh báo sản phẩm sắp hết hàng.
  - [x] Biểu đồ.

- [ ] **1.3. Nâng cấp Dashboard cho hệ thống lớn**
  - [ ] Tổng sản phẩm.
  - [ ] Sản phẩm đang hiển thị.
  - [ ] Sản phẩm đang ẩn.
  - [ ] Sản phẩm hết hàng.
  - [ ] Sản phẩm sắp hết hàng.
  - [ ] Sản phẩm thiếu ảnh.
  - [ ] Sản phẩm thiếu giá.
  - [ ] Đơn hàng mới.
  - [ ] Báo giá mới.

---

## 🔴 Giai đoạn 2: Catalog/Product Center cho 15.000+ mã hàng

### 2.1. Quản lý Danh mục

- [x] Giao diện danh sách, tạo, sửa, xóa cây danh mục.
- [ ] Nâng cấp hiển thị số lượng sản phẩm trong từng danh mục.
- [ ] Cảnh báo danh mục không có sản phẩm.
- [ ] Ẩn/hiện danh mục.
- [ ] SEO danh mục.

### 2.2. Quản lý Sản phẩm

- [x] Giao diện danh sách sản phẩm.
- [x] Form thêm/sửa sản phẩm chi tiết.
- [x] Giá gốc, mô tả ngắn, nhãn Mới/Nổi bật/Flash Sale.
- [x] API sản phẩm đã có lọc/phân trang cơ bản.
- [x] Đã sửa lỗi tổng số sản phẩm không khớp giữa trang người dùng và trang admin.
- [ ] Nâng cấp bộ lọc nâng cao:
  - [ ] Danh mục.
  - [ ] Trạng thái hiển thị.
  - [ ] Còn hàng / hết hàng / sắp hết hàng.
  - [ ] Có ảnh / thiếu ảnh.
  - [ ] Có giá / thiếu giá.
  - [ ] Hot / Mới / Flash Sale.
- [ ] Chọn số dòng/trang: 20 / 50 / 100.
- [ ] Chọn nhiều sản phẩm.
- [ ] Thao tác hàng loạt.
- [ ] Trang kiểm tra chất lượng dữ liệu sản phẩm.

### 2.3. Import/Export Excel

- [ ] Xuất danh sách sản phẩm ra Excel.
- [ ] Nhập sản phẩm từ Excel.
- [ ] Cập nhật giá/tồn kho bằng Excel.
- [ ] Kiểm tra lỗi trước khi ghi vào DB:
  - [ ] SKU trùng.
  - [ ] Thiếu tên.
  - [ ] Thiếu danh mục.
  - [ ] Giá không hợp lệ.
  - [ ] Tồn kho không hợp lệ.

---

## 🔴 Giai đoạn 3: Quản lý Bán hàng, Khách hàng & Nội dung

- [x] **3.1. Quản lý Đơn hàng & Báo giá**
  - [x] UI xem danh sách/cập nhật trạng thái đơn hàng.
  - [x] UI theo dõi yêu cầu báo giá sỉ.

- [x] **3.2. Quản lý Khách hàng**
  - [x] Danh sách tài khoản khách hàng.
  - [x] Phân loại khách hàng.

- [x] **3.3. Quản lý Blog / Bài viết**
  - [x] Rich Text Editor.
  - [x] SEO Meta Title / Meta Description.

- [ ] **3.4. Nâng cấp vận hành bán hàng**
  - [ ] Đơn hàng mới / đang xử lý / đang giao / hoàn thành / đã hủy.
  - [ ] Ghi chú nội bộ.
  - [ ] Lọc đơn theo trạng thái/ngày/khách hàng.
  - [ ] Quản lý báo giá theo trạng thái.

---

## 🔴 Giai đoạn 4: Cấu hình Giao diện Động & Cài đặt hệ thống

- [x] **4.1. Dynamic UI**
  - [x] Tắt/mở component.
  - [x] Quản lý ảnh Slider.
  - [x] Ghim sản phẩm Bán chạy / Flash Sale.
  - [x] Thời gian đếm ngược Flash Sale/Banner phụ.
  - [x] Banner phụ.

- [x] **4.2. Settings**
  - [x] Quản lý tài khoản quản trị.
  - [x] Cấu hình hotline/email/địa chỉ.

- [ ] **4.3. Phân quyền nâng cao**
  - [ ] Super Admin.
  - [ ] Quản lý sản phẩm.
  - [ ] Nhân viên kho.
  - [ ] Nhân viên bán hàng.
  - [ ] Nhân viên nội dung.
  - [ ] Nhật ký thao tác nhân viên.

---

# PHẦN 3: TÍCH HỢP HỆ THỐNG (NODE.JS & MONGODB)

## 🔴 Giai đoạn 1: Khởi tạo Backend & Database

- [x] **1.1. Khởi tạo dự án Node.js**
  - [x] `package.json`.
  - [x] Express, Mongoose, EJS, Dotenv.
  - [x] MVC folders.
  - [x] `server.js`.
  - [x] Kết nối MongoDB.

- [x] **1.2. Thiết kế Models**
  - [x] User.
  - [x] Category.
  - [x] Product.
  - [x] Order.
  - [x] Quote.
  - [x] Blog.
  - [x] Setting.
  - [x] Project.
  - [x] Brand.
  - [x] Contact.
  - [x] Page.
  - [x] Tài liệu tích hợp CRM/ERP.

---

## 🔴 Giai đoạn 2: Chuyển đổi Template & Admin API

- [x] **2.1. Phân tách Views**
  - [x] `views/client/`.
  - [x] `views/admin/`.

- [x] **2.2. Chuyển đổi EJS Client**
  - [x] Tách partials.
  - [x] Chuyển HTML sang EJS/MPA.

- [x] **2.3. Chuyển đổi EJS Admin**
  - [x] Tách partials admin.
  - [x] Dashboard/Login.
  - [x] Projects/Brands.
  - [x] Contacts/Static Pages.
  - [x] Dynamic UI mở rộng.

- [ ] **2.4. Admin Panel API & Logic**
  - [x] Auth/JWT.
  - [x] Categories.
  - [x] Products.
  - [x] Orders/Quotes.
  - [x] Blog/Settings.
  - [x] Projects/Brands.
  - [x] Contacts.
  - [x] Pages.
  - [ ] API thống kê dashboard nâng cao.
  - [ ] API thao tác hàng loạt sản phẩm.
  - [ ] API import/export Excel.
  - [ ] API kiểm tra dữ liệu lỗi sản phẩm.

---

## 🔴 Giai đoạn 3: Client UI Binding

- [ ] **3.1. Trang Chủ & Dynamic UI**
  - [x] Dynamic Category Tree.
  - [x] Database danh mục cha/con.
  - [x] Render danh mục, Flash Sale, sản phẩm mới, sản phẩm bán chạy.
  - [x] Render Product Grids và Brand Carousel.
  - [x] Feature Flag.
  - [x] Countdown Flash Sale/Banner phụ.
  - [x] Live Search.

- [ ] **3.2. Trang Sản phẩm & Chi tiết**
  - [x] Bộ lọc, sắp xếp, phân trang.
  - [x] Thông số kỹ thuật, tồn kho, sản phẩm liên quan.

- [ ] **3.3. Trang Blog & Tĩnh**
  - [x] Blog list/detail.
  - [x] Trang tĩnh.
  - [x] About riêng.
  - [x] Contact.

- [ ] **3.4. Trang Dự án công trình**
  - [ ] Render danh sách dự án từ DB.
  - [ ] Render chi tiết dự án từ DB.

- [ ] **3.5. Profile**
  - [x] Thông tin cá nhân.
  - [x] Cập nhật thông tin.
  - [x] Lịch sử mua hàng.
  - [ ] Danh sách yêu cầu báo giá sỉ.

- [ ] **3.6. Admin UI Binding**
  - [x] Đăng nhập Admin.
  - [x] Products/Categories.
  - [x] Orders (API + View: getOrders, getOrderStats, exportOrders, updateOrderStatus, deleteOrder).
  - [x] Quotes (API + View: getQuotes, getQuoteStats, exportQuotes, updateQuoteStatus, deleteQuote).
  - [x] Customers (API + View: getCustomers, getCustomerStats, exportCustomers, getCustomerById).
  - [ ] Projects.
  - [ ] Blog.
  - [ ] Contact.
  - [ ] Page.
  - [ ] Dynamic UI.
  - [ ] Settings.

---

## 🔴 Giai đoạn 3.7: Nâng cấp Sản phẩm đa phân loại (Variants)

- [x] **Bước 1: Database**
  - [x] Bổ sung variants vào `models/Product.js`.

- [x] **Bước 2: Admin UI**
  - [x] Quản lý thuộc tính và biến thể trong `product-form.ejs`.

- [x] **Bước 3: Client UI**
  - [x] Chọn biến thể ở `product-detail.ejs`.

- [x] **Bước 4: Cart & Checkout**
  - [x] Cart lưu variant.
  - [x] Checkout gửi productId/variantId/variantName.
  - [x] Order lưu variant.

---

# PHẦN 4: NÂNG CẤP ADMIN CHO HỆ THỐNG LỚN 15.000+ MÃ HÀNG

## 🎯 Mục tiêu

Biến Admin từ giao diện CRUD cơ bản thành hệ thống vận hành catalog lớn, có khả năng quản lý hàng chục nghìn sản phẩm an toàn, nhanh và dễ dùng cho người không biết code.

---

## Giai đoạn A — Ổn định nền tảng sản phẩm

- [x] Sửa lỗi tổng số sản phẩm admin/client không khớp.
- [ ] Chuẩn hóa query API sản phẩm.
- [ ] Bổ sung bộ lọc nâng cao ở API.
- [ ] Bổ sung response thống kê sản phẩm.
- [ ] Tối ưu index MongoDB cho sản phẩm:
  - [ ] `name`.
  - [ ] `sku`.
  - [ ] `slug`.
  - [ ] `category`.
  - [ ] `isActive`.
  - [ ] `stock`.
  - [ ] `flags.isHot`.
  - [ ] `flags.isNewProduct`.
  - [ ] `flags.isFlashSale`.

---

## Giai đoạn B — Nâng cấp trang danh sách sản phẩm Admin

- [ ] Bộ lọc nâng cao.
- [ ] Chọn số dòng/trang.
- [ ] Hiển thị tổng số rõ ràng.
- [ ] Trạng thái loading/empty/error rõ ràng.
- [ ] Checkbox chọn nhiều sản phẩm.
- [ ] Thanh thao tác hàng loạt.
- [ ] Cảnh báo sản phẩm lỗi ngay trong bảng.

---

## Giai đoạn C — Dashboard vận hành

- [ ] Thống kê tổng sản phẩm.
- [ ] Thống kê sản phẩm đang hiển thị/đang ẩn.
- [ ] Thống kê hết hàng/sắp hết hàng.
- [ ] Thống kê thiếu ảnh/thiếu giá.
- [ ] Danh sách việc cần xử lý.

---

## Giai đoạn D — Công cụ dữ liệu lớn

- [ ] Import Excel.
- [ ] Export Excel.
- [ ] Màn hình preview lỗi import.
- [ ] Bulk update:
  - [ ] Bật/tắt hiển thị.
  - [ ] Đổi danh mục.
  - [ ] Gắn cờ Hot/Mới/Flash Sale.
  - [ ] Cập nhật giá.
  - [ ] Cập nhật tồn kho.

---

## Giai đoạn E — Tách module chuyên sâu

- [x] **Module tồn kho.** ✅ HOÀN THÀNH 11/05/2026
  - Controller: `website/controllers/api/inventoryController.js`
  - View: `website/views/admin/inventory.ejs`
  - Routes: `/admin/inventory` (admin.js) + API `/api/v1/inventory/*` (api.js)
  - Tính năng: Phân trang, lọc theo trạng thái tồn kho, cập nhật đơn/hàng loạt, import/export CSV, lịch sử thay đổi

- [x] **Module giá.** ✅ HOÀN THÀNH 11/05/2026
  - Controller: `website/controllers/api/priceController.js`
  - View: `website/views/admin/prices.ejs`
  - Routes: `/admin/prices` (admin.js) + API `/api/v1/prices/*` (api.js)
  - Tính năng: Phân trang, lọc theo trạng thái giá, cập nhật giá bán/sỉ/cũ, import/export CSV, lịch sử thay đổi

- [ ] Module kiểm tra chất lượng dữ liệu.

---

## Giai đoạn F — Phân quyền & Vận hành

### ⚠️ TRẠNG THÁI: ĐANG LÀM DỞ - CẦN KIỂM TRA LẠI

**Ngày bắt đầu:** 11/05/2026  
**Ngày tạm dừng:** 11/05/2026 16:58

#### ✅ ĐÃ HOÀN THÀNH:

1. **Tạo Models & Middleware:**
   - ✅ `website/models/ActivityLog.js` - Model nhật ký hoạt động
   - ✅ `website/middleware/activityLogger.js` - Middleware ghi log

2. **Tạo Controllers:**
   - ✅ `website/controllers/api/activityLogController.js` - 5 functions:
     - `getActivityLogs` - Lấy danh sách log
     - `getActivityLogById` - Chi tiết log
     - `getActivityStats` - Thống kê
     - `cleanOldLogs` - Xóa log cũ
     - `exportLogs` - Xuất CSV
   - ✅ `website/controllers/api/roleController.js` - 5 functions:
     - `getUsersByRole` - Lấy user theo role
     - `getRoleStats` - Thống kê role
     - `updateUserRole` - Cập nhật role
     - `toggleUserStatus` - Bật/tắt user
     - `getRolePermissions` - Lấy quyền
   - ✅ `website/controllers/api/systemController.js` - 4 functions:
     - `getSystemConfig` - Lấy cấu hình
     - `updateSystemConfig` - Cập nhật cấu hình
     - `getServerStatus` - Trạng thái server
     - `toggleMaintenance` - Bật/tắt bảo trì

3. **Tạo Views:**
   - ✅ `website/views/admin/activity-logs.ejs` - Giao diện nhật ký
   - ✅ `website/views/admin/roles.ejs` - Giao diện phân quyền
   - ✅ `website/views/admin/settings.ejs` - Giao diện cài đặt

4. **Cập nhật Routes:**
   - ✅ `website/routes/admin.js` - Thêm 3 routes view:
     - `/admin/activity-logs`
     - `/admin/roles`
     - `/admin/settings`
   - ✅ `website/routes/api.js` - Thêm 15 API endpoints:
     - Activity Logs: 4 endpoints (lines 294-297)
     - Roles: 5 endpoints (lines 302-306)
     - System: 4 endpoints (lines 311-314)

5. **Cập nhật Sidebar:**
   - ✅ `website/views/admin/partials/sidebar.ejs` - Thêm section "Phân Quyền & Vận Hành"

#### ⚠️ VẤN ĐỀ ĐANG GẶP PHẢI:

**Lỗi khi chạy `npm run dev`:**
```
Error: listen EADDRINUSE: address already in use :::89
```

**Nguyên nhân:**
- Port 89 đang bị chiếm bởi process khác (PID 6548)
- Không thể kill process do Access Denied
- Process đã tự tắt nhưng nodemon vẫn đang chờ

**Trạng thái hiện tại:**
- Port 89 hiện đã trống (kiểm tra bằng `netstat -ano | findstr :89`)
- Terminal nodemon vẫn đang chạy và chờ file changes
- Chưa xác nhận được server có chạy thành công sau khi sửa lỗi routes

#### 🔧 ĐÃ SỬA LỖI TRONG routes/api.js:

**3 lỗi route mapping đã sửa:**
1. Line 304: `roleController.getUsers` → `roleController.getUsersByRole` ✅
2. Line 296: `activityLogController.exportActivityLogs` → `activityLogController.exportLogs` ✅
3. Line 311: `systemController.getSystemStatus` → `systemController.getServerStatus` ✅

#### 📋 VIỆC CẦN LÀM NGÀY MAI:

1. **Khởi động lại server:**
   - Tắt terminal nodemon hiện tại (Ctrl+C)
   - Chạy lại `npm run dev`
   - Xác nhận server chạy không lỗi

2. **Kiểm tra các trang mới:**
   - Truy cập `/admin/activity-logs`
   - Truy cập `/admin/roles`
   - Truy cập `/admin/settings`
   - Kiểm tra sidebar hiển thị đúng

3. **Test API endpoints:**
   - Test 4 API activity logs
   - Test 5 API roles
   - Test 4 API system
   - Xác nhận middleware `protect` và `authorize` hoạt động

4. **Nếu có lỗi:**
   - Kiểm tra lại tên functions trong controllers
   - Kiểm tra imports trong routes/api.js
   - Kiểm tra middleware authMiddleware

5. **Sau khi hoàn thành:**
   - Cập nhật trạng thái Giai đoạn F thành "✅ HOÀN THÀNH 100%"
   - Chuyển sang Giai đoạn tiếp theo (Module kiểm tra chất lượng dữ liệu hoặc Dashboard nâng cao)

---

# PHẦN 5: LUỒNG GIỎ HÀNG, THANH TOÁN & TÍNH NĂNG NÂNG CAO

- [ ] **5.1. Giỏ hàng & Thanh toán**
  - [x] Local Storage cart.
  - [x] Checkout lưu đơn hàng.
  - [x] Hỗ trợ khách vãng lai.

- [ ] **5.2. Realtime**
  - [ ] Chatbox realtime bằng Socket.io.

- [ ] **5.3. Future Enhancements**
  - [ ] Brand Filter.
  - [ ] Grid/List View.
  - [ ] Attribute Filter.
  - [ ] Bộ lọc trạng thái nâng cao.
  - [ ] Bulk Quote.

---

## 📋 CHECKLIST CÁC FILE ĐÃ THAY ĐỔI (GIAI ĐOẠN F - PHÂN QUYỀN & VẬN HÀNH)

### Backend Files Created:
- ✅ `website/models/ActivityLog.js` - Model nhật ký hoạt động
- ✅ `website/middleware/activityLogger.js` - Middleware ghi log tự động
- ✅ `website/controllers/api/activityLogController.js` - Controller nhật ký (5 functions)
- ✅ `website/controllers/api/roleController.js` - Controller phân quyền (5 functions)
- ✅ `website/controllers/api/systemController.js` - Controller hệ thống (4 functions)

### Backend Files Modified:
- ✅ `website/routes/admin.js` - Thêm 3 routes view mới
- ✅ `website/routes/api.js` - Thêm 15 API endpoints mới + sửa 3 lỗi mapping

### Frontend Files Created:
- ✅ `website/views/admin/activity-logs.ejs` - Giao diện nhật ký hoạt động
- ✅ `website/views/admin/roles.ejs` - Giao diện quản lý phân quyền
- ✅ `website/views/admin/settings.ejs` - Giao diện cài đặt hệ thống

### Frontend Files Modified:
- ✅ `website/views/admin/partials/sidebar.ejs` - Thêm section "Phân Quyền & Vận Hành"

### ⚠️ TRẠNG THÁI HIỆN TẠI:
- **Đã tạo xong:** Tất cả files cần thiết cho Giai đoạn F
- **Đã sửa lỗi:** 3 lỗi route mapping trong api.js
- **Chưa test:** Server chưa chạy được do port conflict
- **Cần làm tiếp:** Khởi động lại server và test các trang mới

---

## 📋 CHECKLIST CÁC FILE ĐÃ THAY ĐỔI (GIAI ĐOẠN E - MODULE TỒN KHO & GIÁ) ✅ HOÀN THÀNH

### Backend Files:
- ✅ `website/controllers/api/inventoryController.js` - Mới tạo hoàn chỉnh
- ✅ `website/controllers/api/priceController.js` - Mới tạo hoàn chỉnh
- ✅ `website/routes/admin.js` - Đã thêm routes /inventory và /prices
- ✅ `website/routes/api.js` - Đã đăng ký API endpoints cho inventory và prices
- ✅ `website/views/admin/partials/sidebar.ejs` - Đã thêm menu Inventory và Prices

### Frontend Files:
- ✅ `website/views/admin/inventory.ejs` - Mới tạo giao diện quản lý tồn kho
- ✅ `website/views/admin/prices.ejs` - Mới tạo giao diện quản lý giá

---

## 🚨 LƯU Ý QUAN TRỌNG CHO PHIÊN LÀM VIỆC TIẾP THEO

### Trước khi bắt đầu làm việc:
1. ✅ Đọc file `Tien_Trinh_Thuc_Hien.md` để nắm context
2. ✅ Kiểm tra section "VẤN ĐỀ ĐANG GẶP PHẢI" trong Giai đoạn F
3. ✅ Khởi động lại server: `cd website; npm run dev`
4. ✅ Xác nhận server chạy không lỗi
5. ✅ Test các trang mới: /admin/activity-logs, /admin/roles, /admin/settings

### Khi gặp lỗi:
- Đọc kỹ error message
- Kiểm tra file routes/api.js (đã sửa 3 lỗi mapping)
- Kiểm tra tên functions trong controllers
- Kiểm tra imports đầy đủ

### Khi hoàn thành task:
- Cập nhật trạng thái trong file này
- Ghi rõ files đã tạo/sửa
- Ghi rõ vấn đề gặp phải (nếu có)
- Ghi rõ bước tiếp theo cần làm

---

## 🎯 ƯU TIÊN TIẾP THEO (SAU KHI HOÀN THÀNH GIAI ĐOẠN F):

**Lựa chọn 1: Module kiểm tra chất lượng dữ liệu sản phẩm**
- Trang riêng lọc sản phẩm lỗi
- Thiếu ảnh, thiếu mô tả, thiếu giá
- Chưa có danh mục, trùng SKU
- Tồn kho âm, slug lỗi

**Lựa chọn 2: Nâng cấp Dashboard với thống kê đầy đủ**
- Thống kê tổng sản phẩm chi tiết
- Thống kê đơn hàng/báo giá
- Biểu đồ doanh thu
- Danh sách việc cần xử lý

**Lựa chọn 3: Import/Export Excel cho sản phẩm**
- Xuất danh sách sản phẩm
- Nhập sản phẩm từ Excel
- Cập nhật giá/tồn kho bằng Excel
- Kiểm tra lỗi trước khi ghi DB