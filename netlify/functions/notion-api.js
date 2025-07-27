const { Client } = require('@notionhq/client');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Notion and S3 clients initialization
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Helper function to extract property value from Notion page
const getPropertyValue = (page, propertyName, propertyType) => {
    const property = page.properties[propertyName];
    if (!property) return null;

    switch (propertyType) {
        case 'title':
            return property.title[0]?.plain_text || null;
        case 'rich_text':
            return property.rich_text[0]?.plain_text || null;
        case 'number':
            return property.number;
        case 'select':
            return property.select?.name || null;
        case 'status':
            return property.status?.name || null;
        case 'relation':
            return property.relation.map(rel => rel.id);
        case 'rollup':
            if (property.rollup.type === 'array' && property.rollup.array.length > 0) {
                const firstItem = property.rollup.array[0];
                if (firstItem.type === 'number') return firstItem.number;
                if (firstItem.type === 'title') return firstItem.title[0]?.plain_text;
            }
            return null;
        case 'formula':
            return property.formula?.number ?? property.formula?.string ?? null;
        default:
            return null;
    }
};

// Main handler function for Netlify
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { action, ...body } = JSON.parse(event.body);
        let responseData;

        // Enhanced logging for incoming requests
        console.log(`Received action: ${action} with body:`, body);

        switch (action) {
            case 'getTables':
                const tableDbId = process.env.NOTION_TABLE_DATABASE_ID;
                if (!tableDbId) {
                    console.error('Error: NOTION_TABLE_DATABASE_ID is not set in environment variables.');
                    return { statusCode: 500, body: JSON.stringify({ error: '伺服器端桌況資料庫設定遺失。' }) };
                }
                
                console.log(`Querying Notion with Table DB ID: ${tableDbId}`);
                const tablesResponse = await notion.databases.query({ database_id: tableDbId });
                
                responseData = tablesResponse.results.map(page => ({
                    id: page.id,
                    tableName: getPropertyValue(page, '桌號', 'title'),
                    status: getPropertyValue(page, '狀態', 'status'),
                    zone: getPropertyValue(page, '區域', 'select'),
                }));
                break;

            case 'getMenu':
                const menuDbId = process.env.NOTION_MENU_DATABASE_ID;
                 if (!menuDbId) {
                    console.error('Error: NOTION_MENU_DATABASE_ID is not set in environment variables.');
                    return { statusCode: 500, body: JSON.stringify({ error: '伺服器端菜單資料庫設定遺失。' }) };
                }

                console.log(`Querying Notion with Menu DB ID: ${menuDbId}`);
                const menuResponse = await notion.databases.query({ database_id: menuDbId });

                responseData = menuResponse.results.map(page => ({
                    id: page.id,
                    name: getPropertyValue(page, '菜色名稱', 'title'),
                    price: getPropertyValue(page, '價格', 'number'),
                    category: getPropertyValue(page, '分類', 'select'),
                    cost: getPropertyValue(page, '成本', 'rollup') 
                }));
                break;
            
            case 'createOrder':
                const orderDbId = process.env.NOTION_ORDERS_DATABASE_ID;
                if (!orderDbId) {
                    console.error('Error: NOTION_ORDERS_DATABASE_ID is not set in environment variables.');
                    return { statusCode: 500, body: JSON.stringify({ error: '伺服器端訂單資料庫設定遺失。' }) };
                }

                console.log(`Creating order in Notion with DB ID: ${orderDbId}`);
                const { tableId, items, total, orderId } = body;
                const newOrder = await notion.pages.create({
                    parent: { database_id: orderDbId },
                    properties: {
                        '訂單號碼': { title: [{ text: { content: orderId } }] },
                        '桌號': { relation: [{ id: tableId }] },
                        '總金額': { number: total },
                        '訂單狀態': { status: { name: '進行中' } },
                        '訂單品項 (JSON)': { rich_text: [{ text: { content: JSON.stringify(items) } }] }
                    }
                });
                responseData = { success: true, order: newOrder };
                break;
            
            // Add other cases as needed...

            default:
                console.warn(`Unknown action received: ${action}`);
                return { statusCode: 400, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData),
        };

    } catch (error) {
        // Enhanced error logging
        console.error('Error executing Netlify function:', {
            errorMessage: error.message,
            errorStack: error.stack,
            requestBody: event.body,
        });
        
        // Check for Notion specific errors
        if (error.code === 'unauthorized' || error.code === 'restricted_resource') {
             return { statusCode: 500, body: JSON.stringify({ error: 'Notion API 權限不足或金鑰錯誤。' }) };
        }
        if (error.code === 'object_not_found') {
             return { statusCode: 500, body: JSON.stringify({ error: '找不到指定的 Notion 資料庫，請檢查 ID 是否正確。' }) };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: '後端伺服器發生內部錯誤。', details: error.message }),
        };
    }
};
