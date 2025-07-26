# 庫存管理系統快速修復指南

## ⚡ 立即執行步驟

### 步驟 1: 獲取新的 Notion API Token

1. **登入 Notion**: https://www.notion.so
2. **前往 Integrations**: https://www.notion.so/my-integrations
3. **創建新的 Integration**:
   - 點擊 "New integration"
   - 名稱: "TANAWAT 餐廳系統"
   - 類型: Internal
   - 能力: Read content
4. **複製 API Token**: 格式為 `secret_xxxxxxxxxxxxxxxxx`

### 步驟 2: 分享資料庫給 Integration

1. **開啟食材庫頁面**: 在 Notion 中找到食材庫
2. **點擊 Share**: 右上角的 "Share" 按鈕
3. **邀請 Integration**:
   - 搜尋剛創建的 integration 名稱
   - 設定權限為 "Can read"
   - 點擊 "Invite"

### 步驟 3: 更新 Netlify 環境變數

1. **登入 Netlify**: https://app.netlify.com
2. **選擇專案**: 找到 TANAWAT 餐廳系統專案
3. **進入設定**:
   - Site settings → Environment variables
4. **更新變數**:
   - 找到 `NOTION_API_KEY`
   - 點擊 "Options" → "Edit"
   - 貼上新的 API token
   - 點擊 "Save"

### 步驟 4: 重新部署

1. **觸發部署**:
   - 在 Netlify 專案頁面
   - 點擊 "Deploys" 標籤
   - 點擊 "Trigger deploy" → "Deploy site"

### 步驟 5: 測試修復

1. **等待部署完成** (約 2-3 分鐘)
2. **開啟診斷工具**: `https://your-site.netlify.app/inventory-detailed-debug.html`
3. **執行完整測試**: 點擊 "執行完整測試" 按鈕
4. **檢查結果**: 確認所有測試都顯示 ✅

## 🔍 驗證清單

完成上述步驟後，請確認以下項目：

- [ ] ✅ API 狀態: 正常
- [ ] ✅ 資料庫連接: 已連接  
- [ ] ✅ 載入資料量: > 0
- [ ] ✅ 回應時間: < 3000ms
- [ ] ✅ Notion API 連接測試: 成功
- [ ] ✅ 食材庫資料獲取: 成功
- [ ] ✅ 資料轉換測試: 成功

## 🚨 如果仍有問題

### 常見問題解決

1. **API 狀態顯示 "失敗"**
   - 檢查 Netlify Functions 部署狀態
   - 確認 `netlify/functions/notion-api.js` 文件存在

2. **資料庫連接顯示 "認證失敗"**
   - 再次檢查 API token 是否正確複製
   - 確認 Integration 已被邀請到食材庫

3. **載入資料量為 0**
   - 檢查食材庫是否有資料
   - 確認資料庫 ID 是否正確: `237fd5adc30b808cbba3c03f8f2065fd`

### 緊急聯絡

如果問題持續存在，請提供：
1. 診斷工具的完整測試結果截圖
2. Netlify 部署日誌
3. Notion Integration 設定截圖

## 📱 測試網址

修復完成後，請測試以下頁面：

1. **診斷工具**: `/inventory-detailed-debug.html`
2. **庫存管理**: `/inventory-force-reload.html`
3. **API 健康檢查**: `/.netlify/functions/notion-api/health`

## ⏱️ 預計修復時間

- **API Token 更新**: 5 分鐘
- **Netlify 部署**: 3 分鐘
- **測試驗證**: 2 分鐘
- **總計**: 約 10 分鐘

---

**💡 提示**: 如果您不確定任何步驟，請先備份現有設定，然後按照指南逐步執行。