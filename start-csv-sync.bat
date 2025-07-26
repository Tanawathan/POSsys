@echo off
echo ===================================
echo   Tanawat Restaurant CSV 同步工具
echo ===================================
echo.

cd /d "%~dp0"

echo 正在檢查必要檔案...
if not exist "data\最終菜色.csv" (
    echo ❌ 找不到最終菜色.csv 檔案
    pause
    exit /b 1
)

if not exist ".env" (
    echo ❌ 找不到.env 環境設定檔
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 📦 安裝 Node.js 依賴套件...
    npm install
    if errorlevel 1 (
        echo ❌ 套件安裝失敗
        pause
        exit /b 1
    )
)

echo ✅ 環境檢查完成
echo.
echo 🚀 啟動代理伺服器...
echo 📊 同步工具將在瀏覽器中開啟
echo.

start "Tanawat Proxy Server" node proxy-server.js

timeout /t 3 /nobreak >nul

echo 🌐 開啟 CSV 同步工具...
start http://localhost:3000/pages/tools/csv-notion-sync.html

echo.
echo ✅ 系統已啟動！
echo 📋 CSV 同步工具: http://localhost:3000/pages/tools/csv-notion-sync.html
echo 🏠 主頁面: http://localhost:3000
echo.
echo 按任意鍵結束...
pause >nul
