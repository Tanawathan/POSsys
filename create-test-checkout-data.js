// 測試結帳系統的資料創建腳本
const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function createTestData() {
    try {
        console.log('🔧 開始創建測試資料...');

        // 1. 創建測試桌況
        console.log('📋 創建測試桌況...');
        const tableData = {
            parent: { database_id: process.env.TABLES_DB_ID },
            properties: {
                '桌號': {
                    title: [{ text: { content: 'A1' } }]
                },
                '狀態': {
                    select: { name: '使用中' }
                },
                '容納人數': {
                    number: 4
                },
                '目前人數': {
                    number: 2
                },
                '目前訂單': {
                    rich_text: [{ text: { content: 'A1-20250725-1200' } }]
                },
                '目前消費': {
                    number: 350
                }
            }
        };

        const table = await notion.pages.create(tableData);
        console.log('✅ 測試桌況已創建:', table.id);

        // 2. 創建測試訂單
        console.log('📝 創建測試訂單...');
        const orderData = {
            parent: { database_id: process.env.ORDERS_DB_ID },
            properties: {
                '訂單編號': {
                    title: [{ text: { content: 'A1-20250725-1200' } }]
                },
                '桌號': {
                    rich_text: [{ text: { content: 'A1' } }]
                },
                '訂單項目': {
                    rich_text: [{ text: { content: JSON.stringify([
                        { name: '炒河粉', price: 200, quantity: 1 },
                        { name: '泰式奶茶', price: 150, quantity: 1 }
                    ]) } }]
                },
                '狀態': {
                    select: { name: '已送達' }
                },
                '總金額': {
                    number: 350
                },
                '建立時間': {
                    date: {
                        start: new Date().toISOString()
                    }
                },
                '用餐人數': {
                    number: 2
                },
                '付款狀態': {
                    select: { name: '未付款' }
                }
            }
        };

        const order = await notion.pages.create(orderData);
        console.log('✅ 測試訂單已創建:', order.id);

        console.log('🎉 測試資料創建完成！');
    } catch (error) {
        console.error('❌ 創建測試資料失敗:', error);
    }
}

// 執行腳本
createTestData();
