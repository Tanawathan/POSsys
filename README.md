# Tanawat Restaurant 管理系統

## 📁 資料夾結構

```
tanawat-order-api-main/
├── 📁 assets/                  # 靜態資源
│   ├── css/                   # 樣式檔案
│   │   ├── pos-enhanced.css   # 舊版樣式
│   │   └── unified-design.css # 統一設計系統
│   ├── js/                    # JavaScript 檔案
│   └── icons/                 # 圖示檔案
│
├── 📁 pages/                   # 頁面檔案
│   ├── management/            # 管理系統頁面
│   │   ├── dashboard.html     # 主控台
│   │   ├── order-management.html      # 訂單管理
│   │   ├── menu-management.html       # 菜單管理
│   │   ├── table-management.html      # 桌況管理
│   │   ├── purchase-management.html   # 採購管理
│   │   ├── recipe-management.html     # 食譜管理
│   │   ├── reservation-management.html # 訂位管理
│   │   ├── inventory-management.html  # 庫存管理
│   │   ├── supplier-management.html   # 供應商管理
│   │   └── cost-analysis.html         # 成本分析
│   │
│   ├── customer/              # 客戶端頁面
│   │   ├── customer-view.html # 客戶點餐介面
│   │   ├── checkout.html      # 結帳頁面
│   │   └── kds.html          # 廚房顯示系統
│   │
│   ├── dashboard-simple.html  # 簡化版主控台
│   ├── main-dashboard.html    # 主儀表板
│   ├── template.html          # 頁面模板
│   └── test.html             # 測試頁面
│
├── 📁 data/                    # 資料檔案
│   ├── 半成品_*.csv           # 半成品相關資料
│   ├── 最終菜色*.csv          # 菜色資料
│   ├── 採購*.csv              # 採購資料
│   ├── 桌況管理.csv           # 桌況資料
│   ├── 訂位紀錄.csv           # 訂位資料
│   ├── 訂單總覽.csv           # 訂單資料
│   ├── 食材庫*.csv            # 食材庫存資料
│   └── 耗損調整紀錄.csv       # 耗損記錄
│
├── 📁 docs/                    # 文件檔案
│   ├── README-系統概覽.md     # 系統概覽說明
│   └── 庫存管理系統說明.md     # 庫存管理說明
│
├── 📁 config/                  # 設定檔案
│   ├── config.js              # 主要設定檔
│   ├── manifest.json          # PWA 設定
│   ├── netlify.toml           # Netlify 部署設定
│   ├── _redirects             # 重新導向規則
│   ├── .env.example           # 環境變數範例
│   ├── requirements.txt       # Python 依賴
│   └── sw.js                  # Service Worker
│
├── 📁 .vscode/                 # VS Code 設定
│
├── index.html                  # 主頁面
└── tanawat-order-api-main-v1.0.code-workspace # 工作區設定
```

## 🚀 快速開始

1. **開啟主頁面**: 直接開啟 `index.html`
2. **管理系統**: 前往 `pages/management/dashboard.html`
3. **客戶端**: 前往 `pages/customer/customer-view.html`

## 📊 系統模組

### 管理系統模組
- **主控台**: 系統總覽和快速操作
- **訂單管理**: 訂單處理和狀態追蹤
- **菜單管理**: 菜品管理和價格設定
- **桌況管理**: 餐桌狀態和佈局管理
- **採購管理**: 採購計劃和供應商管理
- **食譜管理**: 菜品食譜和成本控制
- **訂位管理**: 預約管理和座位安排
- **庫存管理**: 庫存追蹤和補貨提醒
- **成本分析**: 營運成本分析和報表

### 客戶端模組
- **點餐系統**: 客戶自助點餐界面
- **結帳系統**: 訂單確認和付款
- **廚房顯示**: 廚房訂單管理系統

## 🎨 設計系統

使用統一設計系統 (`assets/css/unified-design.css`)，包含：
- 統一的色彩系統
- 標準化的元件庫
- 響應式設計支援
- 現代化的視覺風格

## 📱 技術特色

- **響應式設計**: 支援桌面、平板、手機
- **PWA 支援**: 可安裝為應用程式
- **實時更新**: 即時資料同步
- **模組化架構**: 易於維護和擴展

## 🔧 開發說明

- **主要技術**: HTML5, CSS3, JavaScript (ES6+)
- **設計框架**: 自製統一設計系統
- **資料格式**: CSV 檔案儲存
- **部署平台**: Netlify (支援)

---

**開發者**: GitHub Copilot  
**最後更新**: 2025年7月25日  
**版本**: v1.0
