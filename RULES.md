# QUY TẮC LẬP TRÌNH & PHÁT TRIỂN (CODING RULES)

**Lưu ý:** AI Assistant và các lập trình viên khi tham gia mã nguồn vào dự án website Nhất Linh Nhi phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

## 1. Quy tắc Thẻ Hình Ảnh (SEO Standard)
- Mọi đoạn code liên quan đến thẻ `<img>` **bắt buộc** phải luôn đi kèm thuộc tính `alt` (ví dụ: `alt="Mô tả hình ảnh"`) nhằm đảm bảo tuân thủ tiêu chuẩn SEO một cách tuyệt đối.
- Không được phép sinh ra các thẻ `<img>` thiếu `alt`.

## 2. Quy tắc Bảo Toàn Mã Nguồn (No Regression)
- Không thay đổi những tính năng đang chạy ổn.
- Khi phát triển hoặc thêm một chức năng/giao diện mới, **tuyệt đối không** được phép thay đổi, viết đè hoặc làm hỏng những nội dung/chức năng trước đó đã được xác nhận là hoạt động tốt (OK).
- Chỉ được phép chỉnh sửa, refactor hoặc gỡ bỏ code cũ khi có **yêu cầu và sự cho phép rõ ràng** từ người quản lý dự án.

## 3. Quy tắc Thiết kế Đáp ứng (Responsive Design)
- Khi thiết kế và lập trình giao diện, **bắt buộc** phải đảm bảo hiển thị tốt, không bị vỡ layout và hoạt động mượt mà trên tất cả các nền tảng thiết bị (Desktop, Tablet, Mobile).
- Khuyến khích sử dụng các class tiện ích responsive của Tailwind CSS (ví dụ: `sm:`, `md:`, `lg:`, `xl:`) để xử lý bố cục một cách linh hoạt.

## 4. Quy tắc Theo dõi Tiến độ (Tracking Rules)
- Mọi tiến trình thực hiện, thay đổi trạng thái hoàn thành công việc **chỉ được phép ghi nhận vào duy nhất file** `Tien_Trinh_Thuc_Hien.md`.
- **Tuyệt đối không** cập nhật hay ghi nhận thêm trạng thái thay đổi vào các file kế hoạch cũ (như `Ke_Hoach_Xay_Dung_UI.md`, `Ke_Hoach_Xay_Dung_Admin_UI.md` hay các file phân tích khác).

## 5. Quy tắc Tham khảo Giao diện (Mockup UI Rules)
- Trang `index.html` chỉ để tham khảo giao diện, tuyệt đối không viết code hay sửa đổi trực tiếp trên trang này.
- Trang `admin.html` chỉ để tham khảo giao diện, tuyệt đối không viết code hay sửa đổi trực tiếp trên trang này.

## 6. Quy tắc Hiệu ứng Giao diện (UI/UX Transitions)
- Khi thiết kế và lập trình giao diện cho cả Khách hàng (Client UI) và Quản trị (Admin UI), **ưu tiên** sử dụng các hiệu ứng chuyển động mượt mà (như smooth sliding, fade-in, transition css).
- Tránh các thao tác ẩn/hiện (show/hide) hoặc chuyển đổi giật cục. Các thành phần như Modal, Dropdown, Sidebar, Toast Notification, danh mục xổ xuống hay thao tác cuộn trang đều cần được gắn hiệu ứng mượt mà để mang lại trải nghiệm người dùng (UX) tốt nhất.