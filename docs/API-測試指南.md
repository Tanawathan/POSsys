# 🧪 Uber Eats API 本地測試指南

## 📋 測試前準備

### 1. 安裝必要依賴
```bash
# 確保有 Node.js
node --version

# 如果沒有，請安裝
# macOS: brew install node
# 或下載: https://nodejs.org/
```

### 2. 設定環境變數
創建 `.env.local` 檔案：
```bash
cp .env.uber-eats.template .env.local
```

編輯 `.env.local` 並填入實際值：
```
UBER_EATS_CLIENT_ID=你的_CLIENT_ID
UBER_EATS_CLIENT_SECRET=你的_CLIENT_SECRET
UBER_EATS_WEBHOOK_SECRET=tanawat_uber_2025_69777b97632ba4af853cb105b4ca709788b9f227f4b275f41767f390b116c8d9
```

## 🧪 執行測試

### 1. 網路連線測試
```bash
node -e "
const https = require('https');
https.get('https://api.uber.com/v2/eats', (res) => {
  console.log('✅ Uber API 可達, 狀態碼:', res.statusCode);
}).on('error', (err) => {
  console.log('❌ 網路錯誤:', err.message);
});
"
```

### 2. 完整 API 測試
```bash
# 執行完整測試套件
node scripts/test-uber-eats-api.js
```

### 3. 單獨測試模組
```bash
# 測試認證功能
node -e "
const { UberEatsAPI } = require('./scripts/uber-eats-integration');
const api = new UberEatsAPI({
  sandbox: true,
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
});
api.authenticate().then(token => {
  console.log('認證結果:', token ? '✅ 成功' : '❌ 失敗');
}).catch(err => {
  console.log('❌ 認證失敗:', err.message);
});
"
```

## 📊 Webhook 測試

### 1. 本地 Webhook 伺服器
```bash
# 安裝 netlify-cli
npm install -g netlify-cli

# 啟動本地開發伺服器
netlify dev
```

### 2. 測試 Webhook 端點
```bash
# 測試端點是否回應
curl -X POST http://localhost:8888/.netlify/functions/uber-eats-webhook \
  -H "Content-Type: application/json" \
  -d '{"event_type":"ping","data":{"message":"test"}}'
```

### 3. 模擬 Uber Eats Webhook
```bash
curl -X POST http://localhost:8888/.netlify/functions/uber-eats-webhook \
  -H "Content-Type: application/json" \
  -H "x-uber-signature: test_signature" \
  -d '{
    "event_type": "orders.notification",
    "data": {
      "id": "test_order_123",
      "status": "created",
      "total_amount": 2500,
      "items": [
        {"name": "測試餐點", "quantity": 1, "price": 2500}
      ]
    }
  }'
```

## 🔧 疑難排解

### 常見錯誤

**1. 認證失敗 (401 Unauthorized)**
- 檢查 Client ID 和 Client Secret 是否正確
- 確認 Uber 應用程式已完成設定
- 檢查 API 權限是否已開通

**2. 網路連線失敗**
- 檢查網路連線
- 確認防火牆設定
- 嘗試使用 VPN

**3. Webhook 無回應**
- 確認 Netlify Functions 已部署
- 檢查環境變數設定
- 查看 Netlify 部署日誌

### 除錯技巧

**1. 啟用詳細日誌**
```bash
DEBUG=uber-eats:* node scripts/test-uber-eats-api.js
```

**2. 檢查 API 回應**
```bash
curl -v https://api.uber.com/v2/eats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**3. 驗證 Webhook 簽名**
```bash
node -e "
const crypto = require('crypto');
const payload = '{\"test\": \"data\"}';
const secret = 'your_webhook_secret';
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log('期望簽名:', signature);
"
```

## 📈 成功指標

### ✅ 測試應該通過的項目
- [ ] 網路連線到 Uber API
- [ ] OAuth 認證流程
- [ ] Webhook 端點回應
- [ ] 訂單資料轉換
- [ ] 狀態映射正確

### ⚠️ 預期的限制
- 沒有 Store ID 時無法測試餐廳資訊
- Sandbox 環境的訂單資料可能有限
- 某些 API 需要正式審核通過才能使用

## 📞 取得支援

如果測試過程中遇到問題：
1. 檢查 Uber 開發者文件
2. 確認應用程式設定正確
3. 聯絡 Uber 開發者支援

---

**測試完成後的下一步:**
1. 部署到生產環境
2. 設定正式的 Store ID
3. 申請生產環境 API 權限
4. 進行整合測試
