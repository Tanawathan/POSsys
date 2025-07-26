# 🚀 Netlify 部署指南

## 📋 專案概覽
Tanawat Restaurant POS 系統 - 完整的餐廳管理系統，已完全配置好可部署至 Netlify。

## ✅ 已準備好的配置

### 1. 核心文件
- ✅ `index.html` - 主要入口頁面
- ✅ `netlify.toml` - Netlify 配置文件
- ✅ `_redirects` - 路由重定向規則
- ✅ `config/manifest.json` - PWA 配置

### 2. 系統功能
- ✅ 響應式設計 (桌面/平板/手機)
- ✅ PWA 支援 (可安裝為應用程式)
- ✅ API 代理設定 (Make.com 整合)
- ✅ 靜態檔案快取優化
- ✅ HTTPS 強制重定向

## 🌐 部署方法

### 方法一：GitHub 自動部署 (推薦)

1. **連接儲存庫**
   - 登入 [Netlify](https://www.netlify.com/)
   - 在主頁面尋找 **"New site from Git"** 按鈕：
     
     **🔍 按鈕位置：**
     - **首次使用者**：頁面中央的大藍色按鈕
     - **現有使用者**：右上角 "Add new site" → "Import an existing project"
     - **Sites 頁面**：右上角的 "New site from Git" 按鈕
   
   - 選擇 "GitHub" 並授權
   - 選擇 `POSsys` 儲存庫

2. **部署設定**
   
   **在 Build settings 頁面中設定：**
   
   | 欄位 | 設定值 | 說明 |
   |------|--------|------|
   | **Branch to deploy** | `main` | 保持預設值 |
   | **Base directory** | (留空) | 不填寫任何內容 |
   | **Build command** | (留空) | 靜態網站無需建置 |
   | **Publish directory** | `.` | 輸入一個點 |
   | **Functions directory** | `netlify/functions` | 保持預設值 |
   
   **⚠️ 重要提醒：**
   - Base directory 和 Build command 必須完全留空
   - Publish directory 只填寫一個點 `.` 
   - 不要加任何額外的斜線或路徑

3. **環境變數** (必要！)
   
   **⚠️ 重要：您的專案使用 Notion API，必須設定以下環境變數：**
   
   點擊 **"Add environment variables"** 按鈕，然後添加：
   
   ### 🔑 核心必要變數 (一定要設定)
   | 變數名稱 | 值 | 說明 |
   |----------|----|----- |
   | `NOTION_API_KEY` | `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` | Notion Integration Token |
   | `NODE_VERSION` | `18` | Node.js 版本 |
   
   ### 📊 資料庫 ID 變數 (推薦設定)
   | 變數名稱 | 值 | 說明 |
   |----------|----|----- |
   | `MENU_DB_ID` | `23afd5adc30b80c58355fd93d05c66d6` | 菜單資料庫 ID |
   | `MENU_DATABASE_ID` | `23afd5adc30b80c58355fd93d05c66d6` | 菜單資料庫 ID (備用名稱) |
   | `ORDERS_DB_ID` | `23afd5adc30b80c39e71d1a640ccfb5d` | 訂單資料庫 ID |
   | `ORDER_DATABASE_ID` | `23afd5adc30b80c39e71d1a640ccfb5d` | 訂單資料庫 ID (備用名稱) |
   | `TABLES_DB_ID` | `23afd5adc30b80fe86c9e086a54a0d61` | 桌況資料庫 ID |
   | `RESERVATIONS_DB_ID` | `23afd5adc30b802fbe36d69085c495b7` | 訂位資料庫 ID |
   | `STAFF_DB_ID` | `23afd5adc30b80b7a8e7dec998bf5aad` | 員工資料庫 ID |
   
   ### 🏢 系統配置變數 (可選)
   | 變數名稱 | 值 | 說明 |
   |----------|----|----- |
   | `RESTAURANT_NAME` | `Tanawat Restaurant` | 餐廳名稱 |
   | `RESTAURANT_TIMEZONE` | `Asia/Taipei` | 時區設定 |
   | `NODE_ENV` | `production` | 運行環境 |
   | `PORT` | `3000` | 伺服器端口 |
   
   **💡 快速設定方式：**
   我已經為您創建了完整的 `.env` 檔案，您可以：
   1. 使用檔案中的所有變數逐一添加到 Netlify
   2. 或者只添加上面表格中的**核心必要變數**，其他的專案會使用預設值
   
   **如何添加環境變數：**
   1. 在 Environment variables 區域點擊 "Add environment variables"
   2. 逐一輸入上面表格中的每個變數名稱和值
   3. 每添加一個變數後點擊 "Add" 按鈕
   4. 確認所有必要的變數都已添加

### 方法二：手動拖放部署

1. 打開 [Netlify Deploy](https://app.netlify.com/drop)
2. 將整個專案資料夾拖放到部署區域
3. 等待部署完成

## 🔧 部署後設定

### 1. 自訂網域 (可選)
```
yourrestaurant.com → 指向 Netlify DNS
```

### 2. HTTPS 設定
- Netlify 會自動提供 Let's Encrypt SSL 憑證
- 強制 HTTPS 已在 `_redirects` 中設定

### 3. 表單處理 (可選)
如需使用 Netlify Forms，在 HTML 中加入：
```html
<form name="contact" method="POST" data-netlify="true">
```

## 📱 功能測試

部署後請測試以下功能：

### 管理系統
- 主控台: `https://your-site.netlify.app/pages/management/dashboard.html`
- 訂單管理: `https://your-site.netlify.app/pages/management/order-management.html`
- 菜單管理: `https://your-site.netlify.app/pages/management/menu-management.html`

### 客戶端
- 點餐系統: `https://your-site.netlify.app/pages/customer/customer-view.html`
- 結帳系統: `https://your-site.netlify.app/pages/customer/checkout.html`
- 廚房顯示: `https://your-site.netlify.app/pages/customer/kds.html`

### PWA 功能
- 在手機瀏覽器中點擊 "新增至主畫面"
- 離線功能測試

## 🛠️ 故障排除

### 常見問題

1. **404 錯誤**
   - 檢查 `_redirects` 檔案是否在根目錄
   - 確認所有路徑使用相對路徑

2. **API 錯誤**
   - 檢查 Make.com webhook URL 是否正確
   - 確認 CORS 設定

3. **CSS/JS 載入失敗**
   - 檢查檔案路徑是否正確
   - 確認所有靜態資源都已上傳

### 除錯工具
- Netlify 部署日誌: 檢查建置過程
- 瀏覽器開發者工具: 檢查網路請求
- Netlify Functions 日誌: 檢查 API 呼叫

## 📊 效能優化

### 已啟用的優化
- ✅ 靜態檔案壓縮
- ✅ 圖片快取 (1年)
- ✅ CSS/JS 最小化
- ✅ Gzip 壓縮

### 建議的額外優化
- 使用 Netlify Image 服務進行圖片最佳化
- 啟用 Netlify Analytics 監控流量
- 設定 Split Testing 進行 A/B 測試

## 🔐 安全性

### 已配置的安全標頭
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 建議的額外安全措施
- 啟用 Netlify Access Control (付費功能)
- 設定 CSP (Content Security Policy)
- 定期更新依賴套件

## 📞 支援資源

- [Netlify 文件](https://docs.netlify.com/)
- [Netlify 社群論壇](https://community.netlify.com/)
- [專案 GitHub 儲存庫](https://github.com/Tanawathan/POSsys)

---

**部署完成後，您的餐廳 POS 系統將可在全球範圍內高效運行！** 🎉
