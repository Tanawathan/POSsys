# Netlify 部署檢查清單 ✅

## 🚀 部署前檢查

### 1. 代碼準備
- [ ] 所有 API 端點已更新為 Netlify Functions 格式
- [ ] `netlify/functions/notion-api.js` 文件存在且完整
- [ ] `netlify.toml` 配置正確
- [ ] 運行 `npm run deploy-prep` 成功

### 2. 環境變數準備
確保您有以下 Notion API 資訊：
- [ ] `NOTION_API_KEY` - Notion Integration Token
- [ ] `MENU_DATABASE_ID` - 菜單資料庫 ID
- [ ] `ORDERS_DB_ID` - 訂單資料庫 ID  
- [ ] `TABLES_DB_ID` - 桌位資料庫 ID
- [ ] `RESERVATIONS_DB_ID` - 訂位資料庫 ID
- [ ] `STAFF_DB_ID` - 員工資料庫 ID

### 3. Notion 權限檢查
- [ ] Notion Integration 已連接到所有必要的資料庫
- [ ] Integration 有讀取和寫入權限
- [ ] 資料庫結構符合系統要求

## 🔧 Netlify 部署設定

### 1. 基本設定
- [ ] 選擇正確的 GitHub 倉庫
- [ ] 分支設定為 `main` 或 `master`
- [ ] Build command: `node build-for-netlify.js`
- [ ] Publish directory: `.`
- [ ] Functions directory: `netlify/functions`

### 2. 環境變數設定
在 Netlify 管理面板中設定以下變數：

#### 必要變數
- [ ] `NOTION_API_KEY` = `您的_Notion_API_密鑰`
- [ ] `MENU_DATABASE_ID` = `您的_菜單資料庫ID`
- [ ] `ORDERS_DB_ID` = `您的_訂單資料庫ID`
- [ ] `TABLES_DB_ID` = `您的_桌位資料庫ID`
- [ ] `RESERVATIONS_DB_ID` = `您的_訂位資料庫ID`
- [ ] `STAFF_DB_ID` = `您的_員工資料庫ID`

#### 可選變數
- [ ] `RESTAURANT_NAME` = `您的餐廳名稱`
- [ ] `RESTAURANT_TIMEZONE` = `Asia/Taipei`
- [ ] `NODE_ENV` = `production`

### 3. 部署觸發
- [ ] 推送代碼到 GitHub
- [ ] 確認 Netlify 自動開始構建
- [ ] 等待構建完成（通常 1-3 分鐘）

## 🧪 部署後測試

### 1. 基本功能測試
訪問以下頁面確認正常運作：

- [ ] **主頁**: `https://您的網站.netlify.app`
- [ ] **測試頁面**: `https://您的網站.netlify.app/public/netlify-test.html`

### 2. API 端點測試
在測試頁面中執行：

- [ ] **健康檢查**: 應該返回 `status: ok`
- [ ] **Notion 連接**: 應該顯示連接成功和用戶信息
- [ ] **菜單資料庫**: 應該能查詢到菜單項目

### 3. 系統功能測試
測試主要系統功能：

#### 管理系統
- [ ] 訂單管理頁面載入正常
- [ ] 菜單管理功能正常
- [ ] 桌位管理功能正常
- [ ] 可以查看和編輯資料

#### 客戶端系統  
- [ ] 點餐介面載入正常
- [ ] 結帳系統功能正常
- [ ] 廚房顯示系統正常
- [ ] 可以提交訂單

#### 工具和測試
- [ ] 資料庫設定工具正常
- [ ] CSV 同步工具正常
- [ ] 系統測試工具正常

## 🔍 故障排除檢查

### 如果部署失敗
- [ ] 檢查 Netlify 部署日誌中的錯誤信息
- [ ] 確認 `build-for-netlify.js` 腳本執行成功
- [ ] 檢查是否有語法錯誤或缺失文件

### 如果 API 調用失敗
- [ ] 檢查環境變數是否正確設定
- [ ] 確認 Notion API 密鑰有效
- [ ] 檢查資料庫 ID 是否正確
- [ ] 確認 Notion Integration 權限正確

### 如果頁面載入異常
- [ ] 檢查瀏覽器開發者工具的錯誤信息
- [ ] 確認所有 JavaScript 文件正確載入
- [ ] 檢查 CSS 樣式是否正確應用

## 📊 性能檢查

### 1. 載入速度
- [ ] 主頁載入時間 < 3 秒
- [ ] API 調用響應時間 < 5 秒
- [ ] 圖片和資源載入正常

### 2. 行動裝置測試
- [ ] 手機瀏覽器顯示正常
- [ ] 觸控操作正常
- [ ] 響應式設計正確

### 3. 功能完整性
- [ ] 所有按鈕和連結正常工作
- [ ] 表單提交正常
- [ ] 資料顯示正確

## 🚨 上線前最終檢查

### 1. 安全性
- [ ] 環境變數中沒有硬編碼的敏感信息
- [ ] HTTPS 正常工作
- [ ] 沒有開發用的調試信息洩露

### 2. 用戶體驗
- [ ] 所有功能都有適當的載入指示
- [ ] 錯誤信息友善且有用
- [ ] 導航清晰易懂

### 3. 備份和文檔
- [ ] 環境變數已備份保存
- [ ] 部署配置已記錄
- [ ] 用戶手冊已更新

## ✅ 部署成功確認

當所有檢查項目都完成後：

- [ ] 系統在 Netlify 上正常運行
- [ ] 所有核心功能都能正常使用  
- [ ] 性能符合預期
- [ ] 用戶可以正常訪問和使用系統

## 📞 需要幫助？

如果在檢查過程中遇到問題：

1. **查看部署日誌**: 在 Netlify 管理面板中檢查詳細的錯誤信息
2. **使用測試頁面**: 利用 `/public/netlify-test.html` 診斷具體問題
3. **檢查文檔**: 參考 `NETLIFY-DEPLOYMENT-GUIDE.md` 獲取詳細說明

---

**完成所有檢查項目後，您的餐廳管理系統就可以正式在 Netlify 上為客戶提供服務了！** 🎉