// 自動生成的環境配置文件 - 由 Netlify 構建腳本創建
window.ENV_CONFIG = {
    NOTION_API_KEY: '',
    MENU_DATABASE_ID: '',
    ORDERS_DB_ID: '',
    TABLES_DB_ID: '',
    RESERVATIONS_DB_ID: '',
    STAFF_DB_ID: '',
    MAKE_MENU_WEBHOOK: '',
    MAKE_ORDER_WEBHOOK: '',
    MAKE_TABLE_WEBHOOK: '',
    MAKE_KDS_WEBHOOK: '',
    MAKE_CHECKOUT_WEBHOOK: '',
    RESTAURANT_NAME: '',
    NODE_ENV: 'production',
    SYNC_METHOD: 'notion',
    SYNC_INTERVAL: '30000',
    PORT: '3000',
    RESTAURANT_TIMEZONE: 'Asia/Taipei',
    // Netlify 部署特定配置
    DEPLOYMENT_TYPE: 'netlify',
    API_BASE_URL: '/.netlify/functions/notion-api'
};

// 向後相容性 - 如果頁面期望某些全域變數
window.NOTION_API_KEY = window.ENV_CONFIG.NOTION_API_KEY;
window.MENU_DATABASE_ID = window.ENV_CONFIG.MENU_DATABASE_ID;
window.ORDERS_DB_ID = window.ENV_CONFIG.ORDERS_DB_ID;
window.TABLES_DB_ID = window.ENV_CONFIG.TABLES_DB_ID;
window.RESERVATIONS_DB_ID = window.ENV_CONFIG.RESERVATIONS_DB_ID;
window.STAFF_DB_ID = window.ENV_CONFIG.STAFF_DB_ID;

// API 端點配置
window.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
