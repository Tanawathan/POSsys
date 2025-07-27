// 驗證 Notion 資料庫 ID 工具
require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 測試用的資料庫 ID（從手機系統）
const DATABASE_IDS = {
    tables: '23afd5adc30b80fe86c9e086a54a0d61',
    menu: '23afd5adc30b80a2818ffeb6b2d22265',
    orders: '23afd5adc30b80c39e71d1a640ccfb5d'
};

async function verifyDatabase(name, id) {
    try {
        console.log(`\n🔍 驗證 ${name} 資料庫 (ID: ${id})...`);
        
        // 嘗試查詢資料庫
        const response = await notion.databases.query({
            database_id: id,
            page_size: 1
        });
        
        console.log(`✅ ${name} 資料庫可以存取`);
        console.log(`📊 找到 ${response.results.length} 筆記錄`);
        
        // 檢查資料庫屬性
        if (response.results.length > 0) {
            const properties = Object.keys(response.results[0].properties);
            console.log(`📋 資料庫欄位: ${properties.join(', ')}`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ ${name} 資料庫無法存取`);
        console.log(`錯誤: ${error.code} - ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🔧 驗證 Notion 資料庫連接...');
    console.log(`API Key: ${process.env.NOTION_API_KEY ? '已設定' : '未設定'}`);
    
    if (!process.env.NOTION_API_KEY) {
        console.log('❌ 請確認 NOTION_API_KEY 環境變數已設定');
        process.exit(1);
    }
    
    const results = {};
    
    for (const [name, id] of Object.entries(DATABASE_IDS)) {
        results[name] = await verifyDatabase(name, id);
    }
    
    console.log('\n📈 驗證結果總結:');
    for (const [name, success] of Object.entries(results)) {
        console.log(`${success ? '✅' : '❌'} ${name}: ${success ? '可存取' : '無法存取'}`);
    }
    
    if (Object.values(results).every(r => r)) {
        console.log('\n🎉 所有資料庫都可以正常存取！');
    } else {
        console.log('\n⚠️  有部分資料庫無法存取，請檢查：');
        console.log('1. 資料庫 ID 是否正確');
        console.log('2. Notion integration 是否被邀請到該資料庫');
        console.log('3. Integration 是否有適當的權限');
    }
}

main().catch(console.error);
