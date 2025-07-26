# 🔗 Notion API 整合指南

## 📋 概覽

本指南將協助您設定 Notion API，讓餐廳管理系統直接與您的 Notion 工作區整合，無需透過 Make.com 等中間服務。

## 🎯 優勢

使用 Notion API 的優勢：

- ⚡ **直接整合** - 無中間層，更快更穩定
- 💰 **成本效益** - 無需額外的自動化服務費用
- 🔒 **資料安全** - 直接與 Notion 通訊，無第三方經手
- 📊 **豐富功能** - 利用 Notion 的強大資料庫和協作功能
- 🔄 **即時同步** - 資料即時雙向同步

## 🚀 設定步驟

### 步驟 1: 建立 Notion Integration

1. **前往 Notion Developers**
   - 開啟 [https://developers.notion.com/](https://developers.notion.com/)
   - 使用您的 Notion 帳號登入

2. **建立新的 Integration**
   - 點擊 "My integrations"
   - 點擊 "New integration"
   - 填入以下資訊：
     - **Name**: `Tanawat Restaurant System`
     - **Logo**: 可選擇上傳餐廳 Logo
     - **Associated workspace**: 選擇您的工作區

3. **取得 API Token**
   - 建立完成後，複製 **Internal Integration Token**
   - 格式：`secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **重要**：妥善保管此 Token，不要分享給他人

### 步驟 2: 建立 Notion 資料庫

為系統的每個資料表建立對應的 Notion 資料庫：

#### 🍽️ 菜單資料庫 (Menu Database)

建立新資料庫，包含以下屬性：

| 屬性名稱 | 屬性類型 | 說明 |
|---------|---------|------|
| 名稱 | Title | 菜品名稱 (主要標題) |
| 分類 | Text | 菜品分類 (如：主菜、湯品、飲料) |
| 價格 | Number | 價格 (格式：Number, 不含貨幣符號) |
| 描述 | Text | 菜品描述 |
| 供應狀態 | Checkbox | 是否供應中 |

#### 📝 訂單資料庫 (Orders Database)

| 屬性名稱 | 屬性類型 | 說明 |
|---------|---------|------|
| 桌號 | Title | 桌號 (主要標題) |
| 狀態 | Select | 選項：進行中、已完成、已取消 |
| 總金額 | Number | 訂單總金額 |
| 訂單項目 | Text | JSON 格式的訂單明細 |
| 建立時間 | Date | 訂單建立時間 |

#### 🪑 桌況資料庫 (Tables Database)

| 屬性名稱 | 屬性類型 | 說明 |
|---------|---------|------|
| 桌號 | Title | 桌號 (主要標題) |
| 狀態 | Select | 選項：空桌、已佔用、清潔中 |
| 容納人數 | Number | 可容納的人數 |
| 位置 | Text | 桌位位置描述 |

#### 📅 預約資料庫 (Reservations Database)

| 屬性名稱 | 屬性類型 | 說明 |
|---------|---------|------|
| 客戶姓名 | Title | 預約人姓名 |
| 聯絡電話 | Phone | 聯絡電話 |
| 預約日期 | Date | 預約日期 |
| 預約時間 | Text | 預約時間 |
| 人數 | Number | 用餐人數 |
| 桌號 | Text | 指定桌號 |
| 狀態 | Select | 選項：已預約、已到達、已取消 |

#### 📦 庫存資料庫 (Inventory Database)

| 屬性名稱 | 屬性類型 | 說明 |
|---------|---------|------|
| 商品名稱 | Title | 庫存商品名稱 |
| 分類 | Text | 商品分類 |
| 目前庫存 | Number | 目前庫存數量 |
| 最低庫存 | Number | 最低庫存警戒線 |
| 單位 | Text | 計量單位 (如：kg、個、瓶) |

### 步驟 3: 設定資料庫權限

對每個資料庫進行權限設定：

1. **開啟資料庫頁面**
2. **點擊右上角的 "..." 選單**
3. **選擇 "Add connections"**
4. **搜尋並選擇您的 Integration**
5. **確認權限設定**

### 步驟 4: 取得資料庫 ID

1. **開啟資料庫頁面**
2. **複製瀏覽器網址列中的 URL**
3. **從 URL 中提取 32 字元的資料庫 ID**

URL 格式：
```
https://www.notion.so/your-workspace/database-name-{DATABASE_ID}?v=view-id
```

範例：
```
https://www.notion.so/myworkspace/Menu-abc12345678901234567890123456789?v=def...
```
資料庫 ID：`abc12345678901234567890123456789`

### 步驟 5: 設定系統

編輯 `config/config.js` 檔案：

```javascript
const CONFIG = {
  production: {
    // Notion API 設定 (主要同步方式)
    notion: {
      apiKey: 'secret_your_integration_token_here', // 填入您的 Integration Token
      apiVersion: '2022-06-28',
      databaseIds: {
        menu: 'your_menu_database_id',              // 菜單資料庫 ID
        orders: 'your_orders_database_id',          // 訂單資料庫 ID
        tables: 'your_tables_database_id',          // 桌況資料庫 ID
        reservations: 'your_reservations_db_id',    // 預約資料庫 ID
        inventory: 'your_inventory_database_id',    // 庫存資料庫 ID
        purchases: 'your_purchases_database_id',    // 採購資料庫 ID
        recipes: 'your_recipes_database_id',        // 食譜資料庫 ID
        suppliers: 'your_suppliers_database_id'     // 供應商資料庫 ID
      }
    },
    
    // 同步方式設定
    syncMethod: 'notion', // 使用 Notion API 作為主要同步方式
    
    // ... 其他設定
  }
};
```

## 🧪 測試設定

設定完成後，使用測試頁面驗證：

1. **開啟測試頁面**
   ```
   pages/data-system-test.html
   ```

2. **檢查系統狀態**
   - 資料庫連線狀態
   - Notion API 連線狀態

3. **執行 Notion 同步測試**
   - 點擊「測試 Notion 同步」按鈕
   - 檢查是否成功建立測試資料

## 🔧 進階設定

### 混合同步模式

如果您想同時使用 Notion API 和 Make.com：

```javascript
syncMethod: 'both', // 同時使用兩種同步方式
```

### 僅備用 Make.com

如果暫時只想使用 Make.com：

```javascript
syncMethod: 'make', // 僅使用 Make.com webhooks
```

## 🚨 注意事項

### API 限制

- **請求頻率限制**: 每秒最多 3 個請求
- **請求大小限制**: 每個請求最大 1000 個物件
- **資料庫大小**: 無限制

### 安全建議

- ✅ 定期更換 Integration Token
- ✅ 僅給予必要的資料庫存取權限
- ✅ 不要在前端程式碼中硬編碼 Token
- ✅ 使用環境變數儲存敏感資訊

### 備份策略

- 🔄 系統會自動備份到 IndexedDB
- 📄 定期匯出 CSV 備份
- ☁️ Notion 本身也會保留資料歷史

## 🎉 完成！

設定完成後，您的餐廳管理系統將：

- 📊 自動同步資料到 Notion
- 🔄 支援雙向資料同步
- 📱 在 Notion 中即時查看營運資料
- 👥 支援團隊協作和資料分享
- 📈 利用 Notion 的強大功能進行資料分析

恭喜！您現在可以享受無縫的 Notion 整合體驗了！ 🚀
