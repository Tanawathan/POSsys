# CSV 到 Notion 同步工具 - PowerShell 版本

Write-Host "🍽️  Tanawat Restaurant CSV 同步工具" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# 檢查檔案是否存在
$csvFile = "data\最終菜色.csv"
$envFile = ".env"

if (-not (Test-Path $csvFile)) {
    Write-Host "❌ 錯誤：找不到 CSV 檔案: $csvFile" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path $envFile)) {
    Write-Host "❌ 錯誤：找不到環境設定檔: $envFile" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✅ 檔案檢查通過" -ForegroundColor Green
Write-Host ""

# 嘗試找到 Node.js
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe"
)

$nodeExe = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeExe = $path
        break
    }
}

# 如果找不到，嘗試使用 PATH 中的 node
if (-not $nodeExe) {
    try {
        $nodeExe = (Get-Command node -ErrorAction Stop).Source
    } catch {
        Write-Host "❌ 錯誤：找不到 Node.js 執行檔" -ForegroundColor Red
        Write-Host "請確認已安裝 Node.js 並加入系統 PATH" -ForegroundColor Yellow
        pause
        exit 1
    }
}

Write-Host "🔧 找到 Node.js: $nodeExe" -ForegroundColor Green

# 啟動代理伺服器
Write-Host "🚀 啟動代理伺服器..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath $nodeExe -ArgumentList "proxy-server.js" -WindowStyle Normal -PassThru

# 等待伺服器啟動
Write-Host "⏳ 等待伺服器啟動..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 檢查伺服器是否正在運行
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ 伺服器已成功啟動" -ForegroundColor Green
} catch {
    Write-Host "⚠️  無法確認伺服器狀態，但繼續開啟網頁..." -ForegroundColor Yellow
}

# 開啟同步工具網頁
Write-Host "🌐 開啟 CSV 同步工具..." -ForegroundColor Green
Start-Process "http://localhost:3000/pages/tools/csv-notion-sync.html"

Write-Host ""
Write-Host "✅ 系統已啟動！" -ForegroundColor Green
Write-Host "📋 CSV 同步工具: http://localhost:3000/pages/tools/csv-notion-sync.html" -ForegroundColor Cyan
Write-Host "🏠 主頁面: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 使用說明:" -ForegroundColor Yellow
Write-Host "1. 在開啟的網頁中點擊 '預覽 CSV 資料'" -ForegroundColor White
Write-Host "2. 確認資料正確後點擊 '開始同步到 Notion'" -ForegroundColor White
Write-Host "3. 等待同步完成" -ForegroundColor White
Write-Host ""
Write-Host "按任意鍵結束..." -ForegroundColor Gray
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 嘗試停止伺服器
if ($serverProcess -and -not $serverProcess.HasExited) {
    Write-Host "🛑 正在停止伺服器..." -ForegroundColor Yellow
    $serverProcess.Kill()
}
