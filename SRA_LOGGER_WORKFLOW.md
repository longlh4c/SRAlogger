# 🚀 Hướng Dẫn Vận Hành & Tối Ưu Hóa SRA Timesheet Logger

Tài liệu này hệ thống hóa toàn bộ quy trình chạy công cụ tự động hóa SRA Logger và các cải tiến tối ưu hóa mã nguồn mới nhất giúp bạn tiết kiệm thời gian tối đa cho các lần chạy tiếp theo.

---

## 🛠️ 1. Các Cải Tiến Tối Ưu Hóa Mới Nhất (Mới Cập Nhật)

Trước đây, bạn phải mở file `SRALogger.js` mỗi tuần để sửa đổi giá trị offset (ví dụ `-8` hoặc `-7`) một cách thủ công. Hiện tại mã nguồn đã được tối ưu hóa hoàn toàn tự động:

### 📅 Tự Động Tính Toán Ngày Thứ Hai Tuần Trước
Chúng tôi đã bổ sung hàm tiện ích `getLastWeekMondayOffset()` trong `support/utils/date.js`:
* Tự động xác định thứ trong tuần hiện tại.
* Tính toán chính xác số ngày cần lùi lại để chọn **Thứ Hai của tuần trước** làm ngày bắt đầu log.
* **Không cần chỉnh sửa code thủ công hàng tuần nữa!**

### ⚙️ Cho Phép Ghi Đè Linh Hoạt Qua Biến Môi Trường (Environment Variable)
Mã nguồn mới hỗ trợ biến `noDaysBefore` từ môi trường Cypress. Nếu bạn muốn log cho khoảng thời gian đặc biệt, bạn có thể truyền thẳng tham số khi chạy lệnh mà không cần chạm vào code:
```bash
# Ví dụ: Log bắt đầu từ 15 ngày trước thay vì tuần trước
npx cypress run --env noDaysBefore=-15 --headed --no-exit ...
```

---

## 📋 2. Quy Trình Vận Hành Nhanh (2 Cách Chạy)

Tùy vào nhu cầu cá nhân, bạn có thể lựa chọn 1 trong 2 phương án chạy cực nhanh dưới đây:

### 🔹 Cách 1: Chạy trực tiếp qua Trình duyệt Thực tế (Khuyên Dùng - Nhanh & Bảo Mật)
Cách này bỏ qua giao diện chọn của Cypress (Cypress Launchpad), giúp mở thẳng bài test trên trình duyệt Chrome/Electron của bạn để bạn tự đăng nhập.

> [!TIP]
> **Hướng dẫn chạy:**
> 1. Mở Terminal tại thư mục dự án và chạy duy nhất lệnh sau:
>    ```bash
>    npx cypress run --headed --no-exit --config-file cypress-desktop.config.js --spec e2e/integration/SRALogger.js
>    ```
> 2. Trình duyệt tự động sẽ bật lên và truy cập thẳng trang SRA.
> 3. Bạn thực hiện click **Sign in with Google** và đăng nhập bình thường.
> 4. Sau khi đăng nhập xong, nhấn nút **Resume** ở thanh công cụ Cypress bên trái màn hình. Script sẽ tự động log đủ 5 ngày làm việc của tuần trước!

---

### 🔹 Cách 2: Chạy Tự Động Hoàn Toàn với Trình Duyệt Ngầm (Playwright Subagent / Playwright MCP)
Nếu bạn muốn giao toàn bộ công việc cho AI xử lý từ đầu đến cuối mà không cần tự tay tương tác với trình duyệt Chrome trên máy:

> [!IMPORTANT]
> **Hướng dẫn chạy:**
> 1. Gửi yêu cầu cho trợ lý AI:
>    *"Hãy dùng Playwright MCP để chạy SRA Timesheet Logger với tài khoản: [Email của bạn] / Mật khẩu: [Mật khẩu của bạn]"*
> 2. AI sẽ tự khởi chạy Subagent, tự động điền tài khoản để đăng nhập Google.
> 3. **Lưu ý:** Nếu Google yêu cầu xác thực 2 lớp (2FA/OTP), AI sẽ hỏi bạn mã OTP ngay trong khung chat này. Bạn chỉ cần gửi mã, AI sẽ tự điền tiếp và hoàn thành quy trình!

---

## 🔒 3. Cơ Chế Chống Log Trùng Lặp (Double-logging)
Hệ thống tự động tích hợp sẵn bộ kiểm tra thông minh trước khi log:
1. **Kiểm tra Ngày nghỉ:** Tự động phát hiện ngày lễ/ngày nghỉ công ty (`day-holiday`) để bỏ qua.
2. **Kiểm tra Giờ đã log:** Đọc tổng số giờ đã ghi nhận của ngày đó (`totalTime`). 
   * Nếu đã log **> 0 giờ** (ví dụ đã có 8.0 giờ): Tự động click **Cancel** để bỏ qua ngày đó, bảo vệ dữ liệu cũ.
   * Nếu bằng **0 giờ**: Tự động thêm dòng log công việc mới (`Smartbox Dedicated team` / `Test execution` / `Manual & Auto test` / `8 hours`).
