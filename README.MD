# SRA Logger (Playwright)

Script `scripts/sra-logger.js` tự động log timesheet SRA cho 5 ngày làm việc liên tiếp, dùng chung persistent Chromium profile với MCP server `playwright` (`.mcp.json`) nên tái sử dụng session đăng nhập có sẵn, không cần login lại.

Chạy bằng `node` trực tiếp:

```bash
node scripts/sra-logger.js          # mặc định: bắt đầu từ Thứ Hai tuần trước
node scripts/sra-logger.js --this-week  # tuần này: từ Thứ Hai đầu tuần đến hôm nay
node scripts/sra-logger.js --smartbox 6h --jaspal 2h             # log 2 dự án/ngày: Smartbox 6h + Jaspal 2h
node scripts/sra-logger.js --this-week --smartbox 6h --jaspal 2h # kết hợp: tuần này, 2 dự án
node scripts/sra-logger.js -14      # tương đương noDaysBefore=-14
```

Tham số:

- *(không có)*: log 5 ngày làm việc, bắt đầu từ Thứ Hai tuần trước.
- `--this-week`: log từ Thứ Hai tuần này đến hôm nay (chỉ tính ngày làm việc; chạy vào Thứ Bảy/Chủ Nhật thì log đủ Thứ Hai–Thứ Sáu).
- `<số>`: offset ngày so với hôm nay để bắt đầu log (số âm = quá khứ), log 5 ngày làm việc.
- `--smartbox <giờ>` / `--jaspal <giờ>`: mỗi tham số thêm 1 dòng log cho dự án tương ứng với số giờ truyền vào (`6h`, `6` hoặc `2.5h`), tất cả submit trong cùng một lần mỗi ngày. Không truyền tham số dự án nào thì mặc định log 1 dòng Smartbox 8h. Dùng chung được với `--this-week` hoặc `<số>`. Danh sách dự án cấu hình ở `projects` trong `scripts/config.js`.

Ngày đã log, ngày lễ hoặc ngày bị disable trên lịch sẽ tự động được bỏ qua.

Lưu ý: không chạy script này cùng lúc với MCP server `playwright` đang mở — cả hai dùng chung `user-data-dir`, Chromium sẽ khoá profile và launch thứ hai sẽ lỗi.
