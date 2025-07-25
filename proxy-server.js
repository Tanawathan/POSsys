const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Notion API 設定
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

// 從 .env 讀取資料庫 ID
const MENU_DATABASE_ID = process.env.MENU_DB_ID || '23afd5adc30b80c58355fd93d05c66d6';
const ORDERS_DATABASE_ID = process.env.ORDERS_DB_ID || '23afd5adc30b80c39e71d1a640ccfb5d';
const TABLES_DATABASE_ID = process.env.TABLES_DB_ID || '23afd5adc30b80fe86c9e086a54a0d61';
const RESERVATIONS_DATABASE_ID = process.env.RESERVATIONS_DB_ID || '23afd5adc30b802fbe36d69085c495b7';
const STAFF_DATABASE_ID = process.env.STAFF_DB_ID || '23afd5adc30b80b7a8e7dec998bf5aad';

// 餐廳資訊
const RESTAURANT_NAME = process.env.RESTAURANT_NAME || 'Tanawat Restaurant';
const RESTAURANT_TIMEZONE = process.env.RESTAURANT_TIMEZONE || 'Asia/Taipei';

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.')); // 提供靜態文件服務

// Notion API 代理路由
app.all('/api/notion/*', async (req, res) => {
    try {
        const notionPath = req.path.replace('/api/notion', '');
        const url = `${NOTION_BASE_URL}${notionPath}`;
        
        console.log(`🔄 代理請求: ${req.method} ${url}`);
        
        const options = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_API_VERSION
            }
        };
        
        if (req.method !== 'GET' && req.body) {
            options.body = JSON.stringify(req.body);
        }
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ 請求成功: ${response.status}`);
            res.status(response.status).json(data);
        } else {
            console.log(`❌ 請求失敗: ${response.status}`, data);
            res.status(response.status).json(data);
        }
        
    } catch (error) {
        console.error('❌ 代理錯誤:', error);
        res.status(500).json({ 
            error: '代理伺服器錯誤', 
            message: error.message 
        });
    }
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        notion_api_configured: !!NOTION_API_KEY
    });
});

// 測試 Notion 連線端點
app.get('/api/test-notion', async (req, res) => {
    try {
        const response = await fetch(`${NOTION_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_API_VERSION
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            res.json({
                connected: true,
                user: user.name || user.person?.email || 'Unknown',
                id: user.id
            });
        } else {
            const error = await response.json();
            res.status(response.status).json({
                connected: false,
                error: error.message || '連線失敗'
            });
        }
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: error.message
        });
    }
});

// CSV 相關端點

// CSV 預覽端點
app.get('/api/csv-preview', (req, res) => {
    try {
        console.log('📋 收到 CSV 預覽請求');
        const csvPath = path.join(__dirname, 'data', '最終菜色.csv');
        console.log('📁 CSV 檔案路徑:', csvPath);
        
        if (!fs.existsSync(csvPath)) {
            console.error('❌ CSV 檔案不存在:', csvPath);
            return res.status(404).json({ error: 'CSV 檔案不存在' });
        }
        
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.trim().split('\n');
        const headers = parseCSVLine(lines[0]);
        
        console.log('📊 CSV 標題:', headers);
        
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
        
        console.log(`✅ 成功解析 ${data.length} 筆 CSV 資料`);
        res.json(data); // 直接返回陣列
    } catch (error) {
        console.error('❌ CSV 預覽錯誤:', error);
        res.status(500).json({ error: error.message });
    }
});

// 同步單筆菜單項目到 Notion
app.post('/api/sync-menu-item', async (req, res) => {
    try {
        console.log('📥 收到同步請求:', req.body);
        
        const menuItem = req.body;
        if (!menuItem || !menuItem['餐點名稱']) {
            return res.status(400).json({ 
                success: false, 
                error: '無效的菜單項目資料' 
            });
        }
        
        console.log('🔄 轉換菜單資料為 Notion 格式...');
        const notionData = transformMenuToNotionFormat(menuItem);
        console.log('📊 Notion 資料:', JSON.stringify(notionData, null, 2));
        
        console.log('🌐 發送請求到 Notion API...');
        const response = await fetch(`${NOTION_BASE_URL}/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_API_VERSION
            },
            body: JSON.stringify(notionData)
        });
        
        console.log('📡 Notion API 回應狀態:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 同步成功:', menuItem['餐點名稱']);
            res.json({ success: true, data: result });
        } else {
            const error = await response.json();
            console.log('❌ Notion API 錯誤:', error);
            res.status(response.status).json({ success: false, error: error.message || '同步失敗' });
        }
    } catch (error) {
        console.error('❌ 同步過程發生錯誤:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 清空 Notion 菜單資料庫
app.post('/api/clear-notion-menu', async (req, res) => {
    try {
        console.log('🗑️ 開始清空 Notion 菜單資料庫...');
        console.log(`📊 使用資料庫 ID: ${MENU_DATABASE_ID}`);
        
        let allPages = [];
        let hasMore = true;
        let startCursor = null;
        
        // 分頁查詢所有頁面
        while (hasMore) {
            const queryBody = {
                page_size: 100
            };
            
            if (startCursor) {
                queryBody.start_cursor = startCursor;
            }
            
            const queryResponse = await fetch(`${NOTION_BASE_URL}/databases/${MENU_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': NOTION_API_VERSION
                },
                body: JSON.stringify(queryBody)
            });
            
            if (!queryResponse.ok) {
                const errorText = await queryResponse.text();
                console.error(`❌ 查詢資料庫失敗: ${queryResponse.status} - ${errorText}`);
                throw new Error(`查詢資料庫失敗: ${queryResponse.status}`);
            }
            
            const queryResult = await queryResponse.json();
            allPages = allPages.concat(queryResult.results);
            
            hasMore = queryResult.has_more;
            startCursor = queryResult.next_cursor;
        }
        
        console.log(`📊 找到 ${allPages.length} 筆資料需要清空`);
        
        if (allPages.length === 0) {
            console.log('✅ 資料庫已經是空的');
            return res.json({ success: true, deletedCount: 0, failedCount: 0 });
        }
        
        let deletedCount = 0;
        let failedCount = 0;
        
        // 歸檔所有頁面
        for (const page of allPages) {
            try {
                const pageName = page.properties?.名稱?.title?.[0]?.text?.content || 
                                page.properties?.餐點名稱?.title?.[0]?.text?.content || 
                                page.id;
                console.log(`🗑️ 正在刪除: ${pageName}`);
                
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
                    console.log(`  ✅ 成功刪除: ${pageName}`);
                } else {
                    failedCount++;
                    const errorText = await deleteResponse.text();
                    console.error(`  ❌ 刪除失敗: ${pageName} - ${deleteResponse.status} - ${errorText}`);
                }
                
                // 避免 API 限制
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                failedCount++;
                console.error(`  ❌ 處理頁面時發生錯誤: ${error.message}`);
            }
        }
        
        console.log(`✅ 清空完成！成功: ${deletedCount}, 失敗: ${failedCount}`);
        res.json({ success: true, deletedCount, failedCount });
        
    } catch (error) {
        console.error('❌ 清空 Notion 資料庫時發生錯誤:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 獲取桌況資料
app.get('/api/tables', async (req, res) => {
    try {
        console.log('📋 開始獲取桌況資料...');
        console.log(`📊 使用資料庫 ID: ${TABLES_DATABASE_ID}`);
        
        const response = await fetch(`${NOTION_BASE_URL}/databases/${TABLES_DATABASE_ID}/query`, {
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
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ 獲取桌況失敗: ${response.status} - ${errorText}`);
            throw new Error(`獲取桌況失敗: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ 成功獲取 ${data.results.length} 筆桌況資料`);
        
        // 轉換為前端需要的格式
        const tables = data.results.map(page => {
            const props = page.properties;
            return {
                id: page.id,
                tableNumber: props['桌號']?.title?.[0]?.plain_text || '未知',
                status: props['狀態']?.select?.name || '空閒中',
                maxCapacity: props['容納人數']?.number || 2,
                currentCapacity: props['目前人數']?.number || 0,
                shape: props['桌型']?.select?.name || '方形',
                location: props['區域']?.select?.name || '未指定',
                position: props['位置']?.rich_text?.[0]?.plain_text || '',
                isMainTable: props['主桌']?.checkbox || false,
                mergeNote: props['併桌備註']?.rich_text?.[0]?.plain_text || '',
                currentOrder: props['目前訂單']?.rich_text?.[0]?.plain_text || null,
                currentTotal: props['目前消費']?.number || 0,
                lastCleaned: props['最後清潔時間']?.date?.start || new Date().toISOString(),
                isAvailable: props['可使用']?.checkbox !== false,
                features: props['特色']?.multi_select?.map(item => item.name) || [],
                priority: props['優先序']?.number || 1,
                occupiedSince: props['入座時間']?.date?.start || null,
                notes: props['備註']?.rich_text?.[0]?.plain_text || ''
            };
        });
        
        res.json(tables);
        
    } catch (error) {
        console.error('❌ 獲取桌況資料時發生錯誤:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 更新桌況狀態
app.post('/api/tables/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, currentCapacity, currentOrder, currentTotal, notes } = req.body;
        
        console.log(`🔄 收到桌況更新請求 - 桌位ID: ${id}`);
        console.log(`📊 更新內容:`, { status, currentCapacity, currentOrder, currentTotal, notes });
        
        const updateData = {
            properties: {}
        };
        
        if (status) {
            updateData.properties['狀態'] = {
                select: { name: status }
            };
        }
        
        if (currentCapacity !== undefined) {
            updateData.properties['目前人數'] = {
                number: currentCapacity
            };
        }
        
        if (currentOrder !== undefined) {
            updateData.properties['目前訂單'] = {
                rich_text: currentOrder ? [{ text: { content: currentOrder } }] : []
            };
        }
        
        if (currentTotal !== undefined) {
            updateData.properties['目前消費'] = {
                number: currentTotal
            };
        }
        
        if (notes !== undefined) {
            updateData.properties['備註'] = {
                rich_text: notes ? [{ text: { content: notes } }] : []
            };
        }
        
        // 如果桌子被佔用，設置入座時間
        if (status === '使用中' && currentCapacity > 0) {
            updateData.properties['入座時間'] = {
                date: { start: new Date().toISOString() }
            };
        }
        
        // 如果桌子變為空閒，清除入座時間
        if (status === '空閒中') {
            updateData.properties['入座時間'] = { date: null };
            updateData.properties['目前人數'] = { number: 0 };
            updateData.properties['目前訂單'] = { rich_text: [] };
            updateData.properties['目前消費'] = { number: 0 };
        }
        
        const response = await fetch(`${NOTION_BASE_URL}/pages/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_API_VERSION
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ 更新桌況失敗: ${response.status} - ${errorText}`);
            throw new Error(`更新桌況失敗: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`✅ 桌況 ${id} 更新成功`);
        
        res.json({ success: true, data: result });
        
    } catch (error) {
        console.error('❌ 更新桌況時發生錯誤:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 輔助函數：解析 CSV 行
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

// 輔助函數：轉換菜單資料為 Notion 格式
function transformMenuToNotionFormat(csvRow) {
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

// 設定靜態檔案服務 - 指向新的 public 資料夾
app.use(express.static('public'));
app.use('/assets', express.static('assets'));
app.use('/pages', express.static('pages'));

// 根路由 - 重定向到主頁 (現在在 public 資料夾)
app.get('/', (req, res) => {
    res.redirect('/main-dashboard.html');
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 Tanawat Restaurant API 代理伺服器已啟動`);
    console.log(`📡 伺服器地址: http://localhost:${PORT}`);
    console.log(`🔗 Notion API 設定狀態: ${NOTION_API_KEY ? '✅ 已設定' : '❌ 未設定'}`);
    console.log(`📋 可用端點:`);
    console.log(`   - GET  /api/health - 健康檢查`);
    console.log(`   - GET  /api/test-notion - 測試 Notion 連線`);
    console.log(`   - GET  /api/csv-preview - CSV 資料預覽`);
    console.log(`   - POST /api/sync-menu-item - 同步菜單項目`);
    console.log(`   - POST /api/clear-notion-menu - 清空菜單資料庫`);
    console.log(`   - ALL  /api/notion/* - Notion API 代理`);
    console.log(`   - GET  /pages/tools/csv-notion-sync.html - CSV 同步工具`);
    console.log(`   - GET  / - 主頁面`);
});

module.exports = app;
