# 啟動伺服器腳本
Write-Host "正在啟動桌況管理系統伺服器..." -ForegroundColor Green

# 檢查 Node.js 是否可用
$nodePath = "C:\Program Files\nodejs\node.exe"
if (Test-Path $nodePath) {
    Write-Host "找到 Node.js: $nodePath" -ForegroundColor Green
    
    # 啟動伺服器
    Write-Host "啟動伺服器於 port 3000..." -ForegroundColor Yellow
    & $nodePath "proxy-server.js"
} else {
    Write-Host "錯誤: 找不到 Node.js，請先安裝 Node.js" -ForegroundColor Red
    Write-Host "下載地址: https://nodejs.org/" -ForegroundColor Yellow
    pause
}
