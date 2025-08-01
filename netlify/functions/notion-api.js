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
        const requestBody = JSON.parse(event.body);
        let responseData;

        // Enhanced logging for incoming requests
        console.log('Received request body:', requestBody);

        // Handle different request formats
        let action, body;
        
        // Check if it's the new mobile format { path, method, body }
        if (requestBody.path && requestBody.method) {
            const { path, method, body: requestBodyData } = requestBody;
            console.log(`Mobile API request - Path: ${path}, Method: ${method}`);
            
            // Convert path-based requests to action-based
            if (path.includes('/databases/') && path.includes('/query') && method === 'POST') {
                const dbId = path.split('/databases/')[1].split('/query')[0];
                
                // Map database IDs to actions
                if (dbId === process.env.NOTION_TABLE_DATABASE_ID || dbId === '23afd5adc30b80fe86c9e086a54a0d61') {
                    action = 'getTables';
                    body = requestBodyData || {};
                } else if (dbId === process.env.NOTION_MENU_DATABASE_ID || dbId === '23afd5adc30b80c58355fd93d05c66d6') {
                    action = 'getMenu';
                    body = requestBodyData || {};
                } else if (dbId === process.env.NOTION_ORDERS_DATABASE_ID || dbId === '23afd5adc30b80c39e71d1a640ccfb5d') {
                    action = 'getOrders';
                    body = requestBodyData || {};
                } else {
                    console.error('Unknown database ID:', dbId);
                    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown database ID' }) };
                }
            } else if (path === '/pages' && method === 'POST') {
                action = 'createOrder';
                body = requestBodyData || {};
            } else if (path.startsWith('/pages/') && method === 'PATCH') {
                action = 'updateTable';
                body = { pageId: path.split('/pages/')[1], ...requestBodyData };
            } else {
                console.error('Unsupported path/method combination:', { path, method });
                return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported API endpoint' }) };
            }
        } else {
            // Original format { action, ...body }
            ({ action, ...body } = requestBody);
        }

        console.log(`Processing action: ${action} with body:`, body);

        switch (action) {
            case 'getTables':
                const tableDbId = process.env.NOTION_TABLE_DATABASE_ID || '23afd5adc30b80fe86c9e086a54a0d61';
                console.log(`Querying Notion tables with DB ID: ${tableDbId}`);
                
                const queryOptions = {
                    database_id: tableDbId,
                    page_size: body.page_size || 100
                };
                
                if (body.sorts) {
                    queryOptions.sorts = body.sorts;
                }
                
                const tablesResponse = await notion.databases.query(queryOptions);
                
                responseData = {
                    results: tablesResponse.results.map(page => ({
                        id: page.id,
                        properties: page.properties,
                        // Also include parsed data for compatibility
                        tableName: getPropertyValue(page, '桌號', 'title'),
                        status: getPropertyValue(page, '狀態', 'select'),
                        capacity: getPropertyValue(page, '容納人數', 'number')
                    }))
                };
                break;

            case 'getMenu':
                const menuDbId = process.env.NOTION_MENU_DATABASE_ID || '23afd5adc30b80c58355fd93d05c66d6';
                console.log(`Querying Notion menu with DB ID: ${menuDbId}`);
                console.log(`Environment NOTION_MENU_DATABASE_ID: ${process.env.NOTION_MENU_DATABASE_ID}`);
                console.log(`Fallback menu DB ID: 23afd5adc30b80c58355fd93d05c66d6`);
                
                const menuQueryOptions = {
                    database_id: menuDbId,
                    page_size: body.page_size || 100
                };
                
                if (body.filter) {
                    menuQueryOptions.filter = body.filter;
                    console.log(`Menu query filter:`, JSON.stringify(body.filter, null, 2));
                }
                
                if (body.sorts) {
                    menuQueryOptions.sorts = body.sorts;
                    console.log(`Menu query sorts:`, JSON.stringify(body.sorts, null, 2));
                }

                console.log(`Final menu query options:`, JSON.stringify(menuQueryOptions, null, 2));

                try {
                    const menuResponse = await notion.databases.query(menuQueryOptions);
                    console.log(`Menu query successful, found ${menuResponse.results.length} items`);

                    responseData = {
                        results: menuResponse.results.map(page => ({
                            id: page.id,
                            properties: page.properties,
                            // Also include parsed data for compatibility
                            name: getPropertyValue(page, '品項名稱', 'title'),
                            price: getPropertyValue(page, '價格', 'number'),
                            category: getPropertyValue(page, '分類', 'select'),
                            description: getPropertyValue(page, '描述', 'rich_text'),
                            status: getPropertyValue(page, '狀態', 'select')
                        }))
                    };
                } catch (menuError) {
                    console.error('Menu database query failed:', menuError);
                    console.error('Menu error details:', {
                        code: menuError.code,
                        status: menuError.status,
                        message: menuError.message,
                        body: menuError.body
                    });
                    throw menuError;
                }
                break;
            
            case 'getOrders':
                const ordersDbId = process.env.NOTION_ORDERS_DATABASE_ID || '23afd5adc30b80c39e71d1a640ccfb5d';
                console.log(`Querying Notion orders with DB ID: ${ordersDbId}`);
                
                const orderQueryOptions = {
                    database_id: ordersDbId,
                    page_size: body.page_size || 100
                };
                
                if (body.sorts) {
                    orderQueryOptions.sorts = body.sorts;
                }
                
                if (body.filter) {
                    orderQueryOptions.filter = body.filter;
                }
                
                try {
                    const ordersResponse = await notion.databases.query(orderQueryOptions);
                    responseData = {
                        results: ordersResponse.results,
                        next_cursor: ordersResponse.next_cursor,
                        has_more: ordersResponse.has_more
                    };
                } catch (orderError) {
                    console.error('Orders database query failed:', orderError);
                    console.error('Order error details:', {
                        code: orderError.code,
                        status: orderError.status,
                        message: orderError.message,
                        body: orderError.body
                    });
                    throw orderError;
                }
                break;
            
            case 'createOrder':
                const orderDbId = process.env.NOTION_ORDERS_DATABASE_ID || '23afd5adc30b80c39e71d1a640ccfb5d';
                console.log(`Creating order in Notion with DB ID: ${orderDbId}`);
                
                // Handle both old and new format
                const orderData = body.parent ? body : {
                    parent: { database_id: orderDbId },
                    properties: body.properties || body
                };
                
                const newOrder = await notion.pages.create(orderData);
                responseData = newOrder;
                break;
                
            case 'updateTable':
                console.log(`Updating table page: ${body.pageId}`);
                const updateData = {
                    page_id: body.pageId,
                    properties: body.properties || body
                };
                
                const updatedPage = await notion.pages.update(updateData);
                responseData = updatedPage;
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
            errorCode: error.code,
            errorStatus: error.status,
            requestBody: event.body,
        });
        
        // Check for Notion specific errors
        if (error.code === 'unauthorized' || error.code === 'restricted_resource') {
             return { statusCode: 500, body: JSON.stringify({ 
                 error: 'Notion API 權限不足或金鑰錯誤。',
                 details: `Error code: ${error.code}`,
                 suggestion: '請檢查 NOTION_API_KEY 是否正確，且 integration 已被邀請到資料庫。'
             }) };
        }
        if (error.code === 'object_not_found') {
             return { statusCode: 500, body: JSON.stringify({ 
                 error: '找不到指定的 Notion 資料庫，請檢查 ID 是否正確。',
                 details: `Error code: ${error.code}`,
                 suggestion: '請檢查資料庫 ID 格式是否正確，且 integration 有權限存取該資料庫。'
             }) };
        }
        if (error.code === 'validation_error') {
             return { statusCode: 500, body: JSON.stringify({ 
                 error: 'Notion API 請求格式錯誤。',
                 details: error.message,
                 suggestion: '請檢查資料庫欄位名稱或查詢條件是否正確。'
             }) };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: '後端伺服器發生內部錯誤。', 
                details: error.message,
                code: error.code || 'unknown',
                suggestion: '請聯繫系統管理員或檢查 Netlify function logs。'
            }),
        };
    }
};
