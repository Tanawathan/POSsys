#!/bin/bash

# Netlify 構建腳本 - 處理環境變數注入

echo "🔧 開始 Netlify 構建處理..."

# 創建配置文件，將環境變數注入到前端可用的 JavaScript 配置中
cat > public/env-config.js << EOF
// 自動生成的環境配置文件 - 由 Netlify 構建腳本創建
window.ENV_CONFIG = {
    NOTION_API_KEY: '${NOTION_API_KEY}',
    MENU_DATABASE_ID: '${MENU_DATABASE_ID}',
    ORDERS_DB_ID: '${ORDERS_DB_ID}',
    TABLES_DB_ID: '${TABLES_DB_ID}',
    RESERVATIONS_DB_ID: '${RESERVATIONS_DB_ID}',
    STAFF_DB_ID: '${STAFF_DB_ID}',
    MAKE_MENU_WEBHOOK: '${MAKE_MENU_WEBHOOK}',
    MAKE_ORDER_WEBHOOK: '${MAKE_ORDER_WEBHOOK}',
    MAKE_TABLE_WEBHOOK: '${MAKE_TABLE_WEBHOOK}',
    MAKE_KDS_WEBHOOK: '${MAKE_KDS_WEBHOOK}',
    MAKE_CHECKOUT_WEBHOOK: '${MAKE_CHECKOUT_WEBHOOK}',
    RESTAURANT_NAME: '${RESTAURANT_NAME}',
    NODE_ENV: '${NODE_ENV}',
    SYNC_METHOD: '${SYNC_METHOD}',
    SYNC_INTERVAL: '${SYNC_INTERVAL}',
    RESTAURANT_TIMEZONE: '${RESTAURANT_TIMEZONE}'
};

// 向後相容性 - 如果頁面期望某些全域變數
window.NOTION_API_KEY = window.ENV_CONFIG.NOTION_API_KEY;
window.MENU_DATABASE_ID = window.ENV_CONFIG.MENU_DATABASE_ID;
window.ORDERS_DB_ID = window.ENV_CONFIG.ORDERS_DB_ID;
window.TABLES_DB_ID = window.ENV_CONFIG.TABLES_DB_ID;
window.RESERVATIONS_DB_ID = window.ENV_CONFIG.RESERVATIONS_DB_ID;
window.STAFF_DB_ID = window.ENV_CONFIG.STAFF_DB_ID;
EOF

echo "✅ 環境配置文件已創建: public/env-config.js"

# 移除任何包含敏感資訊的檔案，避免它們被包含在部署中
rm -f .env
rm -f netlify-env-vars.txt
rm -f production-records-db-config.json

echo "🗑️  已移除包含敏感資訊的檔案"

echo "🎉 Netlify 構建處理完成!"
