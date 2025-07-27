/**
 * 🍔 Uber Eats Webhook 接收端點
 * 部署為 Netlify Function
 */

const { UberEatsAPI, UberEatsWebhookHandler } = require('../scripts/uber-eats-integration');

exports.handler = async (event, context) => {
    // 設置 CORS 標頭
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 處理 CORS 預檢請求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS OK' })
        };
    }

    // 只接受 POST 請求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('📨 收到 Uber Eats Webhook 請求');
        console.log('Headers:', event.headers);
        console.log('Body:', event.body);

        // 驗證 Webhook 簽名 (生產環境必需)
        const signature = event.headers['x-uber-signature'];
        if (!verifyWebhookSignature(event.body, signature)) {
            console.error('❌ Webhook 簽名驗證失敗');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid signature' })
            };
        }

        // 解析請求資料
        const webhookData = JSON.parse(event.body);
        console.log('📋 Webhook 資料:', webhookData);

        // 初始化 API 客戶端
        const config = {
            sandbox: process.env.NODE_ENV !== 'production',
            clientId: process.env.UBER_EATS_CLIENT_ID,
            clientSecret: process.env.UBER_EATS_CLIENT_SECRET
        };

        const uberEatsAPI = new UberEatsAPI(config);
        
        // 初始化 Notion API 客戶端
        const notionAPI = {
            createOrder: async (orderData) => {
                // 呼叫現有的 Notion API 函數
                const response = await fetch(`${process.env.NETLIFY_SITE_URL}/.netlify/functions/notion-api`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: `/databases/${process.env.NOTION_ORDERS_DB_ID}/pages`,
                        method: 'POST',
                        body: {
                            parent: { database_id: process.env.NOTION_ORDERS_DB_ID },
                            properties: orderData.properties
                        }
                    })
                });
                return response.json();
            },
            updateOrderStatus: async (orderId, status) => {
                // 實作訂單狀態更新邏輯
                console.log(`更新訂單 ${orderId} 狀態為 ${status}`);
            }
        };

        // 初始化 Webhook 處理器
        const webhookHandler = new UberEatsWebhookHandler(uberEatsAPI, notionAPI);

        // 處理 Webhook
        await webhookHandler.handleWebhook(webhookData);

        console.log('✅ Webhook 處理完成');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                status: 'success',
                message: 'Webhook processed successfully',
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('❌ Webhook 處理錯誤:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

/**
 * 驗證 Webhook 簽名
 */
function verifyWebhookSignature(payload, signature) {
    if (!signature || !process.env.UBER_EATS_WEBHOOK_SECRET) {
        console.warn('⚠️ 跳過簽名驗證 (開發環境)');
        return true; // 開發環境跳過驗證
    }

    try {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.UBER_EATS_WEBHOOK_SECRET)
            .update(payload, 'utf8')
            .digest('hex');

        const providedSignature = signature.replace('sha256=', '');
        
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(providedSignature, 'hex')
        );
    } catch (error) {
        console.error('簽名驗證錯誤:', error);
        return false;
    }
}

/**
 * 測試函數 - 模擬 Uber Eats Webhook
 */
async function testWebhook() {
    const testData = {
        event_type: 'orders.notification',
        data: {
            id: 'test_order_123',
            status: 'created',
            total_amount: 2500, // 25.00 USD in cents
            created_at: new Date().toISOString(),
            customer: {
                name: '測試客戶',
                phone: '+886912345678'
            },
            items: [
                {
                    name: '測試餐點',
                    quantity: 2,
                    price: 1000, // 10.00 USD in cents
                    special_instructions: '不要香菜'
                },
                {
                    name: '測試飲料',
                    quantity: 1,
                    price: 500 // 5.00 USD in cents
                }
            ],
            special_instructions: '請快一點',
            delivery_address: {
                street1: '測試街道 123 號',
                city: '台北市',
                state: '台北市',
                postal_code: '10001'
            },
            estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
    };

    const mockEvent = {
        httpMethod: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-uber-signature': 'test_signature'
        },
        body: JSON.stringify(testData)
    };

    const result = await exports.handler(mockEvent, {});
    console.log('測試結果:', result);
}

// 如果直接執行此文件，運行測試
if (require.main === module) {
    testWebhook();
}
