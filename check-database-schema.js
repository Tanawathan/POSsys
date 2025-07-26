// 檢查 Notion 資料庫結構腳本
const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function checkDatabaseSchema() {
    try {
        console.log('🔍 檢查資料庫結構...');

        // 檢查桌況資料庫
        console.log('\n📋 桌況資料庫結構:');
        const tablesDb = await notion.databases.retrieve({
            database_id: process.env.TABLES_DB_ID
        });
        
        console.log('桌況資料庫欄位:');
        Object.keys(tablesDb.properties).forEach(key => {
            const prop = tablesDb.properties[key];
            console.log(`- ${key}: ${prop.type}`);
        });

        // 檢查訂單資料庫
        console.log('\n📝 訂單資料庫結構:');
        const ordersDb = await notion.databases.retrieve({
            database_id: process.env.ORDERS_DB_ID
        });
        
        console.log('訂單資料庫欄位:');
        Object.keys(ordersDb.properties).forEach(key => {
            const prop = ordersDb.properties[key];
            console.log(`- ${key}: ${prop.type}`);
        });

    } catch (error) {
        console.error('❌ 檢查資料庫結構失敗:', error);
    }
}

// 執行腳本
checkDatabaseSchema();
