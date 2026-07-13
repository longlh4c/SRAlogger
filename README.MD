npx cypress open --config-file cypress-desktop.config.js  
npx cypress run --env noDaysBefore=-14 --headed --no-exit

# SRA Logger (Playwright)

Script `scripts/sra-logger.js` tự động log timesheet SRA cho 5 ngày làm việc liên tiếp, dùng chung persistent Chromium profile với MCP server `playwright` (`.mcp.json`) nên tái sử dụng session đăng nhập có sẵn, không cần login lại.

Chạy bằng `node` trực tiếp (không dùng `npx`/`npm run` — project pin devDependency `"node": "^19.8.1"` khiến npx/npm run bị shim Node cũ che mất Node hệ thống, làm Playwright lỗi):

```bash
node scripts/sra-logger.js          # mặc định: bắt đầu từ Thứ Hai tuần trước
node scripts/sra-logger.js -14      # tương đương noDaysBefore=-14
```

Lưu ý: không chạy script này cùng lúc với MCP server `playwright` đang mở — cả hai dùng chung `user-data-dir`, Chromium sẽ khoá profile và launch thứ hai sẽ lỗi.
