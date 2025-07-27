# 🚀 Netlify 部署檢查清單

## 📋 部署前檢查

### 1. 確認必要檔案存在
- [ ] `netlify/functions/uber-eats-webhook.js` ✅ (已建立)
- [ ] `netlify/functions/uber-eats-callback.js` ✅ (已建立) 
- [ ] `public/privacy-policy.html` ✅ (已建立)
- [ ] `netlify.toml` (Netlify 設定檔)

### 2. 部署指令
```bash
# 檢查當前狀態
netlify status

# 如果尚未連接到 Netlify site
netlify link

# 部署到生產環境
netlify deploy --prod

# 或者推送到 Git 觸發自動部署
git add .
git commit -m "部署 Uber Eats 整合功能"
git push origin main
```

### 3. 部署後驗證
部署完成後，驗證以下 URL 可正常訪問：
- [ ] https://tanawatthaipos.netlify.app/
- [ ] https://tanawatthaipos.netlify.app/privacy-policy.html
- [ ] https://tanawatthaipos.netlify.app/.netlify/functions/uber-eats-webhook

## 🔧 Netlify 環境變數設定

部署後，在 Netlify 管理面板設定以下環境變數：

```
UBER_EATS_CLIENT_ID=your_client_id_here
UBER_EATS_CLIENT_SECRET=your_client_secret_here
UBER_EATS_WEBHOOK_SECRET=your_webhook_secret_here
NOTION_API_KEY=secret_iSDhSCT8HPZMjPsX8YuMdhfzPJ2EYJrfXLdE17L88cV
NOTION_ORDERS_DB_ID=23afd5adc30b80c39e71d1a640ccfb5d
NOTION_TABLES_DB_ID=23afd5adc30b80fe86c9e086a54a0d61
NETLIFY_SITE_URL=https://tanawatthaipos.netlify.app
```

## 📞 Webhook 測試

設定完成後，可以用以下方式測試：

### 1. 手動測試
```bash
curl -X POST https://tanawatthaipos.netlify.app/.netlify/functions/uber-eats-webhook \
  -H "Content-Type: application/json" \
  -d '{"event_type":"ping","data":{"message":"test"}}'
```

### 2. Uber 內建測試
在 Uber 開發者面板中會有測試功能可以發送測試事件

---

**重要**: 只有在 Netlify Functions 成功部署後，才能設定 Webhook URL
