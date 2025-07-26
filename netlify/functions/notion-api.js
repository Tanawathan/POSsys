const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // 設定 CORS 標頭
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    };

    // 處理 OPTIONS 請求 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // 從環境變數獲取配置
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const NOTION_VERSION = '2022-06-28';
    const NOTION_BASE_URL = 'https://api.notion.com/v1';

    // 從路徑中提取 API 路由
    const path = event.path.replace('/.netlify/functions/notion-api', '');

    try {
        // 特殊路由處理
        if (path === '/health') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    notion_api_configured: !!NOTION_API_KEY,
                    environment: 'netlify'
                })
            };
        }

        if (path === '/test-notion') {
            try {
                const response = await fetch(`${NOTION_BASE_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${NOTION_API_KEY}`,
                        'Notion-Version': NOTION_VERSION
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            connected: true,
                            user: user.name || user.person?.email || 'Unknown',
                            id: user.id
                        })
                    };
                } else {
                    const error = await response.json();
                    return {
                        statusCode: response.status,
                        headers,
                        body: JSON.stringify({
                            connected: false,
                            error: error.message || '連線失敗'
                        })
                    };
                }
            } catch (error) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        connected: false,
                        error: error.message
                    })
                };
            }
        }

        // 處理 Notion API 代理請求
        if (path.startsWith('/')) {
            const notionUrl = `${NOTION_BASE_URL}${path}`;
            
            console.log(`🔄 代理請求: ${event.httpMethod} ${notionUrl}`);
            
            const options = {
                method: event.httpMethod,
                headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': NOTION_VERSION
                }
            };
            
            // 處理請求體
            if (event.httpMethod !== 'GET' && event.body) {
                options.body = event.body;
            }
            
            const response = await fetch(notionUrl, options);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ 請求成功: ${response.status}`);
            } else {
                console.log(`❌ 請求失敗: ${response.status}`, data);
            }
            
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify(data)
            };
        }

        // 如果沒有匹配的路由
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: '找不到指定的 API 端點' })
        };

    } catch (error) {
        console.error('❌ Notion API 調用錯誤:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: '服務器錯誤',
                message: error.message 
            })
        };
    }
};
