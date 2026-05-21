# 🐞 GHI NHẬN KIỂM THỬ, BÁO LỖI VÀ YÊU CẦU NÂNG CẤP

**Dự án:** Website E-commerce Nhất Linh Nhi
**Ngày tạo:** 18/05/2026
**Cập nhật lần cuối:** 18/05/2026

*Sử dụng file này để ghi nhận các lỗi (bugs) phát hiện trong quá trình test và các ý tưởng/yêu cầu nâng cấp tính năng cho cả Web Khách hàng (Client) và Web Quản trị (Admin).*

---

## 🔴 1. DANH SÁCH LỖI CẦN FIX (BUG TRACKING)

### 1.1. Web Người Dùng (Client / Frontend)
- [x] **C-BUG-01** `[Vừa]` `[Header / Search]` - Hiệu ứng chữ chạy (Typewriter) trong box search chưa mượt mà. *(Đã fix: Tối ưu JS, xóa code thừa ở footer.ejs và scripts.ejs)*
- [x] **C-BUG-02** `[Cao]` `[Header / Topbar]` - Hotline và Email hiển thị trên topbar chưa lấy dữ liệu động từ Admin (Cài đặt hệ thống), hiện đang bị hardcode. *(Đã fix: Lấy dữ liệu từ `setting` object)*
- [x] **C-BUG-03** `[Vừa]` `[Trang chủ / Danh mục]` - Danh Mục Nổi Bật hiển thị thừa, cần giới hạn tối đa 10 danh mục. *(Đã fix: Thêm `.slice(0, 10)` trong controller)*
- [x] **C-BUG-04** `[Cao]` `[Trang chủ / Flash Sale]` - Đồng hồ đếm ngược (Countdown) phần "Giá Sốc Hôm Nay" chưa chạy. *(Đã fix: Đồng bộ HTML và JS, xóa script thừa trong home.ejs)*
- [x] **C-BUG-05** `[Vừa]` `[Trang chủ / Flash Sale]` - Sản phẩm trong component "Giá Sốc Hôm Nay" cần thiết kế giống các component khác để đồng bộ giao diện. *(Ghi chú: Cần đồng bộ lại các CSS class của Card Sản phẩm)*
- [ ] **C-BUG-06** `[Vừa]` `[UI / Back to Top]` - Nền nút về đầu trang cần đổi màu theo vị trí (chuyển màu khác khi cuộn tới footer để không bị chìm/trùng màu). *(Ghi chú: Xử lý bằng sự kiện scroll trong JavaScript)*
- [x] **C-BUG-07** `[Cao]` `[Header / Footer / Floating]` - Số điện thoại trong các link gọi điện (`tel:`) đang bị hardcode, cần lấy dữ liệu động từ cấu hình Admin. *(Đã fix: Đồng bộ dữ liệu từ `setting.contact.phone` cho cả footer và nút gọi điện floating)*
- [ ] **C-BUG-08** `[Cao]` `[Trang chủ / Brands]` - Kiểm tra lại component Thương Hiệu Đối Tác, cần đảm bảo đã đồng bộ dữ liệu với database thay vì hardcode. *(Ghi chú: Cần bind data từ API Brands)*

### 1.2. Web Quản Trị (Admin Panel)
- [ ] **A-BUG-01** `[Cao]` `[/admin/...]` - (Ghi lỗi web admin vào đây...)
- [ ] **A-BUG-02** `[Cao]` `[/admin/settings]` - Các trang quản trị mới (Settings, Roles, Logs) bị trắng, không hiển thị nội dung. *(Ghi chú: Server báo lỗi `Could not find the include file "admin/partials/head"`. Cần kiểm tra lại cấu hình Express và đường dẫn EJS include.)*

---

## 🔵 2. YÊU CẦU NÂNG CẤP TÍNH NĂNG (ENHANCEMENTS)

### 2.1. Web Người Dùng (Client / Frontend)
- [ ] **C-ENH-01** `[Vừa]` `[/]` - (Ghi ý tưởng nâng cấp web người dùng...)
- [ ] **C-ENH-02** `[Cao]` `[Trang chủ / UI Config]` - Các component trên trang chủ cần cấu hình để có thể bật/tắt riêng lẻ từ web quản trị. *(Ghi chú: Đã có schema Settings, cần code chức năng Dynamic UI)*
- [ ] **C-ENH-03** `[Vừa]` `[Footer]` - Nội dung trong footer trang chủ cần thay đổi được động từ web quản trị (Settings). *(Ghi chú: Đưa nội dung footer vào Setting Schema)*
- [ ] **C-ENH-04** `[Cao]` `[Trang Giới thiệu]` - Xây dựng trang giới thiệu đẹp mắt, nội dung hoàn toàn có thể chỉnh sửa động từ Web Quản trị. *(Ghi chú: Có thể dùng model Page hoặc cấu hình riêng)*
- [ ] **C-ENH-05** `[Cao]` `[Danh sách sản phẩm]` - Bổ sung bộ lọc nâng cao (giá, thương hiệu, thuộc tính...) mang phong cách trang bán hàng chuyên nghiệp. *(Ghi chú: Cần kết hợp API lọc sản phẩm)*
- [ ] **C-ENH-06** `[Vừa]` `[Chi tiết sản phẩm]` - Tư vấn và xây dựng logic hiển thị "Sản phẩm liên quan" thông minh hơn (cùng danh mục, mức giá, thương hiệu...). *(Ghi chú: Sửa logic query trong clientController)*
- [ ] **C-ENH-07** `[Cao]` `[Trang chủ / SP Mới]` - Xây dựng component "Sản Phẩm Mới Nhất", cho phép tùy chỉnh số lượng hiển thị (limit) thông qua Web Quản trị. *(Ghi chú: Kết hợp Settings model & UI component)*
- [ ] **C-ENH-08** `[Cao]` `[Header / Search]` - Xây dựng trang kết quả tìm kiếm và tích hợp chức năng Live Search (gợi ý nhanh) khi gõ từ khóa vào ô tìm kiếm. *(Ghi chú: Viết API tìm kiếm & xử lý JS ở Frontend)*

### 2.2. Web Quản Trị (Admin Panel)
- [ ] **A-ENH-01** `[Vừa]` `[/admin/...]` - (Ghi ý tưởng nâng cấp web admin...)
- [ ] **A-ENH-02** `[Vừa]` `[Backend Refactor]` - Tối ưu việc lặp lại `Setting.findOne()` trong các controllers bằng cách tạo một middleware chung để tự động nạp dữ liệu `setting` cho mọi trang. *(Ghi chú: Giúp code gọn hơn, dễ bảo trì, giảm query lặp lại)*

---

## ✅ 3. LỊCH SỬ ĐÃ XỬ LÝ (RESOLVED ISSUES)

*Đánh dấu `[x]` vào các task ở trên khi hoàn thành. Nếu muốn danh sách gọn hơn, có thể cut/paste các task đã hoàn thành xuống phần dưới đây để lưu trữ.*

---

## 📝 HƯỚNG DẪN SỬ DỤNG FILE:
- **Mức độ / Độ ưu tiên:** `[Cao]`, `[Vừa]`, `[Thấp]`.
- Để thêm lỗi/yêu cầu mới, hãy copy format sau: `- [ ] **Mã_ID** [Mức độ] [Vị trí/URL] - Mô tả chi tiết lỗi. *(Ghi chú sửa chữa)*`
- Khi hoàn thành một vấn đề, hãy sửa `- [ ]` thành `- [x]`.