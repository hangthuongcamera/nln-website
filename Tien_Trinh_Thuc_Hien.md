# TIẾN TRÌNH THỰC HIỆN DỰ ÁN (TRACKING CHECKLIST)
**Dự án:** Website E-commerce Nhất Linh Nhi  
**Trạng thái:** ⏳ Đang triển khai  
**Ngày cập nhật:** 19/05/2026
*Sử dụng file này để cung cấp bối cảnh (context) cho AI khi bắt đầu phiên làm việc mới.*

---

## 🏗️ QUYẾT ĐỊNH KIẾN TRÚC HỆ THỐNG (CẬP NHẬT CHÍNH THỨC)

- **Hủy bỏ kế hoạch tách Frontend sang Next.js/React.**
- **Kiến trúc chốt lại (Monolithic):** Sử dụng toàn bộ **Node.js + Express + EJS** cho cả giao diện Khách hàng (Client) và Quản trị (Admin).
- **Mục đích:** Tối ưu hóa thời gian phát triển, tận dụng hệ thống code EJS hiện có, đồng bộ dữ liệu trực tiếp từ controller không cần qua API trung gian quá nhiều.

---

## � TÓM TẮT TRẠNG THÁI HIỆN TẠI (CURRENT STATE)

- **Giao diện Khách hàng (Frontend):** Đã hoàn thiện UI và tích hợp API đầy đủ. Các chức năng hiển thị động (Flash Sale, Danh mục nổi bật) đã được kết nối với Web Admin.
- **Giao diện Quản trị (Web Admin):**
  - **Trung tâm Sản phẩm:** Đã hoàn thiện với bộ lọc nâng cao, phân trang, import/export Excel, và thao tác hàng loạt.
  - **Quản lý Danh mục:** Đã hoàn thiện với chức năng bật/tắt và ghim danh mục nổi bật.
  - **Cấu hình Giao diện động:** Đã hoàn thiện, cho phép quản lý hiển thị các khối trên trang chủ và ghim sản phẩm.
  - **Các module khác:** Đã có khung sườn và API cơ bản.

---

## ✅ CÁC CHỨC NĂNG LỚN VỪA HOÀN THÀNH

1.  **Hoàn thiện Trung tâm Sản phẩm (Product Center):**
    - Triển khai đầy đủ bộ lọc nâng cao, phân trang server-side, sắp xếp.
    - Hoàn thiện chức năng Import/Export Excel với khả năng xử lý lỗi thông minh.
    - Hoàn thiện chức năng Thao tác hàng loạt (Xóa nhiều sản phẩm).
    - Sửa tất cả các lỗi liên quan đến tải dữ liệu, cập nhật, và xóa sản phẩm.
2.  **Hoàn thiện Cấu hình Giao diện động (Dynamic UI):**
    - Triển khai chức năng bật/tắt các khối giao diện trên trang chủ.
    - Hoàn thiện chức năng ghim sản phẩm "Bán chạy" và "Flash Sale" với cơ chế giá chuyên nghiệp.
    - Sửa lỗi lưu cấu hình Flash Sale (thời gian, tiêu đề).
3.  **Hoàn thiện Quản lý Danh mục:**
    - Triển khai chức năng bật/tắt danh mục.
    - Triển khai chức năng ghim "Danh mục nổi bật" lên trang chủ.

---

## 🔜 BƯỚC TIẾP THEO ƯU TIÊN (NEXT STEPS)
- [ ] **Triển khai các tính năng mới cho trang Client:**
  - [x] Phần 1: Xây dựng các tiêu điểm trên header. ✅
  - [x] Phần 2: Nâng cấp thanh tìm kiếm với bộ lọc danh mục. ✅
  - [x] Phần 3: Thêm tính năng "So sánh" và "Yêu thích". ✅ (Đã xong phần logic và trang yêu thích)
  - [ ] Phần 4: Mở rộng "Danh mục nổi bật" với hình ảnh.
- [ ] **Hoàn thiện các chức năng Admin còn lại:**
  - [ ] Hoàn thiện chức năng "Thao tác hàng loạt" (Thêm: Bật/Tắt hiển thị, Đổi danh mục).
  - [ ] Hoàn thiện chức năng quản lý Banner chính (Slider) trong trang Cấu hình Giao diện.
  - [ ] Xây dựng trang kiểm tra chất lượng dữ liệu sản phẩm.
  - [ ] Nâng cấp Dashboard với các thống kê chi tiết hơn.

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

- [x] Giao diện danh sách, tạo, sửa, xóa cây danh mục. ✅
- [x] Nâng cấp hiển thị số lượng sản phẩm trong từng danh mục. ✅
- [ ] Cảnh báo danh mục không có sản phẩm.
- [x] Ẩn/hiện danh mục. ✅
- [x] SEO danh mục (Ghim danh mục nổi bật). ✅

### 2.2. Quản lý Sản phẩm

- [x] Giao diện danh sách sản phẩm.
- [x] Form thêm/sửa sản phẩm chi tiết.
- [x] Giá gốc, mô tả ngắn, nhãn Mới/Nổi bật/Flash Sale.
- [x] API sản phẩm đã có lọc/phân trang cơ bản.
- [x] Đã sửa lỗi tổng số sản phẩm không khớp giữa trang người dùng và trang admin.
- [x] Nâng cấp bộ lọc nâng cao: ✅
  - [x] Danh mục.
  - [x] Trạng thái hiển thị.
  - [x] Còn hàng / hết hàng / sắp hết hàng.
  - [x] Có ảnh / thiếu ảnh.
  - [x] Có giá / thiếu giá.
  - [x] Hot / Mới / Flash Sale.
- [x] Chọn số dòng/trang: 20 / 50 / 100. ✅
- [x] Chọn nhiều sản phẩm. ✅
- [x] Thao tác hàng loạt (Xóa). ✅
- [ ] Trang kiểm tra chất lượng dữ liệu sản phẩm.

### 2.3. Import/Export Excel

- [x] Xuất danh sách sản phẩm ra Excel. ✅
- [x] Nhập sản phẩm từ Excel. ✅
- [x] Cập nhật giá/tồn kho bằng Excel. ✅
- [x] Kiểm tra lỗi trước khi ghi vào DB: ✅
  - [x] SKU trùng.
  - [x] Thiếu tên.
  - [x] Thiếu danh mục.
  - [x] Giá không hợp lệ.
  - [x] Tồn kho không hợp lệ.

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
  - [x] Tắt/mở component. ✅
  - [ ] Quản lý ảnh Slider.
  - [x] Ghim sản phẩm Bán chạy / Flash Sale. ✅
  - [x] Thời gian đếm ngược Flash Sale. ✅
  - [x] Banner phụ. ✅

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
- [x] Chuẩn hóa query API sản phẩm. ✅
- [x] Bổ sung bộ lọc nâng cao ở API. ✅
- [x] Bổ sung response thống kê sản phẩm. ✅
- [x] Tối ưu index MongoDB cho sản phẩm: ✅
  - [x] `name`.
  - [x] `sku`.
  - [x] `slug`.
  - [x] `category`.
  - [x] `isActive`.
  - [x] `stock`.
  - [x] `flags.isHot`.
  - [x] `flags.isNewProduct`.
  - [x] `flags.isFlashSale`.

---

## Giai đoạn B — Nâng cấp trang danh sách sản phẩm Admin

- [x] Bộ lọc nâng cao. ✅
- [x] Chọn số dòng/trang. ✅
- [x] Hiển thị tổng số rõ ràng. ✅
- [x] Trạng thái loading/empty/error rõ ràng. ✅
- [x] Checkbox chọn nhiều sản phẩm. ✅
- [x] Thanh thao tác hàng loạt. ✅
- [x] Cảnh báo sản phẩm lỗi ngay trong bảng. ✅

---

## Giai đoạn C — Dashboard vận hành

- [x] Thống kê tổng sản phẩm. ✅
- [x] Thống kê sản phẩm đang hiển thị/đang ẩn. ✅
- [x] Thống kê hết hàng/sắp hết hàng. ✅
- [x] Thống kê thiếu ảnh/thiếu giá. ✅
- [ ] Danh sách việc cần xử lý.

---

## Giai đoạn D — Công cụ dữ liệu lớn

- [x] Import Excel. ✅
- [x] Export Excel. ✅
- [x] Màn hình preview lỗi import. ✅
- [x] Bulk update: ✅
  - [x] Xóa hàng loạt. ✅
  - [ ] Bật/tắt hiển thị hàng loạt.
  - [ ] Đổi danh mục.
  - [ ] Gắn cờ Hot/Mới/Flash Sale.
  - [ ] Cập nhật giá.

---

## Giai đoạn E — Tách module chuyên sâu

- [x] **Module tồn kho.** ✅ HOÀN THÀNH 11/05/2026
  - Controller: `website/controllers/api/inventoryController.js`
  - View: `website/views/admin/inventory.ejs`
  - Routes: `/admin/inventory` (admin.js) + API `/api/v1/inventory/*` (api.js)
  - Tính năng: Phân trang, lọc theo trạng thái tồn kho, cập nhật đơn/hàng loạt, import/export Excel, lịch sử thay đổi

- [x] **Module giá.** ✅ HOÀN THÀNH 11/05/2026
  - Controller: `website/controllers/api/priceController.js`
  - View: `website/views/admin/prices.ejs`
  - Routes: `/admin/prices` (admin.js) + API `/api/v1/prices/*` (api.js)
  - Tính năng: Phân trang, lọc theo trạng thái giá, cập nhật giá bán/sỉ/cũ, import/export Excel, lịch sử thay đổi

- [ ] Module kiểm tra chất lượng dữ liệu.

---

## Giai đoạn F — Phân quyền & Vận hành

### ✅ TRẠNG THÁI: HOÀN THÀNH

**Ngày bắt đầu:** 11/05/2026
**Ngày hoàn thành:** 19/05/2026

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
     - `exportLogs` - Xuất Excel
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

#### ✅ VẤN ĐỀ ĐÃ GIẢI QUYẾT:

- Lỗi kẹt port 89 (`EADDRINUSE :::89`).
- Các lỗi mapping trong `routes/api.js`.
- **Lỗi render giao diện Admin (trang trắng) do EJS không tìm thấy `partials/head`.** ✅ ĐÃ SỬA

#### 📋 KẾT QUẢ:

- Các trang `/admin/settings`, `/admin/roles`, `/admin/activity-logs` đã hoạt động bình thường.
- Giai đoạn F đã hoàn tất, sẵn sàng cho các bước tiếp theo.

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

### ✅ TRẠNG THÁI HIỆN TẠI:
- **Đã tạo xong:** Tất cả files cần thiết cho Giai đoạn F
- **Đã sửa lỗi:** 3 lỗi route mapping trong api.js
- **Vấn đề Port:** Lỗi EADDRINUSE :::89 đã được giải quyết.
- **Trạng thái:** Đã đánh dấu hoàn thành Giai đoạn F.

---

# PHẦN 6: KẾ HOẠCH PHÁT TRIỂN TÍNH NĂNG MỚI (ROADMAP MỞ RỘNG)

## 6.1. Phần 1: Xây dựng các tiêu điểm trên header (Header USPs Bar)
- [x] **Thiết kế:** ✅
  - [x] Xây dựng một thanh thông báo (top-bar) nằm ở vị trí trên cùng của trang web.
  - [x] Thanh này sẽ hiển thị các dòng chữ (cam kết, thông báo khuyến mãi) với hiệu ứng xuất hiện và biến mất tuần tự.
- [x] **Quản trị động:** ✅
  - [x] Trong trang Admin "Cấu hình giao diện", tạo một mục mới cho phép quản lý các dòng chữ trên top-bar.
  - [x] Admin có thể thêm, sửa, xóa, và sắp xếp thứ tự các dòng chữ này.

## 6.2. Phần 2: Nâng cấp thanh tìm kiếm (Advanced Search)
- [x] **Logic:** ✅
  - [x] Khi người dùng nhấn Enter hoặc nút tìm kiếm, hệ thống sẽ chuyển hướng đến trang danh sách sản phẩm (`/category`).
  - [x] URL sẽ chứa cả tham số từ khóa tìm kiếm (`?q=...`).
  - [x] Trang danh sách sản phẩm (`/category`) sẽ đọc tham số `q` và hiển thị kết quả tìm kiếm tương ứng.

## 6.3. Phần 3: Thêm tính năng "So sánh" và "Yêu thích" (Compare & Wishlist)
- [x] **Giao diện (UI):** ✅
  - [x] Header: Thêm 2 icon mới cho "So sánh" và "Yêu thích" bên cạnh icon giỏ hàng, kèm theo số đếm.
  - [x] Card sản phẩm: Thêm icon "So sánh" và "Yêu thích" trên mỗi card sản phẩm.
- [x] **Tính năng "Yêu thích" (Wishlist):** ✅
  - [x] Database: Cập nhật `User` model, thêm một trường `wishlist`.
  - [x] API: Xây dựng các endpoints để thêm/xóa/lấy sản phẩm yêu thích.
  - [x] Trang người dùng: Tạo một trang mới trong tài khoản khách hàng để hiển thị danh sách các sản phẩm đã yêu thích. ✅
- [x] **Tính năng "So sánh" (Compare):** ✅
  - [x] Logic: Sử dụng `localStorage` của trình duyệt để lưu danh sách ID các sản phẩm người dùng chọn so sánh.
  - [ ] Giao diện: Tạo một trang "So sánh sản phẩm" riêng biệt, hiển thị các sản phẩm dưới dạng bảng với các thuộc tính/thông số kỹ thuật được liệt kê theo hàng để dễ đối chiếu. (Sẽ làm ở bước sau)

## 6.4. Phần 4: Mở rộng "Danh mục nổi bật" với hình ảnh (Visual Featured Categories)
- [ ] **Database:**
  - [ ] Cập nhật `Category` model, thêm trường `image` (String) để lưu đường dẫn ảnh đại diện.
- [ ] **Giao diện Admin:**
  - [ ] Trong trang quản lý danh mục, thêm chức năng cho phép upload ảnh đại diện cho mỗi danh mục.
- [ ] **Giao diện Trang chủ:**
  - [ ] Thiết kế lại component "Danh mục nổi bật".
  - [ ] Thay thế các card chỉ có icon và chữ bằng các card sử dụng hình ảnh đã tải lên làm nền, kết hợp hiệu ứng hover để tăng tính tương tác và thu hút.
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

## 🎯 ƯU TIÊN TIẾP THEO:

1.  **Hoàn thiện Thao tác hàng loạt:** Bổ sung các chức năng còn lại như Bật/Tắt hiển thị, Thay đổi danh mục.
2.  **Hoàn thiện Quản lý Banner:** Xây dựng giao diện và logic để quản lý các banner chính (slider) trong trang Cấu hình Giao diện.
3.  **Xây dựng Module Kiểm tra Chất lượng Dữ liệu:** Tạo một trang chuyên dụng để lọc và xử lý nhanh các sản phẩm bị lỗi dữ liệu (thiếu ảnh, thiếu giá, v.v.).