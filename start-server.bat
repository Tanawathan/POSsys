@echo off
echo ========================================
echo   Tanawat Restaurant Management System
echo ========================================
echo.
echo 正在檢查環境設定...
cd /d "%~dp0"

if not exist ".env" (
    echo ❌ 找不到 .env 檔案！
    echo 📝 請確保 .env 檔案存在於專案根目錄
    pause
    exit /b 1
)

echo ✅ 找到 .env 檔案
echo.
echo 🚀 啟動伺服器...
"C:\Program Files\nodejs\node.exe" server.js
pause
