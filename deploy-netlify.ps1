# Netlify 部署腳本
# 使用此腳本準備部署檔案

Write-Host "正在準備 Netlify 部署..." -ForegroundColor Green

# 確保必要的文件在根目錄
if (!(Test-Path "index.html")) {
    Write-Host "複製主要入口頁面..." -ForegroundColor Yellow
    Copy-Item "public/index.html" "index.html"
}

# 複製 Netlify 配置到根目錄
if (Test-Path "config/netlify.toml") {
    Write-Host "複製 netlify.toml..." -ForegroundColor Yellow
    Copy-Item "config/netlify.toml" "netlify.toml"
}

if (Test-Path "config/_redirects") {
    Write-Host "複製 _redirects..." -ForegroundColor Yellow
    Copy-Item "config/_redirects" "_redirects"
}

Write-Host "✅ 部署檔案準備完成！" -ForegroundColor Green
Write-Host "現在可以：" -ForegroundColor Cyan
Write-Host "1. 手動拖放整個資料夾到 Netlify 部署頁面" -ForegroundColor White
Write-Host "2. 或使用 Git 部署連接到 GitHub 儲存庫" -ForegroundColor White
Write-Host "3. 部署後的網址格式：https://your-site-name.netlify.app" -ForegroundColor White

# 顯示重要的部署資訊
Write-Host "`n📝 部署設定摘要：" -ForegroundColor Magenta
Write-Host "- Build command: (無需設定)" -ForegroundColor Gray
Write-Host "- Publish directory: ." -ForegroundColor Gray
Write-Host "- Node.js version: 18" -ForegroundColor Gray
Write-Host "- PWA support: Yes" -ForegroundColor Gray
Write-Host "- API proxy: Yes (Make.com)" -ForegroundColor Gray

pause
