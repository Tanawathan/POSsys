#!/usr/bin/env node

/**
 * 命令列 CSV 同步工具
 * 可以直接在終端機執行 CSV 到 Notion 的同步
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// 設定
const CSV_FILE_PATH = path.join(__dirname, '../data/最終菜色.csv');
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const MENU_DATABASE_ID = process.env.MENU_DB_ID || '23afd5adc30b80c58355fd93d05c66d6';

console.log('🍽️  Tanawat Restaurant CSV 同步工具');
console.log('=====================================\n');

// 檢查設定
if (!NOTION_API_KEY) {
    console.error('❌ 錯誤：找不到 NOTION_API_KEY 環境變數');
    console.log('請確認 .env 檔案中已設定正確的 API Key');
    process.exit(1);
}

if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ 錯誤：找不到 CSV 檔案: ${CSV_FILE_PATH}`);
    process.exit(1);
}

console.log('✅ 環境檢查通過');
console.log(`📄 CSV 檔案: ${CSV_FILE_PATH}`);
console.log(`🔑 API Key: ${NOTION_API_KEY.substring(0, 10)}...`);
console.log(`🗃️  資料庫 ID: ${MENU_DATABASE_ID}`);
console.log('');

// 引入同步模組
const { syncCSVToNotion } = require('./sync-csv-to-notion');

// 詢問使用者確認
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('🤔 確定要開始同步 CSV 資料到 Notion 嗎？ (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🚀 開始同步...\n');
        
        syncCSVToNotion()
            .then(() => {
                console.log('\n🎉 同步完成！');
                rl.close();
            })
            .catch((error) => {
                console.error('\n❌ 同步失敗:', error);
                rl.close();
                process.exit(1);
            });
    } else {
        console.log('取消同步');
        rl.close();
    }
});
