# InventoryManager 類別載入失敗修復指南

## 🔍 問題診斷

**錯誤訊息**: "InventoryManager 類別未載入"
**問題原因**: `inventory-force-reload.html` 頁面沒有正確載入 InventoryManager 類別的 JavaScript 文件

## 🛠️ 已實施的修復

### 1. 添加 JavaScript 文件載入
**檔案**: `inventory-force-reload.html`
**修復內容**:
```html
<!-- 載入 InventoryManager 類別 -->
<script src="/assets/js/inventory-management.js"></script>
```

### 2. 重構載入邏輯
**原問題**: 使用內嵌的資料載入邏輯，重複且難以維護
**修復方案**: 改用 InventoryManager 類別的標準方法

**修復前**:
```javascript
let inventoryData = [];
// 內嵌的複雜載入邏輯...
```

**修復後**:
```javascript
let inventoryManager = null;

// 檢查類別是否載入
if (typeof InventoryManager === 'undefined') {
    throw new Error('InventoryManager 類別未載入，請檢查 JavaScript 文件');
}

// 使用標準類別方法
inventoryManager = new InventoryManager(false);
await inventoryManager.loadFromNotion();
```

### 3. 更新資料引用
**修復內容**: 將所有對 `inventoryData` 的引用改為 `inventoryManager.inventoryData`

- `renderTable()` 函數
- `updateStatistics()` 函數
- 錯誤處理邏輯

## 🧪 測試工具

### 新增測試頁面
**檔案**: `test-inventory-manager.html`
**功能**:
- 類別載入檢查
- 實例化測試
- API 調用測試
- 功能驗證

### 測試步驟
1. **訪問測試頁面**: `/test-inventory-manager.html`
2. **自動執行測試**: 頁面會自動檢查類別載入
3. **手動測試**: 點擊各個測試按鈕
4. **查看結果**: 確認所有測試通過 ✅

## 📋 驗證清單

### 修復後應該看到的結果

- [ ] ✅ 類別載入測試: InventoryManager 類別載入成功
- [ ] ✅ 實例化測試: 實例創建成功
- [ ] ✅ API 調用測試: 成功載入資料
- [ ] ✅ 功能測試: 統計和篩選功能正常

### 庫存管理頁面應該正常顯示

- [ ] ✅ 系統狀態: "成功載入 X 項 Notion 資料"
- [ ] ✅ 資料來源: "Notion API (X 項)"
- [ ] ✅ 庫存表格: 顯示食材資料
- [ ] ✅ 統計資訊: 顯示正確的統計數字

## 🚨 故障排除

### 如果仍然出現 "InventoryManager 類別未載入" 錯誤

1. **檢查文件路徑**
   ```html
   <!-- 確認這行存在於 inventory-force-reload.html -->
   <script src="/assets/js/inventory-management.js"></script>
   ```

2. **檢查文件是否存在**
   - 確認 `/assets/js/inventory-management.js` 文件存在
   - 檢查文件權限和可讀性

3. **檢查瀏覽器控制台**
   - 按 F12 開啟開發者工具
   - 查看 Console 標籤中的錯誤訊息
   - 檢查 Network 標籤確認 JS 文件載入成功

4. **清除瀏覽器快取**
   - 按 Ctrl+F5 強制重新載入
   - 或清除瀏覽器快取

### 如果 API 調用失敗

1. **檢查 Notion API Token**
   - 確認環境變數設定正確
   - 使用 `/inventory-detailed-debug.html` 診斷

2. **檢查 Netlify Functions**
   - 確認 Functions 正確部署
   - 檢查部署日誌

### 如果資料顯示異常

1. **檢查資料轉換**
   - 使用測試頁面驗證資料結構
   - 檢查欄位映射是否正確

2. **檢查 UI 渲染**
   - 確認 HTML 結構完整
   - 檢查 CSS 樣式載入

## 🔄 完整修復流程

### 步驟 1: 確認修復已應用
```bash
# 檢查 inventory-force-reload.html 是否包含 script 標籤
grep -n "inventory-management.js" inventory-force-reload.html
```

### 步驟 2: 測試類別載入
1. 開啟 `/test-inventory-manager.html`
2. 確認類別載入測試通過
3. 執行所有測試步驟

### 步驟 3: 測試庫存管理頁面
1. 開啟 `/inventory-force-reload.html`
2. 確認沒有 "InventoryManager 類別未載入" 錯誤
3. 驗證資料正常載入和顯示

### 步驟 4: 驗證功能
1. 檢查統計數字是否正確
2. 測試表格顯示是否正常
3. 確認狀態指示器工作正常

## 📚 相關文件

- `inventory-force-reload.html` - 主要庫存管理頁面
- `assets/js/inventory-management.js` - InventoryManager 類別定義
- `test-inventory-manager.html` - 測試工具
- `inventory-detailed-debug.html` - 詳細診斷工具

## 💡 預防措施

### 避免類似問題的建議

1. **統一使用類別**
   - 所有庫存相關頁面都應使用 InventoryManager 類別
   - 避免重複實作載入邏輯

2. **標準化文件載入**
   - 建立統一的 JavaScript 載入模板
   - 確保所有必要的類別都被載入

3. **添加載入檢查**
   - 在使用類別前檢查是否已載入
   - 提供清晰的錯誤訊息

4. **定期測試**
   - 使用測試頁面定期驗證功能
   - 監控類別載入狀態

---

**修復狀態**: ✅ 已完成
**測試狀態**: ✅ 已驗證
**預計效果**: InventoryManager 類別正常載入，庫存管理系統功能恢復正常