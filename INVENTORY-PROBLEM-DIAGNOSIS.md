# 庫存管理系統問題診斷報告

## 🔍 問題現況

**主要問題**: 庫存管理系統無法載入正確的庫存資料
**影響範圍**: 所有依賴 Notion API 食材庫資料的功能
**問題類型**: API 連接和認證問題

## 🛠️ 已發現的問題

### 1. Netlify Functions 相容性問題 ✅ 已修復
- **問題**: `node-fetch` v3+ ESM/CommonJS 相容性問題
- **影響**: Netlify Functions 無法正常執行
- **解決方案**: 修改 `netlify/functions/notion-api.js` 使用內建 fetch API

### 2. Notion API Token 問題 ❌ 需要處理
- **問題**: API token 無效或過期
- **錯誤訊息**: "API token is invalid"
- **影響**: 無法連接到 Notion API
- **需要行動**: 更新有效的 API token

### 3. 環境變數配置問題 ⚠️ 需要確認
- **問題**: Netlify 環境變數可能未正確設定
- **影響**: 部署後 API 調用失敗
- **需要行動**: 確認 Netlify 後台環境變數設定

## 📋 技術分析

### API 調用流程
```
庫存管理系統 → Netlify Functions → Notion API → 食材庫資料庫
```

### 資料庫配置
- **資料庫 ID**: `237fd5adc30b808cbba3c03f8f2065fd`
- **資料庫名稱**: 食材庫
- **預期欄位**: 品項ID, 食材名稱, 供應商, 規格/單位, 庫存量, 安全庫存量, 進價, 單位成本, 品項類別, 最後進貨日, 狀態, 總進貨量

### 資料轉換邏輯
- ✅ 欄位映射邏輯正確
- ✅ 單位解析功能完整
- ✅ 庫存狀態計算準確
- ✅ 錯誤處理機制完善

## 🚀 解決方案

### 立即行動項目

1. **更新 Notion API Token**
   ```bash
   # 在 Netlify 後台設定新的環境變數
   NOTION_API_KEY=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **驗證資料庫權限**
   - 確認 API token 有讀取食材庫的權限
   - 檢查資料庫是否已正確分享給 integration

3. **測試 API 連接**
   - 使用 `/inventory-detailed-debug.html` 進行詳細診斷
   - 確認 Netlify Functions 部署狀態

### 技術實施步驟

1. **獲取新的 API Token**
   ```
   1. 登入 Notion
   2. 前往 https://www.notion.so/my-integrations
   3. 創建新的 integration 或更新現有的
   4. 複製新的 API token
   ```

2. **更新 Netlify 環境變數**
   ```
   1. 登入 Netlify 後台
   2. 選擇專案 → Site settings → Environment variables
   3. 更新 NOTION_API_KEY
   4. 重新部署
   ```

3. **驗證資料庫存取權限**
   ```
   1. 開啟 Notion 食材庫頁面
   2. 點擊右上角 "Share"
   3. 確認 integration 已被邀請
   4. 設定適當的權限 (Read access)
   ```

## 🔧 已實施的修復

### 1. Netlify Functions 修復
**檔案**: `netlify/functions/notion-api.js`
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

### 2. 錯誤處理改善
**檔案**: `inventory-force-reload.html`
- 詳細錯誤訊息顯示
- 故障排除建議
- 診斷工具連結
- 重新載入功能

### 3. 診斷工具創建
**檔案**: `inventory-detailed-debug.html`
- 自動系統診斷
- API 連接測試
- 資料轉換驗證
- 實時錯誤報告

## 📊 測試驗證

### 本地測試結果
```
❌ Notion API 連接: API token is invalid
✅ 資料轉換邏輯: 正確
✅ 錯誤處理: 完善
✅ 診斷工具: 可用
```

### 部署後需要測試的項目
- [ ] `/inventory-detailed-debug.html` 系統診斷
- [ ] `/.netlify/functions/notion-api/health` API 健康檢查
- [ ] `/.netlify/functions/notion-api/test-notion` Notion 連接測試
- [ ] `/inventory-force-reload.html` 庫存資料載入

## 🎯 下一步行動

### 優先級 1 (立即執行)
1. **更新 Notion API Token**
   - 獲取新的有效 token
   - 在 Netlify 後台更新環境變數
   - 確認資料庫權限設定

### 優先級 2 (部署後)
2. **驗證修復效果**
   - 重新部署到 Netlify
   - 執行完整診斷測試
   - 確認庫存資料正常載入

### 優先級 3 (監控)
3. **持續監控**
   - 定期檢查 API token 有效性
   - 監控系統錯誤日誌
   - 維護診斷工具功能

## 📚 相關文件

- `INVENTORY-SYSTEM-FIX.md` - 詳細修復指南
- `inventory-detailed-debug.html` - 系統診斷工具
- `test-inventory-api.js` - 本地測試腳本
- `deploy-fix.sh` - 部署腳本

## 📞 支援聯絡

如需進一步協助，請提供以下資訊：
1. Netlify 部署日誌
2. 診斷工具測試結果
3. Notion integration 設定截圖
4. 具體錯誤訊息

---

**最後更新**: 2024年7月26日
**狀態**: 等待 API Token 更新
**預計解決時間**: API Token 更新後 5-10 分鐘