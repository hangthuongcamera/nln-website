# KẾ HOẠCH TÁI CẤU TRÚC GIAO DIỆN QUẢN TRỊ (ADMIN)
**Dự án:** Website E-commerce Nhất Linh Nhi
**Ngày cập nhật:** 11/05/2026
**Mục tiêu:** Hệ thống quản trị phù hợp với hơn 15.000 mã hàng

---

## I. YÊU CẦU CHUNG

- **Quy mô dữ liệu:** Hơn 15.000 sản phẩm (SKU).
- **Bảo mật:** Đăng nhập, phân quyền theo vai trò (Super Admin, Quản lý sản phẩm, Nhân viên kho, Nhân viên bán hàng, Nhân viên nội dung).
- **UX/UI:** Tối ưu cho dữ liệu lớn — phân trang server-side, bộ lọc nâng cao, thao tác hàng loạt, import/export Excel.
- **Responsive:** Desktop và Tablet.

---

## II. CẤU TRÚC ADMIN MỚI

### A. Dashboard tổng quan

Trang đầu tiên sau đăng nhập — hiển thị cảnh báo vận hành ngay:

| Khối | Nội dung |
|------|----------|
| Tổng quan sản phẩm | Tổng sản phẩm / Đang hiển thị / Đang ẩn |
| Cảnh báo tồn kho | Hết hàng / Sắp hết hàng / Thiếu ảnh / Thiếu giá |
| Đơn hàng | Đơn mới / Đang xử lý / Hoàn thành / Đã hủy |
| Báo giá | Yêu cầu báo giá mới chưa xử lý |
| Biểu đồ | Doanh thu, đơn hàng theo thời gian |

### B. Trung tâm Sản phẩm / Catalog Center

#### 1. Danh sách sản phẩm (nâng cấp)
- Tìm kiếm: tên, SKU, mã biến thể.
- Bộ lọc nhanh: danh mục, trạng thái hiển thị, tồn kho, có/không ảnh, có/không giá, cờ (Hot, Mới, Flash Sale).
- Phân trang server-side: 20 / 50 / 100 dòng/trang.
- Chọn nhiều sản phẩm để thao tác hàng loạt.
- Hiển thị tổng số sản phẩm chính xác.

#### 2. Thao tác hàng loạt
- Bật/tắt hiển thị hàng loạt.
- Đổi danh mục hàng loạt.
- Gắn cờ Hot / Mới / Flash Sale hàng loạt.
- Xóa mềm / ẩn hàng loạt.

#### 3. Import / Export Excel
- Xuất danh sách sản phẩm ra Excel.
- Nhập sản phẩm từ Excel.
- Cập nhật giá / tồn kho hàng loạt bằng Excel.
- Màn hình kiểm tra lỗi trước khi ghi: SKU trùng, thiếu tên, thiếu danh mục, giá/tồn kho không hợp lệ.

#### 4. Kiểm tra chất lượng dữ liệu
Trang riêng để lọc sản phẩm lỗi:
- Thiếu ảnh.
- Thiếu mô tả.
- Thiếu giá.
- Chưa có danh mục.
- Trùng SKU.
- Tồn kho âm.
- Slug lỗi.

### C. Quản lý Danh mục
- Giao diện cây danh mục cha/con.
- Kéo thả sắp xếp.
- Hiển thị số lượng sản phẩm trong từng danh mục.
- Ẩn/hiện danh mục.
- SEO danh mục: title, description, slug.

### D. Quản lý Tồn kho (tách riêng)
- Danh sách tồn kho.
- Sản phẩm hết hàng / sắp hết hàng.
- Cập nhật tồn kho nhanh.
- Import tồn kho từ Excel.
- Lịch sử thay đổi tồn kho.

### E. Quản lý Giá (tách riêng)
- Giá bán lẻ / giá sỉ / giá theo nhóm khách.
- Cập nhật giá hàng loạt.
- Import bảng giá.
- Lịch sử thay đổi giá.

### F. Quản lý Đơn hàng
- Đơn mới / Đang xử lý / Đang giao / Hoàn thành / Đã hủy.
- Chi tiết đơn hàng.
- Cập nhật trạng thái.
- Ghi chú nội bộ.

### G. Quản lý Báo giá
- Yêu cầu báo giá mới.
- Đang xử lý / Đã phản hồi / Đã hủy.
- Gửi báo giá qua email.

### H. Quản lý Khách hàng / Đại lý
- Danh sách khách hàng.
- Nhóm khách: lẻ / sỉ / đại lý.
- Thông tin liên hệ.
- Lịch sử đơn hàng / báo giá.

### I. Nội dung Website
- Blog / tin tức.
- Dự án.
- Trang tĩnh (giới thiệu, chính sách).
- Banner trang chủ.
- Cấu hình khu vực trang chủ (bật/tắt component).
- SEO cơ bản.

### J. Phân quyền nhân viên
| Vai trò | Quyền |
|---------|--------|
| Super Admin | Toàn quyền |
| Quản lý sản phẩm | Thêm/sửa sản phẩm, import/export |
| Nhân viên kho | Chỉ sửa tồn kho |
| Nhân viên bán hàng | Xử lý đơn hàng/báo giá |
| Nhân viên nội dung | Blog, banner, trang tĩnh |

---

## III. LỘ TRÌNH TRIỂN KHAI

### Giai đoạn 1 — Ổn định nền tảng sản phẩm
1. Chuẩn hóa API sản phẩm: phân trang server-side, tìm kiếm, bộ lọc nâng cao, tổng số chính xác.
2. Nâng cấp trang danh sách sản phẩm admin: bộ lọc, hiển thị tổng đúng, chọn số dòng/trang.
3. Thêm thống kê sản phẩm vào Dashboard.

### Giai đoạn 2 — Công cụ quản trị dữ liệu lớn
1. Chọn nhiều sản phẩm + thao tác hàng loạt.
2. Import / Export Excel.
3. Trang kiểm tra dữ liệu lỗi.

### Giai đoạn 3 — Tách module tồn kho và giá
1. Trang quản lý tồn kho riêng.
2. Trang quản lý giá riêng.
3. Import cập nhật tồn kho/giá.

### Giai đoạn 4 — Đơn hàng, báo giá, khách hàng
1. Nâng cấp quản lý đơn hàng.
2. Nâng cấp quản lý báo giá.
3. Nhóm khách hàng/đại lý.

### Giai đoạn 5 — Phân quyền và vận hành ⚠️ ĐANG LÀM DỞ
1. Phân quyền admin. ✅ Hoàn thành (files đã tạo, cần test)
2. Nhật ký thao tác nhân viên. ✅ Hoàn thành (files đã tạo, cần test)
3. Cấu hình hệ thống. ✅ Hoàn thành (files đã tạo, cần test)
4. Tối ưu bảo mật. ⏳ Chờ test server

**Trạng thái chi tiết:**
- Đã tạo đầy đủ files: Controllers, Views, Models, Middleware
- Đã sửa 3 lỗi route mapping trong api.js
- Cần khởi động lại server và test các trang mới
- Xem thêm: `Tien_Trinh_Thuc_Hien.md` - Giai đoạn F

---

## IV. FILE CẦN CẬP NHẬT

### Files đã hoàn thành (Giai đoạn E & F):
- `website/models/ActivityLog.js` — Model nhật ký hoạt động ✅
- `website/middleware/activityLogger.js` — Middleware ghi log tự động ✅
- `website/controllers/api/activityLogController.js` — Controller nhật ký ✅
- `website/controllers/api/roleController.js` — Controller phân quyền ✅
- `website/controllers/api/systemController.js` — Controller hệ thống ✅
- `website/controllers/api/inventoryController.js` — Controller tồn kho ✅
- `website/controllers/api/priceController.js` — Controller giá ✅
- `website/views/admin/activity-logs.ejs` — Giao diện nhật ký ✅
- `website/views/admin/roles.ejs` — Giao diện phân quyền ✅
- `website/views/admin/settings.ejs` — Giao diện cài đặt ✅
- `website/views/admin/inventory.ejs` — Giao diện tồn kho ✅
- `website/views/admin/prices.ejs` — Giao diện giá ✅
- `website/routes/admin.js` — Đã thêm routes mới ✅
- `website/routes/api.js` — Đã thêm API endpoints + sửa lỗi ✅
- `website/views/admin/partials/sidebar.ejs` — Đã thêm menu mới ✅

### Files cần cập nhật tiếp:
- `website/views/admin/products.ejs` — trang danh sách sản phẩm (cần nâng cấp bộ lọc)
- `website/views/admin/dashboard.ejs` — dashboard (cần thêm thống kê đầy đủ)
- `website/Ke_Hoach_Xay_Dung_Admin_UI.md` — kế hoạch chi tiết (file này)
- `website/Tien_Trinh_Thuc_Hien.md` — tiến trình triển khai

---

## V. ƯU TIÊN TIẾP THEO

### Ngay sau khi hoàn thành Giai đoạn F:
1. Khởi động lại server: `cd website; npm run dev`
2. Test các trang: /admin/activity-logs, /admin/roles, /admin/settings
3. Cập nhật trạng thái Giai đoạn F = 100%

### Giai đoạn tiếp theo (chọn 1 trong 3):
1. **Module kiểm tra chất lượng dữ liệu** — Trang riêng lọc sản phẩm lỗi
2. **Dashboard nâng cao** — Thống kê đầy đủ cho hệ thống lớn
3. **Import/Export Excel** — Công cụ quản lý dữ liệu lớn
