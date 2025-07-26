/**
 * Notion API 資料同步管理器
 * 直接與 Notion API 整合，替代 Make.com 中間層
 */
class NotionDataManager {
    constructor() {
        console.log('🔧 初始化 NotionDataManager...');
        console.log('🔍 檢查 APP_CONFIG:', window.APP_CONFIG);
        
        this.apiKey = window.APP_CONFIG?.notion?.apiKey;
        this.apiVersion = window.APP_CONFIG?.notion?.apiVersion || '2022-06-28';
        this.databaseIds = window.APP_CONFIG?.notion?.databaseIds || {};
        
        // 使用本地代理伺服器來避免 CORS 問題
        this.baseUrl = '/api/notion';
        this.proxyMode = true;
        
        console.log('⚙️ Notion 設定:');
        console.log('  - API Key 存在:', !!this.apiKey);
        console.log('  - API 版本:', this.apiVersion);
        console.log('  - 資料庫 IDs:', this.databaseIds);
        console.log('  - 代理模式:', this.proxyMode);
        
        // 驗證設定
        if (!this.apiKey) {
            console.warn('⚠️ Notion API Key 未設定，雲端同步功能將無法使用');
        }
        
        if (!this.databaseIds || Object.keys(this.databaseIds).length === 0) {
            console.warn('⚠️ Notion 資料庫 IDs 未設定');
        }
        
        console.log('✅ NotionDataManager 初始化完成');
    }

    /**
     * 建立 Notion API 請求標頭
     */
    getHeaders() {
        if (this.proxyMode) {
            // 代理模式下，API Key 由後端處理
            return {
                'Content-Type': 'application/json'
            };
        } else {
            return {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': this.apiVersion
            };
        }
    }

    /**
     * 處理 API 回應
     */
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Notion API 錯誤: ${error.message}`);
        }
        return await response.json();
    }

    /**
     * 將本地資料格式轉換為 Notion 格式
     */
    transformToNotionFormat(tableName, data) {
        const properties = {};

        switch (tableName) {
            case 'menu':
                properties.名稱 = { title: [{ text: { content: data.名稱 || data.name || '' } }] };
                properties.分類 = { select: { name: data.分類 || data.category || '主食' } };  // 根據實際結構使用 select
                properties.價格 = { number: data.價格 || data.price || 0 };
                properties.描述 = { rich_text: [{ text: { content: data.描述 || data.description || '' } }] };
                properties.供應狀態 = { checkbox: data.供應狀態 !== false && data.available !== false };
                break;

            case 'orders':
                console.log('🔍 處理訂單資料:', data);
                
                // 訂單編號 (Title 類型)
                properties.訂單編號 = { title: [{ text: { content: data.訂單編號 || data.orderId || '' } }] };
                
                // 桌號 (Rich Text 類型) 
                const tableNumber = data.桌號 || data.tableNumber || '';
                properties.桌號 = { rich_text: [{ text: { content: String(tableNumber) } }] };
                
                // 狀態 (Select 類型) - 根據實際選項
                const status = data.狀態 || data.status || '進行中';
                properties.狀態 = { select: { name: status } };
                
                // 總金額 (Number 類型)
                properties.總金額 = { number: data.總金額 || data.totalAmount || data.totalPrice || 0 };
                
                // 訂單項目 (Rich Text 類型)
                const orderItems = data.訂單項目 || data.orderItems || JSON.stringify(data.items || []);
                properties.訂單項目 = { rich_text: [{ text: { content: String(orderItems) } }] };
                
                // 建立時間/訂單時間 (Date 類型) - 優先使用建立時間
                let timeValue = data.建立時間 || data.訂單時間 || data.timestamp || data.createdAt;
                if (!timeValue) {
                    timeValue = new Date().toISOString();
                } else {
                    try {
                        const testDate = new Date(timeValue);
                        if (isNaN(testDate.getTime())) {
                            timeValue = new Date().toISOString();
                        } else {
                            timeValue = testDate.toISOString();
                        }
                    } catch (error) {
                        timeValue = new Date().toISOString();
                    }
                }
                properties.建立時間 = { date: { start: timeValue } };
                
                // 用餐人數 (Number 類型)
                if (data.用餐人數 !== undefined || data.customerCount !== undefined) {
                    properties.用餐人數 = { number: data.用餐人數 || data.customerCount || 1 };
                }
                
                // 備註 (Rich Text 類型)
                if (data.備註 || data.notes) {
                    properties.備註 = { rich_text: [{ text: { content: String(data.備註 || data.notes) } }] };
                }
                
                // 服務生 (Rich Text 類型)
                if (data.服務生 || data.waiter) {
                    properties.服務生 = { rich_text: [{ text: { content: String(data.服務生 || data.waiter) } }] };
                }
                
                // 付款狀態 (Select 類型)
                if (data.付款狀態 || data.paymentStatus) {
                    const paymentStatus = data.付款狀態 || data.paymentStatus || '未付款';
                    properties.付款狀態 = { select: { name: paymentStatus } };
                }
                
                // 付款方式 (Select 類型)
                if (data.付款方式 || data.paymentMethod) {
                    const paymentMethod = data.付款方式 || data.paymentMethod;
                    properties.付款方式 = { select: { name: paymentMethod } };
                }
                
                console.log('✅ 訂單欄位處理完成，包含欄位:', Object.keys(properties));
                break;

            case 'tables':
                console.log('🔍 處理桌況資料:', data);
                
                // 桌號 (Title 類型)
                properties.桌號 = { title: [{ text: { content: data.桌號 || data.tableNumber || '' } }] };
                
                // 狀態 (Select 類型) - 根據實際選項
                properties.狀態 = { select: { name: data.狀態 || data.status || '空閒中' } };
                
                // 容納人數 (Number 類型)
                properties.容納人數 = { number: data.容納人數 || data.capacity || 4 };
                
                // 目前人數 (Number 類型)
                if (data.目前人數 !== undefined || data.currentOccupancy !== undefined) {
                    properties.目前人數 = { number: data.目前人數 || data.currentOccupancy || 0 };
                }
                
                // 位置 (Rich Text 類型)
                if (data.位置 || data.location) {
                    properties.位置 = { rich_text: [{ text: { content: data.位置 || data.location || '' } }] };
                }
                
                // 區域 (Select 類型)
                if (data.區域 || data.area) {
                    properties.區域 = { select: { name: data.區域 || data.area || '前區' } };
                }
                
                // 桌型 (Select 類型)
                if (data.桌型 || data.tableType) {
                    properties.桌型 = { select: { name: data.桌型 || data.tableType || '方形' } };
                }
                
                // 備註 (Rich Text 類型)
                if (data.備註 || data.notes) {
                    properties.備註 = { rich_text: [{ text: { content: data.備註 || data.notes || '' } }] };
                }
                
                // 目前訂單 (Rich Text 類型)
                if (data.目前訂單 || data.currentOrder) {
                    properties.目前訂單 = { rich_text: [{ text: { content: data.目前訂單 || data.currentOrder || '' } }] };
                }
                
                // 目前消費 (Number 類型)
                if (data.目前消費 !== undefined || data.currentAmount !== undefined) {
                    properties.目前消費 = { number: data.目前消費 || data.currentAmount || 0 };
                }
                
                // 可使用 (Checkbox 類型)
                if (data.可使用 !== undefined || data.available !== undefined) {
                    properties.可使用 = { checkbox: data.可使用 !== false && data.available !== false };
                }
                
                // 入座時間 (Date 類型)
                if (data.入座時間 || data.seatedTime) {
                    try {
                        properties.入座時間 = { date: { start: new Date(data.入座時間 || data.seatedTime).toISOString() } };
                    } catch (error) {
                        console.warn('入座時間格式錯誤:', error);
                    }
                }
                
                // 優先序 (Number 類型)
                if (data.優先序 !== undefined || data.priority !== undefined) {
                    properties.優先序 = { number: data.優先序 || data.priority || 0 };
                }
                
                // 主桌 (Checkbox 類型)
                if (data.主桌 !== undefined || data.mainTable !== undefined) {
                    properties.主桌 = { checkbox: data.主桌 || data.mainTable || false };
                }
                
                // 併桌備註 (Rich Text 類型)
                if (data.併桌備註 || data.mergeNotes) {
                    properties.併桌備註 = { rich_text: [{ text: { content: data.併桌備註 || data.mergeNotes || '' } }] };
                }
                
                // 最後清潔時間 (Date 類型)
                if (data.最後清潔時間 || data.lastCleanTime) {
                    try {
                        properties.最後清潔時間 = { date: { start: new Date(data.最後清潔時間 || data.lastCleanTime).toISOString() } };
                    } catch (error) {
                        console.warn('最後清潔時間格式錯誤:', error);
                    }
                }
                break;

            case 'reservations':
                properties.客戶姓名 = { title: [{ text: { content: data.customerName || '' } }] };
                properties.聯絡電話 = { phone_number: data.phone || '' };
                properties.預約日期 = { date: { start: data.date || new Date().toISOString().split('T')[0] } };
                properties.預約時間 = { rich_text: [{ text: { content: data.time || '' } }] };
                properties.人數 = { number: data.partySize || 1 };
                properties.桌號 = { rich_text: [{ text: { content: data.tableNumber || '' } }] };
                properties.狀態 = { select: { name: data.status || '已預約' } };
                break;

            case 'inventory':
                properties.商品名稱 = { title: [{ text: { content: data.itemName || '' } }] };
                properties.分類 = { rich_text: [{ text: { content: data.category || '' } }] };
                properties.目前庫存 = { number: data.currentStock || 0 };
                properties.最低庫存 = { number: data.minStock || 0 };
                properties.單位 = { rich_text: [{ text: { content: data.unit || '' } }] };
                break;

            default:
                // 通用格式轉換
                Object.keys(data).forEach(key => {
                    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return;
                    
                    const value = data[key];
                    if (typeof value === 'string') {
                        properties[key] = { rich_text: [{ text: { content: value } }] };
                    } else if (typeof value === 'number') {
                        properties[key] = { number: value };
                    } else if (typeof value === 'boolean') {
                        properties[key] = { checkbox: value };
                    }
                });
        }

        return { properties };
    }

    /**
     * 將 Notion 格式轉換為本地資料格式
     */
    transformFromNotionFormat(notionPage) {
        const data = { id: notionPage.id };
        const properties = notionPage.properties;

        Object.keys(properties).forEach(key => {
            const prop = properties[key];
            
            switch (prop.type) {
                case 'title':
                    data[key] = prop.title[0]?.text?.content || '';
                    break;
                case 'rich_text':
                    data[key] = prop.rich_text[0]?.text?.content || '';
                    break;
                case 'number':
                    data[key] = prop.number || 0;
                    break;
                case 'checkbox':
                    data[key] = prop.checkbox || false;
                    break;
                case 'select':
                    data[key] = prop.select?.name || '';
                    break;
                case 'date':
                    data[key] = prop.date?.start || '';
                    break;
                case 'phone_number':
                    data[key] = prop.phone_number || '';
                    break;
            }
        });

        return data;
    }

    /**
     * 同步資料到 Notion
     */
    async syncToNotion(tableName, data, operation = 'create') {
        if (!this.apiKey || !this.databaseIds[tableName]) {
            console.log(`跳過 ${tableName} 的 Notion 同步 - 設定不完整`);
            return null;
        }

        try {
            let response;
            
            if (operation === 'create') {
                // 新增頁面到資料庫
                const notionData = this.transformToNotionFormat(tableName, data);
                notionData.parent = { database_id: this.databaseIds[tableName] };
                
                response = await fetch(`${this.baseUrl}/pages`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(notionData)
                });
                
            } else if (operation === 'update' && data.notionPageId) {
                // 更新現有頁面
                const notionData = this.transformToNotionFormat(tableName, data);
                
                response = await fetch(`${this.baseUrl}/pages/${data.notionPageId}`, {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify(notionData)
                });
            }

            if (response) {
                const result = await this.handleResponse(response);
                console.log(`✅ ${tableName} 資料已同步到 Notion`);
                return result;
            }
            
        } catch (error) {
            console.error(`❌ ${tableName} Notion 同步失敗:`, error);
            throw error;
        }
    }

    /**
     * 從 Notion 獲取資料
     */
    async getFromNotion(tableName, pageSize = 100) {
        if (!this.apiKey || !this.databaseIds[tableName]) {
            console.log(`跳過 ${tableName} 的 Notion 讀取 - 設定不完整`);
            return [];
        }

        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.databaseIds[tableName]}/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    page_size: pageSize,
                    sorts: [
                        {
                            timestamp: 'created_time',
                            direction: 'descending'
                        }
                    ]
                })
            });

            const result = await this.handleResponse(response);
            const transformedData = result.results.map(page => this.transformFromNotionFormat(page));
            
            console.log(`📥 從 Notion 獲取 ${transformedData.length} 筆 ${tableName} 資料`);
            return transformedData;
            
        } catch (error) {
            console.error(`❌ 從 Notion 獲取 ${tableName} 資料失敗:`, error);
            return [];
        }
    }

    /**
     * 查詢 Notion 資料庫 (別名方法，與 getFromNotion 相同功能)
     */
    async queryDatabase(tableName, pageSize = 100) {
        console.log(`🔍 查詢 ${tableName} 資料庫...`);
        
        if (!this.databaseIds[tableName]) {
            console.error(`❌ 找不到 ${tableName} 的資料庫 ID`);
            return { results: [] };
        }

        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.databaseIds[tableName]}/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    page_size: pageSize,
                    sorts: [
                        {
                            timestamp: 'created_time',
                            direction: 'descending'
                        }
                    ]
                })
            });

            const result = await this.handleResponse(response);
            console.log(`✅ 成功查詢到 ${result.results.length} 筆 ${tableName} 資料`);
            return result;
            
        } catch (error) {
            console.error(`❌ 查詢 ${tableName} 資料庫失敗:`, error);
            return { results: [] };
        }
    }

    /**
     * 刪除 Notion 中的資料 (實際上是歸檔)
     */
    async deleteFromNotion(pageId) {
        if (!this.apiKey || !pageId) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    archived: true
                })
            });

            await this.handleResponse(response);
            console.log(`🗑️ Notion 頁面已歸檔: ${pageId}`);
            return true;
            
        } catch (error) {
            console.error('❌ Notion 頁面歸檔失敗:', error);
            return false;
        }
    }

    /**
     * 批次同步資料到 Notion
     */
    async batchSyncToNotion(tableName, dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return [];
        }

        console.log(`🔄 開始批次同步 ${dataArray.length} 筆 ${tableName} 資料到 Notion`);
        const results = [];
        
        // 避免 API 限制，分批處理
        const batchSize = 10;
        for (let i = 0; i < dataArray.length; i += batchSize) {
            const batch = dataArray.slice(i, i + batchSize);
            const batchPromises = batch.map(data => 
                this.syncToNotion(tableName, data, 'create').catch(error => {
                    console.error(`批次同步失敗:`, error);
                    return null;
                })
            );
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(result => result !== null));
            
            // API 限制：避免過於頻繁的請求
            if (i + batchSize < dataArray.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`✅ 批次同步完成，成功同步 ${results.length} 筆資料`);
        return results;
    }

    /**
     * 檢查 Notion 連線狀態
     */
    async checkConnection() {
        if (!this.apiKey) {
            return { connected: false, error: 'API Key 未設定' };
        }

        try {
            // 使用專門的測試端點
            const response = await fetch('/api/test-notion');
            const result = await response.json();
            
            if (result.connected) {
                return { 
                    connected: true, 
                    user: result.user,
                    databases: Object.keys(this.databaseIds).length
                };
            } else {
                return { connected: false, error: result.error };
            }
            
        } catch (error) {
            console.error('Notion 連線測試失敗:', error);
            return { connected: false, error: `連線錯誤: ${error.message}` };
        }
    }
}

// 全域實例
window.notionManager = new NotionDataManager();

console.log('🔗 Notion API 管理器已載入');
