// 直接同步腳本 - 繞過網頁前端
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const CSV_FILE_PATH = path.join(__dirname, 'data', '最終菜色.csv');
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_API_VERSION = '2022-06-28';
const MENU_DATABASE_ID = '23afd5adc30b80c58355fd93d05c66d6';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

console.log('🚀 直接CSV同步腳本');
console.log('==================');

// 解析CSV行
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// 轉換為Notion格式
function transformToNotionFormat(csvRow) {
    const properties = {};
    
    // 使用實際的Notion資料庫屬性名稱
    properties['名稱'] = {
        title: [{ text: { content: csvRow['餐點名稱'] || '' } }]
    };
    
    // 分類 - 使用選擇類型
    if (csvRow['餐點類型']) {
        // 映射到資料庫中存在的分類選項
        const categoryMap = {
            '主餐': '主食',
            '小點': '小菜', 
            '甜點': '甜點',
            '飲品': '飲品',
            '前菜': '開胃菜',
            '湯': '湯品',
            '沙拉': '沙拉'
        };
        
        const category = categoryMap[csvRow['餐點類型']] || '主食';
        properties['分類'] = {
            select: { name: category }
        };
    }
    
    // 價格
    if (csvRow['價格']) {
        properties['價格'] = {
            number: parseFloat(csvRow['價格']) || 0
        };
    }
    
    // 供應狀態
    properties['供應狀態'] = {
        checkbox: csvRow['無法供應'] !== 'Yes'
    };
    
    // 描述
    if (csvRow['餐點介紹']) {
        properties['描述'] = {
            rich_text: [{ text: { content: csvRow['餐點介紹'] } }]
        };
    }
    
    return {
        parent: { database_id: MENU_DATABASE_ID },
        properties
    };
}

// 主要同步函數
async function directSync() {
    try {
        // 1. 讀取CSV
        console.log('📄 讀取CSV檔案...');
        const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
        const lines = csvContent.trim().split('\n');
        const headers = parseCSVLine(lines[0]);
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }
        
        console.log(`✅ 成功解析 ${data.length} 筆資料`);
        
        // 2. 測試Notion連線
        console.log('🔗 測試Notion連線...');
        const testResponse = await fetch(`${NOTION_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_API_VERSION
            }
        });
        
        if (!testResponse.ok) {
            throw new Error('Notion API連線失敗');
        }
        
        console.log('✅ Notion連線正常');
        
        // 3. 開始同步
        console.log('🚀 開始同步...');
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            console.log(`\n${i + 1}/${data.length} 處理: ${item['餐點名稱']}`);
            
            try {
                const notionData = transformToNotionFormat(item);
                
                const response = await fetch(`${NOTION_BASE_URL}/pages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${NOTION_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Notion-Version': NOTION_API_VERSION
                    },
                    body: JSON.stringify(notionData)
                });
                
                if (response.ok) {
                    console.log(`  ✅ 成功`);
                    successCount++;
                } else {
                    const error = await response.json();
                    console.log(`  ❌ 失敗: ${error.message || response.statusText}`);
                    errorCount++;
                }
                
                // API限制
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.log(`  ❌ 錯誤: ${error.message}`);
                errorCount++;
            }
        }
        
        // 4. 結果統計
        console.log('\n🎉 同步完成！');
        console.log(`✅ 成功: ${successCount}`);
        console.log(`❌ 失敗: ${errorCount}`);
        console.log(`📊 總計: ${data.length}`);
        
    } catch (error) {
        console.error('❌ 同步失敗:', error.message);
    }
}

// 執行同步
directSync();
