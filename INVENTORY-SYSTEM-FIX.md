# 庫存管理系統載入失敗修復指南

## 🔍 問題診斷

庫存管理系統載入失敗的主要原因是 Netlify Functions 中的 `node-fetch` 相容性問題。

## 🛠️ 已實施的修復

### 1. 修復 Netlify Functions 中的 fetch 問題
- **檔案**: `netlify/functions/notion-api.js`
- **問題**: `node-fetch` v3+ 使用 ESM 模組，但 Netlify Functions 使用 CommonJS
- **解決方案**: 使用 Node.js 18+ 內建的 fetch API 或動態載入 node-fetch

```javascript
// 修復前
const fetch = require('node-fetch');

// 修復後
let fetch;
if (typeof globalThis.fetch === 'undefined') {
    fetch = require('node-fetch');
} else {
    fetch = globalThis.fetch;
}
```

### 2. 改善錯誤處理和診斷
- **檔案**: `inventory-force-reload.html`
- **新增功能**:
  - 詳細的錯誤訊息顯示
  - 故障排除建議
  - 重新載入按鈕
  - 診斷工具連結

### 3. 創建診斷工具
- **檔案**: `inventory-debug.html`
- **功能**:
  - 自動系統診斷
  - API 連接測試
  - 庫存資料載入測試
  - 詳細錯誤報告

## 🚀 部署檢查清單

### Netlify 環境變數設定
確保在 Netlify 後台設定以下環境變數：

1. **NOTION_API_KEY**: `secret_iSDhSCT8HPZMjPsX8YuMdhfzPJ2EYJrfXLdE17L88cV`
2. **MENU_DATABASE_ID**: 菜單資料庫 ID
3. **ORDERS_DB_ID**: 訂單資料庫 ID
4. **TABLES_DB_ID**: 桌號資料庫 ID
5. **RESERVATIONS_DB_ID**: 預約資料庫 ID
6. **STAFF_DB_ID**: 員工資料庫 ID

### 部署步驟
1. 確認 `netlify.toml` 配置正確
2. 執行構建腳本: `node build-for-netlify.js`
3. 檢查 `netlify/functions/notion-api.js` 存在且正確
4. 部署到 Netlify
5. 測試 API 端點: `https://your-site.netlify.app/.netlify/functions/notion-api/health`

## 🔧 故障排除

### 1. 如果庫存管理系統仍然載入失敗

**檢查步驟**:
1. 開啟診斷工具: `/inventory-debug.html`
2. 執行系統診斷
3. 檢查 API 連接測試結果
4. 測試庫存資料載入

**常見問題**:
- **Functions 404 錯誤**: 檢查 Netlify Functions 是否正確部署
- **API 認證失敗**: 檢查 NOTION_API_KEY 環境變數
- **CORS 錯誤**: 確認 Functions 中的 CORS 設定

### 2. 手動測試 API 端點

```bash
# 測試健康檢查
curl https://your-site.netlify.app/.netlify/functions/notion-api/health

# 測試 Notion 連接
curl https://your-site.netlify.app/.netlify/functions/notion-api/test-notion
```

### 3. 檢查 Netlify 部署日誌
1. 登入 Netlify 後台
2. 查看部署日誌
3. 檢查 Functions 構建是否成功
4. 查看運行時錯誤

## 📋 測試清單

- [ ] Netlify Functions 部署成功
- [ ] 環境變數設定正確
- [ ] `/inventory-debug.html` 診斷通過
- [ ] API 健康檢查返回正常
- [ ] Notion API 連接測試成功
- [ ] 庫存資料載入測試成功
- [ ] `inventory-force-reload.html` 正常載入資料

## 🆘 緊急聯絡

如果問題持續存在，請：
1. 檢查 Netlify 部署狀態
2. 查看 Functions 日誌
3. 確認 Notion API 金鑰有效
4. 檢查資料庫權限設定

## 📚 相關文件

- [Netlify Functions 文件](https://docs.netlify.com/functions/overview/)
- [Notion API 文件](https://developers.notion.com/)
- [Node.js fetch API](https://nodejs.org/api/globals.html#fetch)

---

**最後更新**: 2024年7月26日
**版本**: 2.0.0