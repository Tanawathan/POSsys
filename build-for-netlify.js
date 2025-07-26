const fs = require('fs');
const path = require('path');

console.log('🔧 開始 Netlify 構建處理...');

// 檢查環境變數是否存在（但不記錄值）
const requiredEnvVars = [
    'NOTION_API_KEY',
    'MENU_DATABASE_ID', 
    'ORDERS_DB_ID',
    'TABLES_DB_ID',
    'RESERVATIONS_DB_ID',
    'STAFF_DB_ID'
];

let missingVars = [];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.log('⚠️  警告：缺少以下環境變數：', missingVars.join(', '));
} else {
    console.log('✅ 所有必需的環境變數已設置');
}

// 創建環境配置文件
const envConfig = `// 自動生成的環境配置文件 - 由 Netlify 構建腳本創建
window.ENV_CONFIG = {
    NOTION_API_KEY: '${process.env.NOTION_API_KEY || ''}',
    MENU_DATABASE_ID: '${process.env.MENU_DATABASE_ID || ''}',
    ORDERS_DB_ID: '${process.env.ORDERS_DB_ID || ''}',
    TABLES_DB_ID: '${process.env.TABLES_DB_ID || ''}',
    RESERVATIONS_DB_ID: '${process.env.RESERVATIONS_DB_ID || ''}',
    STAFF_DB_ID: '${process.env.STAFF_DB_ID || ''}',
    MAKE_MENU_WEBHOOK: '${process.env.MAKE_MENU_WEBHOOK || ''}',
    MAKE_ORDER_WEBHOOK: '${process.env.MAKE_ORDER_WEBHOOK || ''}',
    MAKE_TABLE_WEBHOOK: '${process.env.MAKE_TABLE_WEBHOOK || ''}',
    MAKE_KDS_WEBHOOK: '${process.env.MAKE_KDS_WEBHOOK || ''}',
    MAKE_CHECKOUT_WEBHOOK: '${process.env.MAKE_CHECKOUT_WEBHOOK || ''}',
    RESTAURANT_NAME: '${process.env.RESTAURANT_NAME || ''}',
    NODE_ENV: '${process.env.NODE_ENV || 'production'}',
    SYNC_METHOD: '${process.env.SYNC_METHOD || 'notion'}',
    SYNC_INTERVAL: '${process.env.SYNC_INTERVAL || '30000'}',
    PORT: '${process.env.PORT || '3000'}',
    RESTAURANT_TIMEZONE: '${process.env.RESTAURANT_TIMEZONE || 'Asia/Taipei'}'
};

// 向後相容性 - 如果頁面期望某些全域變數
window.NOTION_API_KEY = window.ENV_CONFIG.NOTION_API_KEY;
window.MENU_DATABASE_ID = window.ENV_CONFIG.MENU_DATABASE_ID;
window.ORDERS_DB_ID = window.ENV_CONFIG.ORDERS_DB_ID;
window.TABLES_DB_ID = window.ENV_CONFIG.TABLES_DB_ID;
window.RESERVATIONS_DB_ID = window.ENV_CONFIG.RESERVATIONS_DB_ID;
window.STAFF_DB_ID = window.ENV_CONFIG.STAFF_DB_ID;
`;

// 確保 public 目錄存在
if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
}

// 寫入環境配置文件
fs.writeFileSync('public/env-config.js', envConfig);
console.log('✅ 環境配置文件已創建: public/env-config.js');

// 移除敏感文件（如果存在）
const filesToRemove = [
    '.env',
    'netlify-env-vars.txt',
    'production-records-db-config.json'
];

filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️  已移除: ${file}`);
    }
});

console.log('🎉 Netlify 構建處理完成!');
