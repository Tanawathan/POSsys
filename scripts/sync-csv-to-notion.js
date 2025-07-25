/**
 * CSV 資料同步到 Notion 腳本
 * 將最終菜色.csv 資料同步到 Notion 菜單資料庫
 */

// 引入必要的模組
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// 設定
const CSV_FILE_PATH = path.join(__dirname, '../data/最終菜色.csv');
const NOTION_API_KEY = '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';
const NOTION_API_VERSION = '2022-06-28';
const MENU_DATABASE_ID = '23afd5adc30b80c58355fd93d05c66d6';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

/**
 * 解析 CSV 檔案
 */
function parseCSV(filePath) {
    try {
        const csvContent = fs.readFileSync(filePath, 'utf-8');
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',');
        
        console.log('📋 CSV 標題欄位:');
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. ${header}`);
        });
        
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
        
        console.log(`✅ 成功解析 ${data.length} 筆菜單資料`);
        return data;
    } catch (error) {
        console.error('❌ CSV 解析失敗:', error);
        return [];
    }
}

/**
 * 解析 CSV 行（處理逗號分隔和引號）
 */
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

/**
 * 將 CSV 資料轉換為 Notion 格式
 */
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

/**
 * 建立 Notion API 請求
 */
async function createNotionPage(pageData) {
    try {
        const response = await fetch(`${NOTION_BASE_URL}/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_API_VERSION
            },
            body: JSON.stringify(pageData)
        });
        
        if (response.ok) {
            const result = await response.json();
            return { success: true, data: result };
        } else {
            const error = await response.json();
            return { success: false, error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 查詢現有的 Notion 資料庫資料
 */
async function queryNotionDatabase() {
    try {
        const response = await fetch(`${NOTION_BASE_URL}/databases/${MENU_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_API_VERSION
            },
            body: JSON.stringify({
                page_size: 100
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.results;
        } else {
            console.error('查詢 Notion 資料庫失敗:', await response.json());
            return [];
        }
    } catch (error) {
        console.error('查詢 Notion 資料庫錯誤:', error);
        return [];
    }
}

/**
 * 主要同步函數
 */
async function syncCSVToNotion() {
    console.log('🚀 開始 CSV 到 Notion 同步程序...\n');
    
    // 1. 解析 CSV 檔案
    console.log('📄 讀取 CSV 檔案...');
    const csvData = parseCSV(CSV_FILE_PATH);
    
    if (csvData.length === 0) {
        console.log('❌ 沒有資料可同步');
        return;
    }
    
    // 2. 查詢現有 Notion 資料
    console.log('\n🔍 查詢現有 Notion 資料...');
    const existingPages = await queryNotionDatabase();
    console.log(`📊 現有 Notion 資料: ${existingPages.length} 筆`);
    
    // 3. 批次同步資料
    console.log('\n🔄 開始同步資料到 Notion...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const menuName = row['餐點名稱'];
        
        console.log(`\n${i + 1}/${csvData.length} 處理: ${menuName}`);
        
        try {
            // 轉換為 Notion 格式
            const notionData = transformToNotionFormat(row);
            
            // 建立 Notion 頁面
            const result = await createNotionPage(notionData);
            
            if (result.success) {
                console.log(`  ✅ 同步成功`);
                successCount++;
            } else {
                console.log(`  ❌ 同步失敗:`, result.error);
                errors.push({ menu: menuName, error: result.error });
                errorCount++;
            }
            
            // API 限制：避免過於頻繁的請求
            if (i < csvData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
        } catch (error) {
            console.log(`  ❌ 處理錯誤:`, error);
            errors.push({ menu: menuName, error: error.message });
            errorCount++;
        }
    }
    
    // 4. 顯示結果
    console.log('\n📊 同步結果統計:');
    console.log(`  ✅ 成功: ${successCount} 筆`);
    console.log(`  ❌ 失敗: ${errorCount} 筆`);
    console.log(`  📄 總計: ${csvData.length} 筆`);
    
    if (errors.length > 0) {
        console.log('\n❌ 錯誤詳情:');
        errors.forEach((err, index) => {
            console.log(`  ${index + 1}. ${err.menu}:`);
            console.log(`     ${JSON.stringify(err.error, null, 2)}`);
        });
    }
    
    console.log('\n🎉 CSV 到 Notion 同步程序完成！');
}

// 檢查是否作為主程序執行
if (require.main === module) {
    syncCSVToNotion().catch(console.error);
}

module.exports = {
    syncCSVToNotion,
    parseCSV,
    transformToNotionFormat
};
