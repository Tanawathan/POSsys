// 資料庫配置和管理系統
class DataManager {
    constructor() {
        this.dbName = 'TanawatRestaurantDB';
        this.dbVersion = 1;
        this.db = null;
        this.config = window.APP_CONFIG || {};
        
        // 資料表定義
        this.tables = {
            orders: 'orders',
            menu: 'menu', 
            tables: 'tables',
            reservations: 'reservations',
            inventory: 'inventory',
            purchases: 'purchases',
            recipes: 'recipes',
            suppliers: 'suppliers'
        };
        
        this.initializeDB();
    }

    // 初始化 IndexedDB
    async initializeDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('資料庫初始化完成');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 創建訂單表
                if (!db.objectStoreNames.contains(this.tables.orders)) {
                    const orderStore = db.createObjectStore(this.tables.orders, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    orderStore.createIndex('tableNumber', 'tableNumber', { unique: false });
                    orderStore.createIndex('status', 'status', { unique: false });
                    orderStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // 創建菜單表
                if (!db.objectStoreNames.contains(this.tables.menu)) {
                    const menuStore = db.createObjectStore(this.tables.menu, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    menuStore.createIndex('category', 'category', { unique: false });
                    menuStore.createIndex('name', 'name', { unique: false });
                }
                
                // 創建桌況表
                if (!db.objectStoreNames.contains(this.tables.tables)) {
                    const tableStore = db.createObjectStore(this.tables.tables, { 
                        keyPath: 'tableNumber' 
                    });
                    tableStore.createIndex('status', 'status', { unique: false });
                }
                
                // 創建訂位表
                if (!db.objectStoreNames.contains(this.tables.reservations)) {
                    const reservationStore = db.createObjectStore(this.tables.reservations, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    reservationStore.createIndex('date', 'date', { unique: false });
                    reservationStore.createIndex('customerName', 'customerName', { unique: false });
                }
                
                // 創建庫存表
                if (!db.objectStoreNames.contains(this.tables.inventory)) {
                    const inventoryStore = db.createObjectStore(this.tables.inventory, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    inventoryStore.createIndex('itemName', 'itemName', { unique: false });
                    inventoryStore.createIndex('category', 'category', { unique: false });
                }
                
                // 創建採購表
                if (!db.objectStoreNames.contains(this.tables.purchases)) {
                    const purchaseStore = db.createObjectStore(this.tables.purchases, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    purchaseStore.createIndex('supplierId', 'supplierId', { unique: false });
                    purchaseStore.createIndex('status', 'status', { unique: false });
                }
                
                // 創建食譜表
                if (!db.objectStoreNames.contains(this.tables.recipes)) {
                    const recipeStore = db.createObjectStore(this.tables.recipes, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    recipeStore.createIndex('menuItemId', 'menuItemId', { unique: false });
                }
                
                // 創建供應商表
                if (!db.objectStoreNames.contains(this.tables.suppliers)) {
                    const supplierStore = db.createObjectStore(this.tables.suppliers, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    supplierStore.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    // 通用資料操作方法
    async add(tableName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            
            // 添加時間戳
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            
            const request = store.add(data);
            
            request.onsuccess = () => {
                console.log(`資料已添加到 ${tableName}:`, data);
                // 同步到雲端
                this.syncToCloud(tableName, 'add', data);
                resolve(request.result);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async update(tableName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            
            // 更新時間戳
            data.updatedAt = new Date().toISOString();
            
            const request = store.put(data);
            
            request.onsuccess = () => {
                console.log(`資料已更新在 ${tableName}:`, data);
                // 同步到雲端
                this.syncToCloud(tableName, 'update', data);
                resolve(request.result);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async get(tableName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(tableName, indexName = null, indexValue = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            
            let request;
            if (indexName && indexValue) {
                const index = store.index(indexName);
                request = index.getAll(indexValue);
            } else {
                request = store.getAll();
            }
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(tableName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store.delete(key);
            
            request.onsuccess = () => {
                console.log(`資料已從 ${tableName} 刪除，ID:`, key);
                // 同步到雲端
                this.syncToCloud(tableName, 'delete', { id: key });
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    // 雲端同步 (支援 Notion API 和 Make.com Webhooks)
    async syncToCloud(tableName, operation, data) {
        if (!this.config) return;
        
        const syncMethod = this.config.syncMethod || 'notion';
        
        try {
            // 根據設定選擇同步方式
            if (syncMethod === 'notion' || syncMethod === 'both') {
                await this.syncToNotion(tableName, operation, data);
            }
            
            if (syncMethod === 'make' || syncMethod === 'both') {
                await this.syncToMake(tableName, operation, data);
            }
        } catch (error) {
            console.error('雲端同步失敗:', error);
            this.addToOfflineQueue(tableName, operation, data);
        }
    }

    // Notion API 同步
    async syncToNotion(tableName, operation, data) {
        if (!window.notionManager) {
            console.warn('Notion Manager 未載入');
            return;
        }

        try {
            let result = null;
            
            switch (operation) {
                case 'add':
                    result = await window.notionManager.syncToNotion(tableName, data, 'create');
                    // 將 Notion 頁面 ID 儲存到本地資料
                    if (result && result.id && data.id) {
                        await this.updateNotionPageId(tableName, data.id, result.id);
                    }
                    break;
                    
                case 'update':
                    // 檢查是否有 Notion 頁面 ID
                    const existingData = await this.get(tableName, data.id);
                    if (existingData && existingData.notionPageId) {
                        data.notionPageId = existingData.notionPageId;
                        result = await window.notionManager.syncToNotion(tableName, data, 'update');
                    } else {
                        // 如果沒有 Notion 頁面 ID，建立新頁面
                        result = await window.notionManager.syncToNotion(tableName, data, 'create');
                        if (result && result.id) {
                            await this.updateNotionPageId(tableName, data.id, result.id);
                        }
                    }
                    break;
                    
                case 'delete':
                    const dataToDelete = await this.get(tableName, data.id);
                    if (dataToDelete && dataToDelete.notionPageId) {
                        result = await window.notionManager.deleteFromNotion(dataToDelete.notionPageId);
                    }
                    break;
            }
            
            if (result) {
                console.log(`✅ ${tableName} 資料已同步到 Notion: ${operation}`);
            }
            
        } catch (error) {
            console.error(`❌ Notion 同步失敗 (${tableName} - ${operation}):`, error);
            throw error;
        }
    }

    // Make.com Webhook 同步 (備用方案)
    async syncToMake(tableName, operation, data) {
        const webhookUrl = this.getWebhookUrl(tableName, operation);
        if (!webhookUrl) return;
        
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table: tableName,
                    operation: operation,
                    data: data,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log(`✅ ${tableName} 資料已同步到 Make.com: ${operation}`);
            } else {
                throw new Error(`Make.com API 回應錯誤: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Make.com 同步失敗 (${tableName} - ${operation}):`, error);
            throw error;
        }
    }

    // 更新本地資料的 Notion 頁面 ID
    async updateNotionPageId(tableName, localId, notionPageId) {
        try {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const data = await store.get(localId);
            
            if (data) {
                data.notionPageId = notionPageId;
                data.updatedAt = new Date().toISOString();
                await store.put(data);
                console.log(`📝 已記錄 Notion 頁面 ID: ${notionPageId}`);
            }
        } catch (error) {
            console.error('更新 Notion 頁面 ID 失敗:', error);
        }
    }

    getWebhookUrl(tableName, operation) {
        // 如果設定中有 makeWebhooks，使用新的結構
        if (this.config.makeWebhooks) {
            const webhookMap = {
                orders: this.config.makeWebhooks.orderWebhookUrl,
                menu: this.config.makeWebhooks.menuWebhookUrl,
                tables: this.config.makeWebhooks.tableWebhookUrl,
                reservations: this.config.makeWebhooks.reservationWebhookUrl,
                inventory: this.config.makeWebhooks.inventoryWebhookUrl,
                purchases: this.config.makeWebhooks.purchaseWebhookUrl,
                recipes: this.config.makeWebhooks.recipeWebhookUrl,
                suppliers: this.config.makeWebhooks.supplierWebhookUrl
            };
            return webhookMap[tableName];
        }
        
        // 向下相容舊的設定格式
        const webhookMap = {
            orders: this.config.orderWebhookUrl,
            menu: this.config.menuWebhookUrl,
            tables: this.config.tableWebhookUrl,
            reservations: this.config.reservationWebhookUrl,
            inventory: this.config.inventoryWebhookUrl,
            purchases: this.config.purchaseWebhookUrl,
            recipes: this.config.recipeWebhookUrl,
            suppliers: this.config.supplierWebhookUrl
        };
        
        return webhookMap[tableName];
    }

    // 離線佇列機制
    addToOfflineQueue(tableName, operation, data) {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        queue.push({
            table: tableName,
            operation: operation,
            data: data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
    }

    async processOfflineQueue() {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        const successful = [];
        
        for (const item of queue) {
            try {
                await this.syncToCloud(item.table, item.operation, item.data);
                successful.push(item);
            } catch (error) {
                console.error('離線佇列處理失敗:', error);
            }
        }
        
        // 移除成功處理的項目
        const remaining = queue.filter(item => !successful.includes(item));
        localStorage.setItem('offlineQueue', JSON.stringify(remaining));
    }

    // 從 CSV 匯入初始資料
    async importFromCSV(tableName, csvData) {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const record = {};
            
            headers.forEach((header, index) => {
                record[header] = values[index];
            });
            
            try {
                await this.add(tableName, record);
            } catch (error) {
                console.error(`匯入資料失敗 (行 ${i}):`, error);
            }
        }
    }

    // 匯出資料為 CSV
    async exportToCSV(tableName) {
        const data = await this.getAll(tableName);
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    // 備份資料庫
    async backup() {
        const backup = {};
        
        for (const tableName of Object.values(this.tables)) {
            backup[tableName] = await this.getAll(tableName);
        }
        
        const backupData = {
            timestamp: new Date().toISOString(),
            version: this.dbVersion,
            data: backup
        };
        
        return JSON.stringify(backupData, null, 2);
    }

    // 還原資料庫
    async restore(backupData) {
        const backup = JSON.parse(backupData);
        
        for (const [tableName, records] of Object.entries(backup.data)) {
            if (!Object.values(this.tables).includes(tableName)) continue;
            
            // 清空現有資料
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            await store.clear();
            
            // 還原資料
            for (const record of records) {
                await this.add(tableName, record);
            }
        }
        
        console.log('資料庫還原完成');
    }
}

// 建立全域資料管理器實例
window.DataManager = new DataManager();

// 當頁面載入時處理離線佇列
window.addEventListener('load', () => {
    if (window.DataManager) {
        window.DataManager.processOfflineQueue();
    }
});

// 定期處理離線佇列 (每5分鐘)
setInterval(() => {
    if (window.DataManager) {
        window.DataManager.processOfflineQueue();
    }
}, 5 * 60 * 1000);
