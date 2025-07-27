# 🍔 Uber Eats 應用程式設定指南

## 🔧 當前設定狀態

### ✅ 已完成
- [x] 組織創建: TanawatThaiPOS
- [x] 應用程式創建
- [x] Client Secret 生成 (2025/7/27)

### 📋 待設定項目

## 1. Authentication 設定
- **認證方式**: Client Secret ✅ (已選擇)
- **Client Secret**: 已生成 ✅

## 2. Redirect URIs 設定

### 開發環境
```
http://localhost:8888/.netlify/functions/uber-eats-callback
http://localhost:3000/auth/uber-callback
```

### 生產環境
```
https://your-site.netlify.app/.netlify/functions/uber-eats-callback
https://tanawat-pos.netlify.app/.netlify/functions/uber-eats-callback
```

## 3. Privacy Policy URL
```
https://your-site.netlify.app/privacy-policy.html
```

## 4. Webhooks 設定

### Webhook URL
```
https://your-site.netlify.app/.netlify/functions/uber-eats-webhook
```

### 事件類型
- `orders.notification` - 新訂單通知
- `orders.status_changed` - 訂單狀態變更
- `orders.cancel_requested` - 訂單取消請求
- `ping` - 連線測試

## 5. Public Details

### Display Name
```
Tanawat Thai Restaurant POS System
```

### Description
```
Integrated Point of Sale system for Tanawat Thai Restaurant. Seamlessly manages Uber Eats orders with real-time synchronization to local POS and kitchen display systems.
```

## 📋 設定步驟詳解

### Step 1: 添加 Redirect URI
1. 點擊 "Redirect URIs" 區域的 "Add" 按鈕
2. 輸入開發環境 URL
3. 點擊 "+" 再添加生產環境 URL
4. 點擊 "Save" 保存

### Step 2: 設定 Privacy Policy
1. 在 "Privacy Policy URL" 欄位輸入您的隱私政策頁面 URL
2. 如果還沒有，可以先用主頁 URL

### Step 3: 設定 Webhooks
1. 點擊 "Webhooks" 區域的 "click here" 連結
2. 添加 Webhook URL
3. 選擇需要的事件類型
4. 測試 Webhook 連線

### Step 4: 填寫公開資訊
1. 在 "Public Display Name" 填入應用程式顯示名稱
2. 在 "Public Description" 填入詳細描述
3. 點擊 "Save" 保存所有設定

## 🔐 安全性設定

### Client Secret 安全
- ✅ 已生成 Client Secret
- ⚠️ 請妥善保存，不要洩露
- 📝 將其添加到環境變數中

### 記錄重要資訊
```
Client ID: [從頁面複製]
Client Secret: [從設定頁面複製]
Application ID: [從 URL 中取得]
Organization ID: a601fa51-c53a-4e36-ad31-2aaaa9703b2a
```

## 📄 需要建立的頁面

### 1. 隱私政策頁面
建立 `public/privacy-policy.html`

### 2. OAuth 回調處理
建立 `netlify/functions/uber-eats-callback.js`

### 3. Webhook 處理器
已準備 `netlify/functions/uber-eats-webhook.js`

## 🚀 下一步行動

### 立即執行
1. [ ] 複製 Client ID 和 Client Secret
2. [ ] 添加 Redirect URI
3. [ ] 設定 Webhook URL
4. [ ] 填寫公開資訊
5. [ ] 點擊 "Save" 保存設定

### 後續開發
1. [ ] 創建隱私政策頁面
2. [ ] 部署 Netlify Functions
3. [ ] 測試 Webhook 連線
4. [ ] 實作 OAuth 流程

## 📞 如需協助

如果在設定過程中遇到問題：
1. 檢查網路連線
2. 確認 URL 格式正確
3. 聯絡 Uber 開發者支援

---

**更新時間**: 2025年7月27日
**設定狀態**: 進行中
**負責人**: [您的名稱]
