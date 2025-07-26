// 環境配置 - 在 Netlify 部署時由環境變數注入
window.ENV_CONFIG = {
    NOTION_API_KEY: '{{NOTION_API_KEY}}',
    MENU_DATABASE_ID: '{{MENU_DATABASE_ID}}',
    ORDERS_DB_ID: '{{ORDERS_DB_ID}}',
    TABLES_DB_ID: '{{TABLES_DB_ID}}', 
    RESERVATIONS_DB_ID: '{{RESERVATIONS_DB_ID}}',
    STAFF_DB_ID: '{{STAFF_DB_ID}}',
    MAKE_MENU_WEBHOOK: '{{MAKE_MENU_WEBHOOK}}',
    MAKE_ORDER_WEBHOOK: '{{MAKE_ORDER_WEBHOOK}}',
    MAKE_TABLE_WEBHOOK: '{{MAKE_TABLE_WEBHOOK}}',
    MAKE_KDS_WEBHOOK: '{{MAKE_KDS_WEBHOOK}}',
    MAKE_CHECKOUT_WEBHOOK: '{{MAKE_CHECKOUT_WEBHOOK}}',
    RESTAURANT_NAME: '{{RESTAURANT_NAME}}',
    NODE_ENV: '{{NODE_ENV}}',
    PORT: '{{PORT}}',
    SYNC_METHOD: '{{SYNC_METHOD}}',
    SYNC_INTERVAL: '{{SYNC_INTERVAL}}',
    RESTAURANT_TIMEZONE: '{{RESTAURANT_TIMEZONE}}'
};

// 如果在 Netlify 環境中，替換 placeholder 為實際值
if (typeof process !== 'undefined' && process.env) {
    Object.keys(window.ENV_CONFIG).forEach(key => {
        if (process.env[key]) {
            window.ENV_CONFIG[key] = process.env[key];
        }
    });
}
