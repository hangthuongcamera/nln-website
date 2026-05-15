# TÀI LIỆU CẤU TRÚC HỆ THỐNG & API (CHUẨN BỊ TÍCH HỢP CRM/ERP)

Tài liệu này định nghĩa cấu trúc mã nguồn, danh sách các API và yêu cầu cơ sở dữ liệu MongoDB cho dự án Nhất Linh Nhi. Đặc biệt, kiến trúc được thiết kế tối ưu để có thể dễ dàng đồng bộ (Sync) dữ liệu 2 chiều với các hệ thống quản trị doanh nghiệp (CRM) và phần mềm kế hoạch hóa nguồn lực doanh nghiệp (ERP) hiện tại.

---

## 1. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

Dự án tuân theo kiến trúc **MVC (Model - View - Controller)** kết hợp **RESTful API**, chia tách rõ ràng tầng xử lý giao diện EJS và tầng cung cấp dữ liệu JSON.

```text
d:\NLN-code\website\
├── controllers/             # Tầng xử lý logic nghiệp vụ (Business Logic)
│   ├── adminController.js   # Xử lý render EJS cho Admin
│   ├── clientController.js  # Xử lý render EJS cho Client
│   └── api/                 # Tầng API Controllers (Cung cấp JSON Data)
│       ├── authController.js
│       ├── categoryController.js
│       ├── productController.js
│       ├── orderController.js
│       ├── quoteController.js
│       ├── projectController.js
│       ├── blogController.js
│       ├── brandController.js
│       ├── contactController.js
│       ├── pageController.js
│       ├── settingController.js
│       └── syncController.js# Cụm Controller đặc biệt giao tiếp với ERP/CRM
├── middleware/              # Logic trung gian
│   ├── authMiddleware.js    # Kiểm tra JWT Token, Phân quyền
│   └── uploadMiddleware.js  # Xử lý file, hình ảnh (Multer)
├── models/                  # Định nghĩa Mongoose Schemas
│   ├── Blog.js, Brand.js, Category.js, Contact.js, Order.js, Page.js
│   └── Product.js, Project.js, Quote.js, Setting.js, User.js
├── public/                  # Static Files cho website
│   ├── css/
│   ├── img/
│   └── js/
├── routes/                  # Định nghĩa Endpoints (Định tuyến)
│   ├── admin.js             # Route hiển thị Web EJS cho Admin
│   └── api.js               # Đóng gói toàn bộ chuẩn RESTful API (/api/v1/...)
│   ├── index.js             # Route hiển thị Web EJS cho Khách hàng
├── views/                   # Giao diện hiển thị (EJS Templates)
│   ├── admin/               # Giao diện EJS Admin
│   │   └── partials/        # Layout tái sử dụng (Sidebar, Topbar...)
│   └── client/              # Giao diện EJS Khách hàng
│       └── partials/        # Layout tái sử dụng (Header, Footer...)
├── *.html                   # Các file giao diện HTML tĩnh
├── *.md                     # Các file tài liệu (Tien_Trinh_Thuc_Hien.md, RULES.md...)
├── .env                     # Biến môi trường (DB URI, JWT Secret, ERP API Keys...)
├── package.json             # Khai báo metadata và thư viện NodeJS
└── server.js                # Điểm khởi chạy của toàn bộ ứng dụng NodeJS
```

---

## 2. THỐNG KÊ API ĐỂ QUẢN LÝ VÀ ĐỒNG BỘ (API SPECIFICATIONS)

Hệ thống API chia làm 3 nhóm chính: **Public API** (cho Client Frontend), **Private API** (cho Admin quản trị) và **Integration API** (Dành riêng cho Hệ thống ERP/CRM gọi vào).

### 2.1. Cụm API Đồng bộ ERP/CRM (Integration API) - Endpoint: `/api/v1/sync`
*Yêu cầu Header bắt buộc: `x-api-key` (Bảo mật giao tiếp System-to-System).*

| Method | Endpoint                     | Mục đích (Purpose)                                         | Data Sync |
|--------|------------------------------|------------------------------------------------------------|-----------|
| `GET`  | `/api/v1/sync/orders`        | ERP lấy danh sách Đơn hàng MỚI trên Web để đưa vào Kế toán.| Order     |
| `PUT`  | `/api/v1/sync/orders/:id`    | ERP cập nhật trạng thái đơn hàng (Đã xuất kho, Đang giao). | Order     |
| `POST` | `/api/v1/sync/inventory`     | ERP đẩy dữ liệu tồn kho (Stock) mới nhất lên Website.      | Product   |
| `POST` | `/api/v1/sync/prices`        | ERP đẩy bảng giá (Giá sỉ, Giá lẻ) mới nhất lên Website.    | Product   |
| `GET`  | `/api/v1/sync/customers`     | CRM kéo thông tin Khách hàng (User) mới đăng ký trên Web.  | User      |

### 2.2. Cụm API Bán hàng & Dữ liệu cốt lõi (Core RESTful API)
*Dùng cho Admin Panel và các thao tác Client AJAX (Add to cart, Search).*

**Products & Categories (Kho & Danh mục):**
- `GET /api/v1/products` : Lấy DS sản phẩm (Hỗ trợ phân trang, lọc giá, phân loại theo ERP Code).
- `POST /api/v1/products`: Thêm sản phẩm (Hỗ trợ Import Excel).
- `PUT /api/v1/products/:id`: Sửa chi tiết (SKU, Hình ảnh, Cấu hình).
- `GET /api/v1/categories`: Lấy cây danh mục động.

**Orders & Quotes (Đơn hàng & Báo giá):**
- `POST /api/v1/orders` : Khách hàng Đặt hàng (Checkout luồng Frontend).
- `GET /api/v1/orders` : Lấy danh sách đơn hàng cho Admin quản lý.
- `PUT /api/v1/orders/:id/status` : Cập nhật trạng thái đơn.
- `POST /api/v1/quotes` : Gửi yêu cầu xin báo giá sỉ (B2B).
- `GET /api/v1/quotes` : Admin xem yêu cầu báo giá.

**Users & Auth (Khách hàng & Phân quyền):**
- `POST /api/v1/auth/login` : Đăng nhập sinh JWT Token.
- `POST /api/v1/auth/register` : Đăng ký khách hàng mới.
- `GET /api/v1/users` : Admin lấy danh sách khách hàng để phân loại (Khách lẻ/Đại lý).

**CMS & Others (Nội dung & Cài đặt):**
- `CRUD /api/v1/blogs` : Quản lý Bài viết & Tin tức.
- `CRUD /api/v1/projects`: Quản lý Dự án công trình.
- `CRUD /api/v1/brands`: Quản lý Thương hiệu đối tác.
- `CRUD /api/v1/pages`: Quản lý Trang tĩnh (Giới thiệu, Chính sách).
- `CRUD /api/v1/contacts`: Lấy tin nhắn form liên hệ.
- `GET/PUT /api/v1/settings`: Đọc/Ghi cấu hình động (Tắt mở cờ Feature Flag).

---

## 3. YÊU CẦU CƠ SỞ DỮ LIỆU MONGODB (DB REQUIREMENTS FOR SYNC)

Để việc liên kết với ERP và CRM trơn tru, schema trong MongoDB cần chứa các trường (fields) đặc biệt để Mapping (khớp dữ liệu).

### 3.1. Các Collection (Bảng) cốt lõi:
1. **`users` (Khách hàng / CRM Mapping)**
2. **`products` (Vật tư, Hàng hóa / ERP Inventory Mapping)**
3. **`orders` (Đơn hàng / ERP Sales Order Mapping)**
4. **`categories`** (Danh mục)
5. **`quotes`** (Yêu cầu báo giá B2B)
6. **`projects`**, **`blogs`**, **`settings`**, **`contacts`**, **`brands`**, **`pages`** (Quản lý Web thuần)

### 3.2. Những yếu tố (Fields) BẮT BUỘC cho MongoDB Schemas:

**Trong `Product` Schema:**
- `sku` (String, Unique, Required): Mã nội bộ hàng hóa, dùng để **match** chính xác với mã vật tư trên ERP.
- `erp_id` (String): ID của phần mềm ERP (nếu cần mapping 2 chiều).
- `stock` (Number): Số lượng tồn kho (Sẽ bị ghi đè bởi API Sync từ ERP).
- `retailPrice` & `wholesalePrice` (Number): Giá lẻ và sỉ.
- `lastSyncAt` (Date): Lần cuối cùng cập nhật tồn kho từ ERP.

**Trong `Order` Schema:**
- `orderCode` (String, Unique): Mã đơn sinh tự động (Ví dụ: `DH-1025`).
- `erp_order_code` (String): Trạng thái đơn hàng sau khi tạo phiếu trên ERP trả về.
- `status`: Cần map đúng trạng thái của ERP (`Pending`, `Processing`, `Shipped`, `Completed`, `Cancelled`).
- `customer_info`: Lưu bản chụp (snapshot) thông tin khách tại thời điểm mua (Tên, sdt, địa chỉ giao).
- `syncStatus` (Enum: `pending`, `synced`, `failed`): Cờ đánh dấu đơn này đã đẩy qua ERP chưa.

**Trong `User` Schema:**
- `crm_id` (String): Chứa mã Khách hàng trong CRM.
- `customerType` (Enum: `retail`, `wholesale`, `dealer`): Để phân cấp độ bảng giá.

### 3.3. Tối ưu hóa Database (Indexing & Hooks)
- **Tạo Index:** Đánh chỉ mục (`Create Index`) bắt buộc ở các trường `sku` (Product), `email`, `phone` (User) và `orderCode` (Order) để API tìm kiếm và Sync chạy với tốc độ milisecond cho hàng chục ngàn Record.
- **Timestamp:** Mọi Collection đều bắt buộc bật `{ timestamps: true }` để ERP có thể truy vấn: *"Đưa tôi danh sách các Đơn hàng có `updatedAt` trong vòng 10 phút qua"* (Delta Sync).