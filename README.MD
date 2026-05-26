Cái nay để chạy manual:
npx cypress open --config-file cypress-desktop.config.js  
 npx cypress run --env noDaysBefore=-14 --headed --no-exit ...  
   
Sử dụng Agent thì chạy cái này:  
Hãy dùng Playwright MCP để chạy SRA Timesheet Logger với tài khoản: [Email của bạn] / Mật khẩu: [Mật khẩu của bạn]"  

Lưu ý cài Playwright MCP và thêm vào mcp_config.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser",
        "chromium",
        "--viewport-size",
        "1920,1080"
      ]
    },
  }
}
