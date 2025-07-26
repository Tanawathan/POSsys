@echo off
echo ======================================
echo  Tanawat 餐廳管理系統 - 筆記本電腦版
echo ======================================
echo.

echo 檢查 Node.js 安裝...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤: Node.js 未安裝
    echo 請先安裝 Node.js 18+ 或 24+
    echo 下載網址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安裝
node --version

echo.
echo 檢查相依套件...
if not exist node_modules (
    echo 📦 安裝相依套件...
    npm install
) else (
    echo ✅ 相依套件已存在
)

echo.
echo 檢查環境變數設定...
if not exist config\.env (
    if exist config\.env.example (
        echo 📝 複製環境變數範例檔案...
        copy config\.env.example config\.env
        echo.
        echo ⚠️  請編輯 config\.env 檔案並設定您的 Notion API 金鑰
        echo    NOTION_API_KEY=您的API金鑰
        echo    NOTION_MENU_DATABASE_ID=菜單資料庫ID
        echo    NOTION_ORDERS_DATABASE_ID=訂單資料庫ID
        echo    NOTION_TABLES_DATABASE_ID=桌況資料庫ID
        echo    NOTION_RESERVATIONS_DATABASE_ID=訂位資料庫ID
        echo    NOTION_STAFF_DATABASE_ID=員工資料庫ID
        echo.
        echo 設定完成後，再次執行此腳本啟動伺服器
        pause
        exit /b 0
    ) else (
        echo ❌ 錯誤: 找不到環境變數範例檔案
        pause
        exit /b 1
    )
) else (
    echo ✅ 環境變數檔案已存在
)

echo.
echo 🚀 啟動 Tanawat 餐廳管理系統伺服器...
echo    伺服器地址: http://localhost:3000
echo    主要管理界面: http://localhost:3000/pages/management/table-management.html
echo    訂單管理中心: http://localhost:3000/order-center.html
echo.
echo 按 Ctrl+C 停止伺服器
echo.

npm run direct
