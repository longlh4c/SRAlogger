---
description: Tự động log timesheet SRA cho 5 ngày làm việc liên tiếp bằng Playwright MCP (đã kiểm chứng trên UI thực tế của sra.smartosc.com)
argument-hint: [soNgayLechSoVoiHomNay]
---

Bạn sẽ dùng các tool Playwright MCP (`mcp__playwright__*`) để tự động hoá việc log timesheet trên `https://sra.smartosc.com/time-sheet`. Logic ngày/tuần lấy tinh thần từ test Cypress gốc `e2e/integration/SRALogger.js`, nhưng **các bước thao tác UI dưới đây đã được cập nhật theo giao diện thực tế hiện tại** (khác đáng kể so với bản Cypress cũ vốn dùng modal `#modal-create-work-log`).

Ngoài cách chạy bằng Playwright MCP này, project còn có một **script Playwright độc lập** làm y hệt logic này: `scripts/sra-logger.js` (chạy bằng `node scripts/sra-logger.js [offsetDays]`, dùng chung persistent Chromium profile nên không cần đăng nhập lại). Nếu người dùng muốn chạy không tương tác/định kỳ, ưu tiên gợi ý dùng script đó thay vì lặp lại toàn bộ thao tác qua MCP.

## Tham số

- `$ARGUMENTS`: số ngày lệch so với hôm nay để bắt đầu log (tương ứng `Cypress.env('noDaysBefore')`), số âm nghĩa là lùi về quá khứ. Nếu không truyền, mặc định dùng "thứ Hai của tuần trước": `new Date()`, `day = getDay()` (0=CN..6=T7), `offset = -(day === 0 ? 13 : day + 6)`.
- Project/Type of Work/Description/Hours mặc định: project = `Smartbox Dedicated team` (search text; option thực tế sẽ là dạng "Smartbox Dedicated Team `<năm>` (SMA_...)"), typeOfWork = `Test execution`, desc = `Manual & Auto test`, hours = `8`.
- URL đích: `https://sra.smartosc.com/time-sheet`.

## Bước 1 — Mở trang và đăng nhập

1. `browser_navigate` tới `https://sra.smartosc.com/time-sheet`.
2. Nếu bị redirect sang `sso.smartosc.com` (trang "Sign in to SmartOSC Corporation"), profile Chromium persistent chưa có session — dừng lại, báo người dùng tự đăng nhập thủ công trong cửa sổ trình duyệt (không tự nhập thông tin đăng nhập), rồi `browser_navigate` lại tới URL trên sau khi họ xác nhận xong.
3. Xác nhận đã vào đúng trang "Timesheet Detail" (URL chứa `time-sheet`, heading "Timesheet Detail" hiển thị).

## Bước 2 — Tính 5 ngày cần log

1. Xác định `offset` theo `$ARGUMENTS` hoặc công thức mặc định ở trên.
2. `startDate = today + offset ngày`.
3. Danh sách 5 ngày liên tiếp bắt đầu từ `startDate`; nếu một ngày rơi vào Thứ Bảy/Chủ Nhật thì nhảy sang ngày làm việc kế tiếp (Thứ Bảy → +2, Chủ Nhật → +1) trước khi xử lý ngày đó, rồi tiếp tục +1 ngày cho vòng sau.
4. Format mỗi ngày thành chuỗi `"Month Day, Year"` (ví dụ `July 6, 2026`) để khớp `aria-label` của flatpickr.

## Bước 3 — Với mỗi ngày trong 5 ngày

1. **Mở modal Log Time**: click nút **"Log Time"** ở đầu trang (không phải "Import File"/"Export").
2. **Chọn ngày**: click vào ô Date (`#startDate`, textbox hiển thị dạng `YYYY-MM-DD`) để mở flatpickr calendar. Nếu tháng của ngày cần chọn khác tháng đang hiển thị, chọn đúng tháng qua dropdown `.flatpickr-monthDropdown-months` (option là tên tháng đầy đủ, ví dụ "July"); nếu khác năm thì sửa luôn ô năm cạnh đó.
3. Trong calendar, tìm ô ngày qua CSS `.flatpickr-day[aria-label="<Month Day, Year>"]`. Dùng `browser_evaluate` kiểm tra class `flatpickr-disabled`:
   - Nếu có → ngày bị disable, click nút **"Cancel"** trong modal, bỏ qua ngày này, chuyển sang ngày tiếp theo.
   - Nếu không → click vào ô ngày.
4. **Đọc thông tin giờ của ngày đó**: sau khi chọn ngày, modal hiển thị 3 số liệu **Attendance (hrs)**, **Allocated (hrs)**, **Work Log (hrs)** (không có class/id cố định — lấy `browser_snapshot` của dialog rồi đọc text các generic ngay sau nhãn tương ứng, hoặc `browser_evaluate` lấy `innerText` cả dialog rồi regex `Allocated \(hrs\)\s*([\d.]+)` / `Work Log \(hrs\)\s*([\d.]+)`).
   - Nếu **Allocated (hrs) = 0** → ngày không có giờ phân bổ (nghỉ lễ hoặc không thuộc lịch làm việc) → click **"Cancel"**, bỏ qua.
   - Nếu **Work Log (hrs) ≠ 0** → ngày đã được log rồi → click **"Cancel"**, bỏ qua.
   - Ngược lại (Work Log = 0 và Allocated ≠ 0) → tiến hành điền form ở bước 5.
5. **Điền và submit** (chỉ khi ngày hợp lệ và chưa log):
   - Click nút thêm dòng (class `.btn.btn-add`, không có text) → một dòng mới xuất hiện trong bảng của modal với các cột: No, Source, Project, Type Of Work, Task Description, Worked (HRS), Action.
   - Cột **Project**: click vào ô search (input `class="vs__search"`), gõ `Smartbox Dedicated team`, đợi dropdown hiện đúng 1 option khớp (dạng "Smartbox Dedicated Team `<năm>` (SMA_...)") rồi click chọn option đó.
   - Cột **Type Of Work**: tương tự, gõ `Test execution`, click chọn option "Test execution".
   - Cột **Task Description**: điền `Manual & Auto test`.
   - Cột **Worked (HRS)**: ô này hiển thị sẵn `"8.00"` nhưng đó **chỉ là placeholder, không phải giá trị thật** — nếu submit ngay sẽ báo lỗi "Field is required". Phải click vào ô rồi gõ lại `8` để giá trị thật sự được ghi nhận.
   - Click nút submit **"Log Time"** ở cuối modal (không phải nút "Log Time" ngoài trang — nút này nằm trong dialog, cạnh nút "Cancel").
   - Đợi modal đóng (hoặc toast "Successfully Saved" xuất hiện) trước khi xử lý ngày tiếp theo.

## Kết quả cuối cùng

Sau 5 ngày, tóm tắt cho người dùng: ngày nào log thành công (kèm số giờ), ngày nào bị bỏ qua và lý do (disabled trên lịch / không có allocated hours / đã log sẵn). Có thể xác nhận lại bằng cách chuyển view sang đúng tuần chứa các ngày đó (nút mũi tên lùi/tiến cạnh khoảng ngày ở đầu trang) và kiểm tra cột **W** (Work Log hrs) trong bảng tuần.

## Lưu ý khi thực thi bằng Playwright MCP

- Ưu tiên `browser_snapshot`/`browser_find` trước mỗi thao tác để lấy đúng `ref`; các CSS selector ở trên dùng để đối chiếu, xác định đúng phần tử khi không chắc từ snapshot.
- Vue-select sinh id động (`vs1__combobox`, `vs3__combobox`, ...) tăng dần theo số dòng đã thêm trong cả phiên trang — không hardcode các id này, luôn thao tác dựa trên dòng vừa thêm (dòng cuối cùng trong bảng của modal đang mở).
- Không tự động điền thông tin đăng nhập; nếu cần đăng nhập, dừng lại và chờ người dùng thao tác thủ công trên trình duyệt đang mở.
