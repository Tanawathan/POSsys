// 檢查Notion資料庫架構
const fetch = require('node-fetch');
require('dotenv').config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const MENU_DATABASE_ID = '23afd5adc30b80c58355fd93d05c66d6';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

async function checkDatabaseSchema() {
    try {
        console.log('🔍 檢查Notion資料庫架構...');
        console.log('資料庫ID:', MENU_DATABASE_ID);
        
        const response = await fetch(`${NOTION_BASE_URL}/databases/${MENU_DATABASE_ID}`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('❌ 無法存取資料庫:', error);
            return;
        }
        
        const database = await response.json();
        
        console.log('\n📊 資料庫資訊:');
        console.log('標題:', database.title[0]?.plain_text || '無標題');
        console.log('建立時間:', database.created_time);
        console.log('最後編輯:', database.last_edited_time);
        
        console.log('\n📋 屬性列表:');
        const properties = database.properties;
        
        Object.keys(properties).forEach(key => {
            const prop = properties[key];
            console.log(`- ${key}: ${prop.type} ${prop.id}`);
            
            if (prop.type === 'select' && prop.select?.options) {
                console.log(`  選項: ${prop.select.options.map(opt => opt.name).join(', ')}`);
            }
            
            if (prop.type === 'multi_select' && prop.multi_select?.options) {
                console.log(`  多選項: ${prop.multi_select.options.map(opt => opt.name).join(', ')}`);
            }
        });
        
        console.log('\n💡 建議的屬性對應:');
        const csvFields = ['餐點名稱', '餐點類型', '價格', '成本', '庫存量', '供應狀態', '餐點介紹'];
        
        csvFields.forEach(field => {
            const matchingProp = Object.keys(properties).find(key => 
                key.includes(field) || 
                key.toLowerCase().includes(field.toLowerCase()) ||
                (field === '餐點名稱' && properties[key].type === 'title')
            );
            
            if (matchingProp) {
                console.log(`✅ ${field} → ${matchingProp} (${properties[matchingProp].type})`);
            } else {
                console.log(`❌ ${field} → 未找到對應屬性`);
            }
        });
        
    } catch (error) {
        console.error('❌ 檢查資料庫架構失敗:', error.message);
    }
}

checkDatabaseSchema();
