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
    RESTAURANT_TIMEZONE: '${process.env.RESTAURANT_TIMEZONE || 'Asia/Taipei'}',
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
`;

// 確保 public 目錄存在
if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
}

// 寫入環境配置文件
fs.writeFileSync('public/env-config.js', envConfig);
console.log('✅ 環境配置文件已創建: public/env-config.js');

// 確保 Netlify Functions 目錄存在
if (!fs.existsSync('netlify/functions')) {
    fs.mkdirSync('netlify/functions', { recursive: true });
    console.log('✅ Netlify Functions 目錄已創建');
}

// 檢查 Netlify Function 是否存在
const functionPath = 'netlify/functions/notion-api.js';
if (fs.existsSync(functionPath)) {
    console.log('✅ Netlify Function 已存在: ' + functionPath);
} else {
    console.log('⚠️  警告：Netlify Function 不存在: ' + functionPath);
}

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

// 創建 API 配置文件給前端使用
const apiConfig = `// API 配置文件 - 用於前端 API 調用
window.API_CONFIG = {
    baseUrl: '/.netlify/functions/notion-api',
    endpoints: {
        health: '/.netlify/functions/notion-api/health',
        testNotion: '/.netlify/functions/notion-api/test-notion',
        databases: '/.netlify/functions/notion-api/databases',
        pages: '/.netlify/functions/notion-api/pages'
    },
    environment: 'netlify',
    version: '2.0.0'
};

// 向後相容性函數
window.getApiUrl = function(path) {
    if (path.startsWith('/')) {
        return '/.netlify/functions/notion-api' + path;
    }
    return '/.netlify/functions/notion-api/' + path;
};
`;

fs.writeFileSync('public/api-config.js', apiConfig);
console.log('✅ API 配置文件已創建: public/api-config.js');

console.log('🎉 Netlify 構建處理完成!');
console.log('\n📋 構建摘要:');
console.log('   • 環境配置文件已生成');
console.log('   • API 配置文件已生成');
console.log('   • Netlify Functions 目錄已確認');
console.log('   • 敏感文件已清理');
console.log('\n🚀 部署準備就緒!');
