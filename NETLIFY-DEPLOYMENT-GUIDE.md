# Netlify 部署指南 (Serverless 版本)

本指南將幫助您將 Tanawat 餐廳管理系統部署到 Netlify，使用 Netlify Functions 替代本地服務器。

## 🚀 部署概述

系統已完全重構為 serverless 架構：
- **前端**: 靜態 HTML/CSS/JS 文件
- **後端**: Netlify Functions (取代 proxy-server.js)
- **API**: 通過 `/.netlify/functions/notion-api` 提供服務

## 📋 部署前準備

### 1. 確認環境變數
確保您有以下 Notion API 配置：
```
NOTION_API_KEY=ntn_xxxxxxxxx
MENU_DATABASE_ID=xxxxxxxx
ORDERS_DB_ID=xxxxxxxx
TABLES_DB_ID=xxxxxxxx
RESERVATIONS_DB_ID=xxxxxxxx
STAFF_DB_ID=xxxxxxxx
```

### 2. 準備部署文件
運行以下命令來準備部署：
```bash
npm run deploy-prep
```

這個命令會：
- 更新所有 API 端點到 Netlify Functions
- 生成環境配置文件
- 準備構建文件

## 🔧 Netlify 部署步驟

### 方法一：GitHub 自動部署 (推薦)

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Update for Netlify serverless deployment"
   git push origin main
   ```

2. **連接到 Netlify**
   - 登入 [Netlify](https://netlify.com)
   - 點擊 "New site from Git"
   - 選擇您的 GitHub 倉庫

3. **配置構建設定**
   - Build command: `node build-for-netlify.js`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

4. **設定環境變數**
   在 Netlify 管理面板中設定：
   ```
   NOTION_API_KEY=您的_Notion_API_密鑰
   MENU_DATABASE_ID=您的_菜單資料庫ID
   ORDERS_DB_ID=您的_訂單資料庫ID
   TABLES_DB_ID=您的_桌位資料庫ID
   RESERVATIONS_DB_ID=您的_訂位資料庫ID
   STAFF_DB_ID=您的_員工資料庫ID
   RESTAURANT_NAME=您的餐廳名稱
   RESTAURANT_TIMEZONE=Asia/Taipei
   ```

### 方法二：手動部署

1. **構建項目**
   ```bash
   npm run netlify-build
   ```

2. **安裝 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **登入並部署**
   ```bash
   netlify login
   netlify deploy --prod
   ```

## 🧪 測試部署

部署完成後，訪問以下頁面進行測試：

1. **主系統**: `https://您的網站.netlify.app`
2. **部署測試頁面**: `https://您的網站.netlify.app/public/netlify-test.html`

### 測試檢查清單

- [ ] 健康檢查端點正常工作
- [ ] Notion API 連接成功
- [ ] 菜單資料庫查詢正常
- [ ] 訂單系統功能正常
- [ ] 桌位管理功能正常

## 🔍 故障排除

### 常見問題

1. **Netlify Function 404 錯誤**
   - 確認 `netlify/functions/notion-api.js` 文件存在
   - 檢查 `netlify.toml` 中的 functions 配置

2. **環境變數未載入**
   - 在 Netlify 管理面板中檢查環境變數設定
   - 確認變數名稱拼寫正確

3. **API 調用失敗**
   - 檢查 Notion API 密鑰是否有效
   - 確認資料庫 ID 正確

### 除錯工具

使用內建的測試頁面：
```
https://您的網站.netlify.app/public/netlify-test.html
```

## 📁 文件結構

```
project/
├── netlify/
│   └── functions/
│       └── notion-api.js      # 主要 API 函數
├── public/
│   ├── env-config.js          # 環境配置 (自動生成)
│   ├── api-config.js          # API 配置 (自動生成)
│   └── netlify-test.html      # 測試頁面
├── netlify.toml               # Netlify 配置
├── build-for-netlify.js       # 構建腳本
└── update-api-endpoints.js    # API 端點更新腳本
```

## 🔄 更新部署

當您需要更新系統時：

1. **更新代碼**
2. **運行準備腳本**
   ```bash
   npm run deploy-prep
   ```
3. **推送到 GitHub** (如果使用自動部署)
   ```bash
   git add .
   git commit -m "Update system"
   git push origin main
   ```

## 🚨 重要注意事項

1. **安全性**: 環境變數中的敏感信息不會出現在前端代碼中
2. **性能**: Netlify Functions 有冷啟動時間，首次調用可能較慢
3. **限制**: 注意 Netlify Functions 的使用限制和配額
4. **監控**: 使用 Netlify 的功能監控來追蹤 API 使用情況

## 📞 支援

如果遇到問題：
1. 檢查 Netlify 部署日誌
2. 使用測試頁面診斷問題
3. 確認所有環境變數設定正確

---

**部署成功後，您的餐廳管理系統將完全運行在 Netlify 的 serverless 架構上！** 🎉
