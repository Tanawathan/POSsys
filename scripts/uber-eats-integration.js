/**
 * 🍔 Uber Eats API 整合模組
 * 用於處理 Uber Eats 訂單同步到本地 POS 系統
 */

class UberEatsAPI {
    constructor(config) {
        this.config = config;
        this.accessToken = null;
        this.baseURL = config.sandbox ? config.sandbox.baseURL : config.production.baseURL;
    }

    /**
     * OAuth 2.0 認證
     */
    async authenticate() {
        try {
            const response = await fetch('https://login.uber.com/oauth/v2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    grant_type: 'client_credentials',
                    scope: 'eats.store eats.order'
                })
            });

            const data = await response.json();
            this.accessToken = data.access_token;
            console.log('✅ Uber Eats API 認證成功');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Uber Eats API 認證失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取餐廳資訊
     */
    async getStoreInfo(storeId) {
        try {
            const response = await fetch(`${this.baseURL}/stores/${storeId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('📍 餐廳資訊:', data);
            return data;
        } catch (error) {
            console.error('❌ 獲取餐廳資訊失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取訂單列表
     */
    async getOrders(storeId, options = {}) {
        try {
            const params = new URLSearchParams({
                store_id: storeId,
                limit: options.limit || 50,
                ...options
            });

            const response = await fetch(`${this.baseURL}/orders?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log(`📋 獲取到 ${data.orders?.length || 0} 個訂單`);
            return data.orders || [];
        } catch (error) {
            console.error('❌ 獲取訂單失敗:', error);
            throw error;
        }
    }

    /**
     * 更新訂單狀態
     */
    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status
                })
            });

            const data = await response.json();
            console.log(`✅ 訂單 ${orderId} 狀態更新為: ${status}`);
            return data;
        } catch (error) {
            console.error('❌ 更新訂單狀態失敗:', error);
            throw error;
        }
    }

    /**
     * 同步菜單到 Uber Eats
     */
    async syncMenu(storeId, menuData) {
        try {
            const response = await fetch(`${this.baseURL}/stores/${storeId}/menus`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuData)
            });

            const data = await response.json();
            console.log('✅ 菜單同步成功');
            return data;
        } catch (error) {
            console.error('❌ 菜單同步失敗:', error);
            throw error;
        }
    }

    /**
     * 轉換 Uber Eats 訂單為本地格式
     */
    convertUberOrderToLocal(uberOrder) {
        const localOrder = {
            id: `UBER_${uberOrder.id}`,
            properties: {
                '訂單編號': { title: [{ text: { content: `UBER_${uberOrder.id}` } }] },
                '桌號': { rich_text: [{ text: { content: 'Uber Eats' } }] },
                '狀態': { select: { name: this.mapUberStatusToLocal(uberOrder.status) } },
                '總金額': { number: uberOrder.total_amount / 100 }, // 轉換為元
                '用餐人數': { number: 1 },
                '建立時間': { date: { start: uberOrder.created_at } },
                '備註': { rich_text: [{ text: { content: this.buildOrderNote(uberOrder) } }] },
                '訂單來源': { select: { name: 'Uber Eats' } }
            },
            items: uberOrder.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price / 100, // 轉換為元
                note: item.special_instructions || ''
            })),
            customerNote: uberOrder.delivery_instructions || '',
            uberOrderId: uberOrder.id,
            customerInfo: {
                name: uberOrder.customer?.name || 'Uber Eats 客戶',
                phone: uberOrder.customer?.phone || '',
                address: uberOrder.delivery_address
            }
        };

        return localOrder;
    }

    /**
     * 對應 Uber Eats 狀態到本地狀態
     */
    mapUberStatusToLocal(uberStatus) {
        const statusMap = {
            'created': '待處理',
            'accepted': '製作中',
            'ready_for_pickup': '等待甜點',
            'picked_up': '等待結帳',
            'delivered': '結帳完成',
            'cancelled': '已取消'
        };

        return statusMap[uberStatus] || '待處理';
    }

    /**
     * 建立訂單備註
     */
    buildOrderNote(uberOrder) {
        const systemData = {
            platform: 'Uber Eats',
            orderId: uberOrder.id,
            customerName: uberOrder.customer?.name || 'Uber Eats 客戶',
            deliveryTime: uberOrder.estimated_delivery_time,
            specialInstructions: uberOrder.special_instructions || '',
            items: uberOrder.items
        };

        let note = '';
        if (uberOrder.special_instructions) {
            note += `客戶備註: ${uberOrder.special_instructions}\n\n`;
        }

        note += `[系統資料]\n${JSON.stringify(systemData, null, 2)}\n[/系統資料]`;
        return note;
    }
}

/**
 * Webhook 處理器
 */
class UberEatsWebhookHandler {
    constructor(uberEatsAPI, notionAPI) {
        this.uberEatsAPI = uberEatsAPI;
        this.notionAPI = notionAPI;
    }

    /**
     * 處理 Webhook 事件
     */
    async handleWebhook(webhookData) {
        try {
            console.log('📨 收到 Uber Eats Webhook:', webhookData.event_type);

            switch (webhookData.event_type) {
                case 'orders.notification':
                    await this.handleOrderNotification(webhookData);
                    break;
                case 'orders.status_changed':
                    await this.handleOrderStatusChange(webhookData);
                    break;
                default:
                    console.log('⚠️ 未處理的 Webhook 事件類型:', webhookData.event_type);
            }
        } catch (error) {
            console.error('❌ Webhook 處理失敗:', error);
            throw error;
        }
    }

    /**
     * 處理新訂單通知
     */
    async handleOrderNotification(webhookData) {
        const orderData = webhookData.data;
        console.log('🆕 新的 Uber Eats 訂單:', orderData.id);

        // 轉換為本地訂單格式
        const localOrder = this.uberEatsAPI.convertUberOrderToLocal(orderData);

        // 存入 Notion 資料庫
        await this.notionAPI.createOrder(localOrder);

        // 發送通知
        await this.sendOrderNotification(localOrder);
    }

    /**
     * 處理訂單狀態變更
     */
    async handleOrderStatusChange(webhookData) {
        const orderData = webhookData.data;
        console.log('🔄 Uber Eats 訂單狀態變更:', orderData.id, orderData.status);

        // 在本地資料庫中找到對應訂單
        const localOrderId = `UBER_${orderData.id}`;
        const newStatus = this.uberEatsAPI.mapUberStatusToLocal(orderData.status);

        // 更新本地訂單狀態
        await this.notionAPI.updateOrderStatus(localOrderId, newStatus);
    }

    /**
     * 發送訂單通知
     */
    async sendOrderNotification(order) {
        // 可以整合多種通知方式
        console.log(`🔔 新訂單通知: ${order.id} - NT$${order.properties['總金額'].number}`);
        
        // 這裡可以加入:
        // - 推播通知
        // - 電子郵件通知
        // - 聲音提醒
        // - SMS 簡訊
    }
}

// 使用範例
const config = {
    sandbox: {
        baseURL: 'https://api.uber.com/v2/eats',
        clientId: 'YOUR_SANDBOX_CLIENT_ID',
        clientSecret: 'YOUR_SANDBOX_CLIENT_SECRET'
    }
};

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UberEatsAPI,
        UberEatsWebhookHandler
    };
}
