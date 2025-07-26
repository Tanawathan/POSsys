exports.handler = async (event, context) => {
    // 設定 CORS 標頭
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    };

    // 處理 OPTIONS 請求 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // 從環境變數獲取 Notion API 密鑰
    const NOTION_API_KEY = process.env.NOTION_API_KEY || 'secret_iSDhSCT8HPZMjPsX8YuMdhfzPJ2EYJrfXLdE17L88cV';
    const NOTION_VERSION = '2022-06-28';

    try {
        const { path, method = 'GET', body } = JSON.parse(event.body || '{}');
        
        if (!path) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '缺少 path 參數' })
            };
        }

        // 構建 Notion API URL
        const notionUrl = `https://api.notion.com/v1${path}`;
        
        // 準備請求選項
        const fetchOptions = {
            method,
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_VERSION
            }
        };

        // 如果有 body，加入請求
        if (body && (method === 'POST' || method === 'PATCH')) {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        // 發送請求到 Notion API
        const response = await fetch(notionUrl, fetchOptions);
        const data = await response.json();

        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Notion API 調用錯誤:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: '服務器錯誤',
                details: error.message 
            })
        };
    }
};
