# 🔧 Netlify 環境變數設定指南

## 📋 需要設定的環境變數

```bash
# 從 Uber 開發者後台取得
UBER_EATS_CLIENT_ID=你的_CLIENT_ID
UBER_EATS_CLIENT_SECRET=你的_CLIENT_SECRET

# 已準備好的 Webhook 設定
UBER_EATS_WEBHOOK_SECRET=tanawat_uber_2025_69777b97632ba4af853cb105b4ca709788b9f227f4b275f41767f390b116c8d9

# 現有的 Notion 設定
NOTION_API_KEY=secret_iSDhSCT8HPZMjPsX8YuMdhfzPJ2EYJrfXLdE17L88cV
NOTION_ORDERS_DB_ID=23afd5adc30b80c39e71d1a640ccfb5d
NOTION_TABLES_DB_ID=23afd5adc30b80fe86c9e086a54a0d61

# Webhook 基本認證
WEBHOOK_USERNAME=tanawat_pos
WEBHOOK_PASSWORD=secure_webhook_2025_access
```

## 🌐 Netlify 環境變數設定步驟

### 方法 1: 透過 Netlify 網站界面

1. **登入 Netlify Dashboard**
   - 前往 [Netlify](https://app.netlify.com/)
   - 找到你的 `tanawatthaipos` 網站

2. **進入環境變數設定**
   - 點擊你的網站 → **Site settings**
   - 在左側選單找到 **Environment variables**

3. **新增環境變數**
   - 點擊 **Add variable**
   - 逐一新增上述每個變數

### 方法 2: 透過 Netlify CLI (推薦)

```bash
# 登入 Netlify
npx netlify login

# 設定環境變數
npx netlify env:set UBER_EATS_CLIENT_ID "你的_CLIENT_ID"
npx netlify env:set UBER_EATS_CLIENT_SECRET "你的_CLIENT_SECRET"
npx netlify env:set UBER_EATS_WEBHOOK_SECRET "tanawat_uber_2025_69777b97632ba4af853cb105b4ca709788b9f227f4b275f41767f390b116c8d9"
npx netlify env:set WEBHOOK_USERNAME "tanawat_pos"
npx netlify env:set WEBHOOK_PASSWORD "secure_webhook_2025_access"

# 觸發重新部署
npx netlify deploy --prod
```

## ✅ 驗證設定

設定完成後執行測試：

```bash
# 本地測試 (需要先建立 .env.local)
node scripts/test-uber-eats-api.js

# 或測試線上 Webhook
curl -X POST https://tanawatthaipos.netlify.app/.netlify/functions/uber-eats-webhook \
  -H "Content-Type: application/json" \
  -d '{"event_type":"ping","data":{"message":"test"}}'
```

## 🔍 疑難排解

### 常見問題

**Q: 找不到 Client ID 和 Client Secret**
- 確保應用程式狀態是 "Active" 或 "Approved"
- 檢查是否在正確的應用程式頁面
- 嘗試重新整理頁面

**Q: Client Secret 無法顯示**
- 點擊 "Show"、"Reveal" 或眼睛圖示
- 確保你有該應用程式的管理權限

**Q: 設定後仍然測試失敗**
- 檢查環境變數名稱是否正確
- 確認 Netlify 已重新部署
- 檢查是否有拼寫錯誤

---

### 🎯 下一步

設定完環境變數後：
1. ✅ 重新執行 API 測試
2. ✅ 確認 OAuth 認證成功
3. ⏳ 等待 Uber 審核通過取得 Store ID
4. 🚀 開始接收真實訂單！
