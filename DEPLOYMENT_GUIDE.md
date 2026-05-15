# HƯỚNG DẪN TRIỂN KHAI WEBSITE LÊN SERVER WINDOWS

Tài liệu này hướng dẫn các bước để triển khai ứng dụng website Nhất Linh Nhi lên một máy chủ chạy hệ điều hành Windows đã được cài đặt sẵn MongoDB và Docker.

## YÊU CẦU TIÊN QUYẾT
- Server chạy hệ điều hành Windows.
- Đã cài đặt [Node.js (phiên bản LTS)](https://nodejs.org/).
- Đã cài đặt và khởi chạy [MongoDB](https://www.mongodb.com/try/download/community).
- Đã cài đặt và khởi chạy [Docker Desktop](https://www.docker.com/products/docker-desktop/).

---

## PHƯƠNG ÁN 1: CHẠY TRỰC TIẾP TRÊN WINDOWS VỚI PM2 (KHUYẾN NGHỊ)

Phương pháp này đơn giản, dễ quản lý và phù hợp để bắt đầu. `PM2` là một trình quản lý tiến trình mạnh mẽ giúp ứng dụng của bạn luôn hoạt động và tự khởi động lại khi cần.

### Bước 1: Chuẩn bị mã nguồn
1.  **Sao chép mã nguồn:** Copy toàn bộ thư mục dự án (`website`) vào một vị trí trên server (ví dụ: `D:\apps\nln-website`).
2.  **Mở Command Prompt:** Mở `cmd` hoặc `PowerShell` với quyền Administrator và di chuyển vào thư mục dự án:
    ```sh
    cd D:\apps\nln-website
    ```

### Bước 2: Cấu hình biến môi trường
1.  Trong thư mục gốc của dự án, tạo một file mới tên là `.env`.
2.  Thiết lập biến `MONGODB_URI` để kết nối tới MongoDB đang chạy trên cùng server.
    ```env
    # D:\apps\nln-website\.env

    # Kết nối tới MongoDB trên localhost
    MONGODB_URI=mongodb://localhost:27017/nhatlinhnhi

    # Các chuỗi bí mật (tạo mới hoặc sao chép từ môi trường phát triển)
    JWT_SECRET=your_super_secret_jwt_key
    ERP_API_KEYS=your_super_secret_erp_key
    PORT=3000
    ```

### Bước 3: Cài đặt các gói phụ thuộc
Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết từ `package.json`:
```sh
npm install
```

### Bước 4: Khởi tạo dữ liệu ban đầu (Chỉ chạy 1 lần)
Dự án có một script `test-db.js` để tạo dữ liệu mẫu (tài khoản admin, danh mục...). Chạy script này để MongoDB có dữ liệu:
```sh
node test-db.js
```
*Lưu ý: Script này sẽ tạo tài khoản admin `admin@nhatlinhnhi.com`.*

### Bước 5: Cài đặt và chạy ứng dụng với PM2
1.  **Cài đặt PM2 toàn cục:**
    ```sh
    npm install pm2 -g
    ```
2.  **Khởi động ứng dụng:**
    Lệnh này sẽ khởi động `server.js`, đặt tên cho tiến trình là `nln-website`.
    ```sh
    pm2 start server.js --name "nln-website"
    ```
3.  **Thiết lập tự khởi động cùng Windows:**
    PM2 có thể tạo một script để tự chạy khi server khởi động lại.
    ```sh
    pm2 startup
    ```
    PM2 sẽ hiển thị một lệnh, bạn chỉ cần sao chép và chạy lệnh đó.
4.  **Lưu lại danh sách tiến trình:**
    ```sh
    pm2 save
    ```
5.  **Kiểm tra trạng thái:**
    ```sh
    pm2 list          # Xem danh sách các ứng dụng đang chạy
    pm2 logs nln-website # Xem log real-time của ứng dụng
    pm2 restart nln-website # Khởi động lại ứng dụng
    pm2 stop nln-website  # Dừng ứng dụng
    ```
Sau bước này, ứng dụng của bạn đã chạy ổn định trên server tại `http://localhost:3000`.

---

## PHƯƠNG ÁN 2: CHẠY BẰNG DOCKER (LINH HOẠT & HIỆN ĐẠI)

Phương án này đóng gói toàn bộ ứng dụng vào một "container" độc lập, giúp việc quản lý và di chuyển dễ dàng hơn.

### Bước 1: Chuẩn bị mã nguồn
Tương tự phương án 1, sao chép mã nguồn vào `D:\apps\nln-website`.

### Bước 2: Cấu hình biến môi trường
1.  Tạo file `.env` trong thư mục gốc.
2.  **Quan trọng:** Khi ứng dụng chạy trong Docker, nó không thể dùng `localhost` để "thấy" MongoDB trên máy chủ. Hãy dùng `host.docker.internal` để tham chiếu đến máy chủ host.
    ```env
    # D:\apps\nln-website\.env
    MONGODB_URI=mongodb://host.docker.internal:27017/nhatlinhnhi
    JWT_SECRET=your_super_secret_jwt_key
    ERP_API_KEYS=your_super_secret_erp_key
    PORT=3000
    ```

### Bước 3: Tạo `Dockerfile`
Trong thư mục gốc của dự án, tạo một file mới tên là `Dockerfile` (không có phần mở rộng) với nội dung sau:

```dockerfile
# Sử dụng một image Node.js chính thức làm nền
FROM node:18-alpine

# Thiết lập thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các gói phụ thuộc cho môi trường production
RUN npm install --omit=dev

# Sao chép toàn bộ mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

# Port mà ứng dụng sẽ chạy bên trong container
EXPOSE 3000

# Lệnh để khởi chạy ứng dụng khi container bắt đầu
CMD [ "node", "server.js" ]
```

### Bước 4: Build Docker Image
Mở `PowerShell` hoặc `cmd` tại thư mục dự án và chạy lệnh sau:
```sh
docker build -t nhatlinhnhi-app .
```

### Bước 5: Chạy Docker Container
Sau khi build xong, chạy lệnh sau để khởi tạo một container:
```sh
docker run -d -p 3000:3000 --name nln-container --restart always --env-file ./.env nhatlinhnhi-app
```

### Bước 6: Khởi tạo dữ liệu ban đầu (khi dùng Docker)
Thực thi lệnh `test-db.js` *bên trong* container đang chạy:
```sh
docker exec nln-container node test-db.js
```

---

## BƯỚC CUỐI CÙNG: CẤU HÌNH REVERSE PROXY (TÙY CHỌN NHƯNG KHUYẾN NGHỊ)

Để truy cập website qua tên miền (ví dụ: `www.nhatlinhnhi.com`) thay vì `http://localhost:3000`, bạn nên cài đặt một web server như **Nginx** hoặc **IIS** trên Windows để làm **Reverse Proxy**. Web server sẽ lắng nghe ở cổng 80/443 và chuyển tiếp yêu cầu đến ứng dụng Node.js đang chạy ở cổng 3000.