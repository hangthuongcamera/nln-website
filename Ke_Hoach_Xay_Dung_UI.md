# PHÂN TÍCH VÀ KẾ HOẠCH XÂY DỰNG GIAO DIỆN (FRONTEND)
**Dự án:** Website E-commerce Nhất Linh Nhi (Thiết bị Điện, Nước, Kim Khí)
**Tech Stack:** Tailwind CSS, Node.js, MongoDB

---

## I. YÊU CẦU KỸ THUẬT CHUNG (FRONTEND)
- **Chuẩn SEO:** Mọi cấu trúc HTML, thẻ Heading (H1-H6), Meta tags, Alt images phải được code tuân thủ nghiêm ngặt các tiêu chuẩn SEO ngay từ đầu.
- **Hình ảnh & Tương tác:** Bổ sung hình ảnh minh họa đầy đủ, rõ nét. Các nút nhấn (buttons), liên kết phải có hiệu ứng hover, click sinh động, mang lại trải nghiệm người dùng (UX) tốt.
- **Kiểm soát hiển thị (Feature Flag):** Các khu vực hiển thị, đặc biệt là **Card danh mục sản phẩm**, phải được thiết kế để có thể bật/tắt (toggle) động. Trạng thái bật/tắt này sẽ được điều khiển từ dữ liệu MongoDB thông qua thao tác trên giao diện Web Admin sau khi hoàn thiện backend.

## II. CẬP NHẬT GIAO DIỆN TRANG CHỦ (INDEX)
- [x] **Banner Chính:** Nâng cấp khu vực Banner hiện tại thành một Slider (Carousel) gồm 3 slide ảnh. Cần thiết kế nút điều hướng trái/phải rõ ràng và hỗ trợ vuốt trên thiết bị di động.
- [x] **Danh mục nổi bật:** Tăng số lượng card hiển thị lên 10 danh mục. Cấu hình layout hiển thị **5 card trên một dòng** (Grid 5 cột trên màn hình lớn).
- [x] **Tin tức & Kinh nghiệm:** Thêm một Section mới có tiêu đề "Tin tức & Kinh nghiệm" nằm ngay bên dưới section "SẢN PHẨM BÁN CHẠY". Section này sẽ hiển thị các bài viết chia sẻ kiến thức dạng card (ảnh thumbnail, tiêu đề, tóm tắt).
- [x] **Header & Tiện ích (Bổ sung):** Thêm Favicon, thay thế Logo chữ bằng hình ảnh, xây dựng Mega Menu 3 cấp.
- [x] **Tìm kiếm (Bổ sung):** Tích hợp Live Search (Rich Autocomplete) và hiệu ứng gõ chữ (Typewriter effect) cho ô tìm kiếm.
- [x] **Flash Sale (Bổ sung):** Nâng cấp section "Giá Sốc Hôm Nay" thành Slider ngang trượt mượt mà.

## III. PHÂN TÍCH NHỮNG TRANG/MODULE CÒN THIẾU

### 1. Luồng mua hàng cốt lõi (Shopping Flow)
- [x] **Trang Danh sách sản phẩm (Product List / Category Page):**
  - Hiển thị sản phẩm theo từng chuyên mục.
  - **Bộ lọc (Filter) nâng cao:** Rất quan trọng cho 15.000 SKUs (Lọc theo giá, thương hiệu, đặc tính kỹ thuật).
  - Sắp xếp (Sort) và Phân trang (Pagination) hoặc Tải thêm (Load more).
- [x] **Trang Chi tiết sản phẩm (Product Detail Page - PDP):**
  - Hình ảnh chi tiết (Gallery, Zoom).
  - Bảng thông số kỹ thuật chi tiết.
  - Quản lý số lượng, tồn kho.
  - Form yêu cầu báo giá sỉ cho khách mua số lượng lớn.
  - Sản phẩm liên quan.

### 2. Luồng thanh toán (Checkout Flow)
- [x] **Trang Giỏ hàng (Cart):** Quản lý sản phẩm đã chọn, mã giảm giá.
- [x] **Trang Thanh toán (Checkout):** Form thông tin giao hàng, phương thức thanh toán, tính phí vận chuyển.

### 3. Người dùng & Xác thực (User & Auth)
- [x] **Đăng nhập & Đăng ký (Login / Register):** Đã thiết kế giao diện dạng Popup (Modal) mượt mà, tối ưu trải nghiệm (không chuyển trang). 
  *-> Tiền đề cho DB: Tạo collection `Users` (Họ Tên, Số điện thoại/Email, Mật khẩu).*
- [x] **Trang Liên hệ:** Bản đồ, thông tin công ty,

## IV. KẾ HOẠCH XÂY DỰNG GIAO DIỆN (ROADMAP)
- Tách file HTML thành các Component/Partial có thể tái sử dụng.
- **Thực hiện các cập nhật Trang Chủ:** Cấu trúc lại Banner thành 3-slide Carousel, làm lại layout 10 Card Danh mục, thêm Section Tin tức, Nâng cấp Mega Menu, Live Search Autocomplete, Typewriter Search, thay Logo ảnh và thêm Favicon. Code đảm bảo chuẩn SEO.

### Giai đoạn 2: Hoàn thiện luồng Sản phẩm, Người dùng & Nội dung
- Xây dựng giao diện Trang danh sách, Trang chi tiết sản phẩm và Form Đăng nhập/Đăng ký (Popup).
- Xây dựng giao diện cho phần Blog/Tin tức.

### Giai đoạn 3: Hoàn thiện luồng Giỏ hàng, Thanh toán & Người dùng
- Xây dựng giao diện Giỏ hàng, Thanh toán.
- Xây dựng UI Đăng nhập/Đăng ký và Trang quản lý cá nhân.

### Giai đoạn 4: Tích hợp Node.js & Động hóa dữ liệu
- Kết nối MongoDB, chuyển đổi HTML tĩnh thành View (EJS) được render bởi server.
- Triển khai cơ chế bật/tắt (toggle) các Component (như Card danh mục) dựa trên config từ Database.