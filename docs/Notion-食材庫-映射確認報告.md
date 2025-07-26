# Notion 食材庫 API 映射確認報告

## 📋 資料庫資訊
- **資料庫ID**: `237fd5adc30b808cbba3c03f8f2065fd`
- **資料庫名稱**: 食材庫
- **API 端點**: `/api/notion/databases/237fd5adc30b808cbba3c03f8f2065fd/query`
- **測試日期**: 2025年7月25日

## ✅ 欄位映射確認

### Notion 資料庫原始欄位 ➡️ 系統內部欄位

| Notion 欄位名稱 | 欄位類型 | 系統映射欄位 | 映射邏輯 |
|----------------|----------|-------------|----------|
| `品項ID` | title | `itemId` | 主要品項識別碼，作為 title 欄位 |
| `食材名稱` | rich_text | `name` | 食材的顯示名稱 |
| `供應商` | select | `supplier` | 供應商名稱 |
| `規格/單位` | rich_text | `specification` + `unit` | 同時提供規格資訊並解析單位 |
| `庫存量` | number | `stock` | 當前庫存數量 |
| `安全庫存量` | number | `safetyStock` | 安全庫存警戒線 |
| `進價` | number | `purchasePrice` | 採購價格 |
| `單位成本` | formula | `unitCost` | 計算後的單位成本 |
| `品項類別` | select | `category` | 食材分類 |
| `最後進貨日` | last_edited_time | `lastPurchase` | 最後進貨日期 |
| `狀態` | status | `notes` | 項目狀態資訊 |
| `總進貨量` | rollup | `totalPurchase` | 累計進貨量 |

## 🔄 單位處理邏輯

### 單位解析規則
```javascript
const specText = properties['規格/單位']?.rich_text?.[0]?.text?.content || '';
const unitMatch = specText.match(/(克|公斤|毫升|公升|顆|斤|包|瓶|罐)/);
const extractedUnit = unitMatch ? unitMatch[1] : '公克';
```

### 重量格式化規則
- **< 1000公克**: 顯示為 "XXX 公克"
- **≥ 1000公克**: 自動轉換為 "X.X 公斤"

## 📊 測試結果

### 成功案例測試
1. ✅ **檸檬葉乾** - 50公克庫存，泓潔供應商
2. ✅ **香茅乾** - 100公克庫存，泓潔供應商  
3. ✅ **肋條肉** - 0庫存（缺貨狀態），洋基供應商
4. ✅ **嫩精** - 300公克庫存，佳良行供應商
5. ✅ **玉米塊** - 6000公克庫存（顯示為6公斤），東莉供應商

### 庫存狀態邏輯
```javascript
function getStockStatus(stock, safetyStock) {
    if (stock === 0) return 'critical';      // 缺貨
    if (stock <= safetyStock) return 'low';   // 庫存偏低
    return 'safe';                            // 庫存充足
}
```

## 🔧 技術實現

### API 呼叫方式
```javascript
const response = await fetch('/api/notion/databases/237fd5adc30b808cbba3c03f8f2065fd/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
});
```

### 資料轉換流程
1. **API 呼叫** → 獲取 Notion 原始資料
2. **欄位映射** → 轉換為系統內部格式  
3. **單位解析** → 從規格欄位提取單位資訊
4. **重量格式化** → 智能顯示公克/公斤
5. **狀態計算** → 根據庫存量計算狀態
6. **UI 渲染** → 顯示在庫存管理界面

## 📁 相關檔案

- **主要邏輯**: `assets/js/inventory-management.js` (line 54-78)
- **測試頁面**: `pages/management/inventory-management.html`
- **映射測試**: `test-notion-mapping.html`
- **伺服器代理**: `server.js` (Notion API 代理)

## 🎯 結論

✅ **Notion API 食材庫映射完全成功**
- 所有必要欄位正確映射
- 重量單位智能轉換運作正常
- 庫存狀態判斷邏輯正確
- UI 顯示格式化完善

**系統現在可以正確從 Notion 食材庫載入資料並以使用者友善的格式顯示！** 🎉
