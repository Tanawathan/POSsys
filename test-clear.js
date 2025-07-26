/**
 * 測試清空 Notion 資料庫功能
 */
const fetch = require('node-fetch');

const NOTION_API_KEY = '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';
const NOTION_API_VERSION = '2022-06-28';
const MENU_DATABASE_ID = '23afd5adc30b80c58355fd93d05c66d6';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

async function clearNotionDatabase() {
    try {
        console.log('🗑️ 開始清空 Notion 資料庫...');
        
        // 查詢所有頁面
        console.log('📋 查詢資料庫中的所有項目...');
        const queryResponse = await fetch(`${NOTION_BASE_URL}/databases/${MENU_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_API_VERSION
            },
            body: JSON.stringify({ page_size: 100 })
        });
        
        if (!queryResponse.ok) {
            const errorText = await queryResponse.text();
            throw new Error(`查詢資料庫失敗: ${queryResponse.status} - ${errorText}`);
        }
        
        const queryResult = await queryResponse.json();
        console.log(`📊 找到 ${queryResult.results.length} 筆資料`);
        
        if (queryResult.results.length === 0) {
            console.log('✅ 資料庫已經是空的');
            return;
        }
        
        let deletedCount = 0;
        
        // 歸檔所有頁面
        for (const page of queryResult.results) {
            try {
                console.log(`🗑️ 正在刪除: ${page.properties?.名稱?.title?.[0]?.text?.content || page.id}`);
                
                const deleteResponse = await fetch(`${NOTION_BASE_URL}/pages/${page.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${NOTION_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Notion-Version': NOTION_API_VERSION
                    },
                    body: JSON.stringify({ archived: true })
                });
                
                if (deleteResponse.ok) {
                    deletedCount++;
                    console.log(`  ✅ 成功`);
                } else {
                    const errorText = await deleteResponse.text();
                    console.log(`  ❌ 失敗: ${deleteResponse.status} - ${errorText}`);
                }
                
                // 避免 API 限制
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.log(`  ❌ 錯誤: ${error.message}`);
            }
        }
        
        console.log(`✅ 清空完成！成功刪除 ${deletedCount} 筆資料`);
        return { success: true, deletedCount };
        
    } catch (error) {
        console.error('❌ 清空失敗:', error.message);
        return { success: false, error: error.message };
    }
}

// 執行清空
clearNotionDatabase();
