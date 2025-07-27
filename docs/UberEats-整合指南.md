# 🍔 Uber Eats API 整合指南

## 📋 整合概覽

此整合允許您的 POS 系統直接接收和處理來自 Uber Eats 平台的訂單，實現無縫的多平台訂單管理。

### 🔄 資料流程
```
Uber Eats 平台 → Webhook → 本地 POS 系統 → Notion 資料庫 → KDS 廚房系統
```

## 🚀 快速開始

### 1. 申請 Uber Eats API
1. 前往 [Uber Developer Portal](https://developer.uber.com/)
2. 註冊開發者帳號
3. 申請 Eats API 存取權限
4. 提交商業文件等待審核

### 2. 配置環境變數
```bash
# 複製環境變數模板
cp .env.uber-eats.template .env.uber-eats

# 編輯配置文件
nano .env.uber-eats
```

### 3. 部署 Webhook 端點
```bash
# 部署到 Netlify
netlify deploy --prod

# Webhook URL 將會是:
# https://your-site.netlify.app/.netlify/functions/uber-eats-webhook
```

### 4. 配置 Uber Eats Webhook
在 Uber Eats 開發者面板中設定：
- **Webhook URL**: `https://your-site.netlify.app/.netlify/functions/uber-eats-webhook`
- **Events**: `orders.notification`, `orders.status_changed`

## 🔧 技術實作

### API 整合模組
- **檔案**: `scripts/uber-eats-integration.js`
- **功能**: OAuth 認證、訂單同步、狀態管理
- **類別**: `UberEatsAPI`, `UberEatsWebhookHandler`

### Webhook 處理
- **檔案**: `netlify/functions/uber-eats-webhook.js`
- **功能**: 接收 Uber Eats 事件、資料轉換、通知處理

### 訂單映射
| Uber Eats 狀態 | 本地系統狀態 |
|----------------|--------------|
| `created` | 待處理 |
| `accepted` | 製作中 |
| `ready_for_pickup` | 等待甜點 |
| `picked_up` | 等待結帳 |
| `delivered` | 結帳完成 |
| `cancelled` | 已取消 |

## 📊 功能特色

### 🔄 自動訂單同步
- 即時接收 Uber Eats 新訂單
- 自動轉換為本地訂單格式
- 同步存入 Notion 資料庫

### 📋 訂單管理
- 統一的訂單狀態管理
- 支援訂單備註和特殊要求
- 客戶資訊和送達地址記錄

### 🔔 通知系統
- 新訂單即時通知
- 多種通知方式支援
- 可自訂通知內容

### 📈 營收整合
- Uber Eats 營收統計
- 多平台營收對比
- 自動財務記錄

## 🛡️ 安全性

### API 安全
- OAuth 2.0 認證機制
- HTTPS 加密傳輸
- API 金鑰安全存儲

### Webhook 驗證
- 數位簽名驗證
- 防重放攻擊
- 錯誤處理和重試

### 資料保護
- 客戶資料加密
- 符合隱私法規
- 定期安全稽核

## 🔍 測試

### 本地測試
```bash
# 執行測試 Webhook
node netlify/functions/uber-eats-webhook.js

# 測試 API 整合
node -e "require('./scripts/uber-eats-integration.js').testAPI()"
```

### Sandbox 環境
- 使用 Uber Eats Sandbox API
- 模擬訂單和狀態變更
- 完整功能測試

## 📞 支援與文件

### 官方資源
- [Uber Eats API 文件](https://developer.uber.com/docs/eats)
- [Webhook 指南](https://developer.uber.com/docs/eats/webhooks)
- [開發者社群](https://community.uber.com/)

### 本地支援
- 技術文件: `docs/UberEats-API-準備文件.md`
- 疑難排解: 參考系統日誌
- 聯絡資訊: [請填入技術支援聯絡方式]

## 🔧 疑難排解

### 常見問題

**Q: Webhook 沒有收到事件**
- 檢查 Webhook URL 是否正確設定
- 確認 Netlify Function 已正確部署
- 檢查防火牆和網路設定

**Q: API 認證失敗**
- 確認 Client ID 和 Client Secret 正確
- 檢查 OAuth scope 設定
- 確認 API 權限已開通

**Q: 訂單資料格式錯誤**
- 檢查訂單映射邏輯
- 確認 Notion 資料庫結構
- 查看轉換函數錯誤日誌

### 日誌檢查
```bash
# Netlify Function 日誌
netlify functions:log uber-eats-webhook

# 本地除錯
DEBUG=uber-eats:* npm start
```

## 📅 維護

### 定期檢查
- [ ] API 金鑰有效性
- [ ] Webhook 端點運作狀況
- [ ] 訂單同步準確性
- [ ] 系統效能監控

### 更新作業
- [ ] 定期更新依賴套件
- [ ] 追蹤 Uber Eats API 變更
- [ ] 備份重要設定和資料

---

**最後更新**: 2025年7月27日  
**版本**: v1.0  
**維護者**: [請填入負責人]
