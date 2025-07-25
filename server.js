#!/usr/bin/env node

/**
 * Tanawat Order API 伺服器啟動腳本
 * 確保使用 .env 配置啟動
 */

// 檢查 .env 檔案
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ 找不到 .env 檔案！');
    console.log('📝 請確保 .env 檔案存在於專案根目錄');
    process.exit(1);
}

// 載入環境變數
require('dotenv').config();

// 驗證必要的環境變數
const requiredEnvVars = [
    'NOTION_API_KEY',
    'MENU_DB_ID'
];

console.log('🔍 檢查環境變數...');
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ 缺少必要的環境變數: ${envVar}`);
        process.exit(1);
    }
    console.log(`✅ ${envVar}: ${process.env[envVar].substring(0, 10)}...`);
}

// 顯示配置資訊
console.log('\n📋 伺服器配置:');
console.log(`   🏢 餐廳名稱: ${process.env.RESTAURANT_NAME || 'Tanawat Restaurant'}`);
console.log(`   🌍 時區: ${process.env.RESTAURANT_TIMEZONE || 'Asia/Taipei'}`);
console.log(`   🚀 端口: ${process.env.PORT || 3000}`);
console.log(`   📊 環境: ${process.env.NODE_ENV || 'development'}`);

console.log('\n🗃️ 資料庫 ID:');
console.log(`   📋 菜單: ${process.env.MENU_DB_ID}`);
console.log(`   📝 訂單: ${process.env.ORDERS_DB_ID || '未設定'}`);
console.log(`   🪑 桌位: ${process.env.TABLES_DB_ID || '未設定'}`);
console.log(`   📅 訂位: ${process.env.RESERVATIONS_DB_ID || '未設定'}`);
console.log(`   👥 員工: ${process.env.STAFF_DB_ID || '未設定'}`);

console.log('\n🚀 啟動伺服器...\n');

// 啟動主伺服器
require('./proxy-server.js');
