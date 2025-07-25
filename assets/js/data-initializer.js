// 資料初始化腳本
class DataInitializer {
    constructor() {
        this.dataManager = window.DataManager;
        this.csvFiles = [
            { name: '桌況管理.csv', table: 'tables' },
            { name: '最終菜色.csv', table: 'menu' },
            { name: '訂單總覽.csv', table: 'orders' },
            { name: '訂位紀錄.csv', table: 'reservations' },
            { name: '食材庫 237fd5adc30b808cbba3c03f8f2065fd.csv', table: 'inventory' },
            { name: '採購單.csv', table: 'purchases' },
            { name: '半成品 237fd5adc30b80c09b59c03cd67c6432.csv', table: 'recipes' }
        ];
    }

    // 初始化所有資料
    async initializeAllData() {
        console.log('開始初始化資料...');
        
        try {
            // 等待資料庫準備就緒
            await this.waitForDatabase();
            
            // 檢查是否已經初始化過
            if (await this.isDataInitialized()) {
                console.log('資料已經初始化過了');
                return;
            }
            
            // 載入 CSV 資料
            await this.loadCSVData();
            
            // 創建預設資料
            await this.createDefaultData();
            
            // 標記為已初始化
            localStorage.setItem('dataInitialized', 'true');
            
            console.log('資料初始化完成！');
            
        } catch (error) {
            console.error('資料初始化失敗:', error);
        }
    }

    async waitForDatabase() {
        return new Promise((resolve) => {
            const checkDB = () => {
                if (this.dataManager && this.dataManager.db) {
                    resolve();
                } else {
                    setTimeout(checkDB, 100);
                }
            };
            checkDB();
        });
    }

    async isDataInitialized() {
        return localStorage.getItem('dataInitialized') === 'true';
    }

    async loadCSVData() {
        for (const file of this.csvFiles) {
            try {
                const csvData = await this.loadCSVFile(file.name);
                if (csvData) {
                    await this.dataManager.importFromCSV(file.table, csvData);
                    console.log(`已載入 ${file.name} 到 ${file.table} 表`);
                }
            } catch (error) {
                console.error(`載入 ${file.name} 失敗:`, error);
            }
        }
    }

    async loadCSVFile(filename) {
        try {
            const response = await fetch(`data/${filename}`);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn(`無法載入 CSV 檔案: ${filename}`);
        }
        return null;
    }

    async createDefaultData() {
        // 創建預設桌況資料（如果沒有從 CSV 載入）
        const existingTables = await this.dataManager.getAll('tables');
        if (existingTables.length === 0) {
            console.log('創建預設桌況資料...');
            for (let i = 1; i <= 12; i++) {
                await this.dataManager.add('tables', {
                    tableNumber: i.toString(),
                    status: '空桌',
                    capacity: 4,
                    location: i <= 6 ? '1樓' : '2樓'
                });
            }
        }

        // 創建預設菜單分類
        const existingMenu = await this.dataManager.getAll('menu');
        if (existingMenu.length === 0) {
            console.log('創建預設菜單資料...');
            const defaultMenuItems = [
                {
                    name: '紅燒肉',
                    category: '主菜',
                    price: 180,
                    description: '經典紅燒肉，肥瘦相間',
                    available: true
                },
                {
                    name: '蒜泥白肉',
                    category: '主菜', 
                    price: 160,
                    description: '清爽蒜泥白肉片',
                    available: true
                },
                {
                    name: '青菜豆腐湯',
                    category: '湯品',
                    price: 80,
                    description: '清淡營養的青菜豆腐湯',
                    available: true
                },
                {
                    name: '白飯',
                    category: '主食',
                    price: 25,
                    description: '香Q白米飯',
                    available: true
                }
            ];

            for (const item of defaultMenuItems) {
                await this.dataManager.add('menu', item);
            }
        }

        // 創建預設供應商資料
        const existingSuppliers = await this.dataManager.getAll('suppliers');
        if (existingSuppliers.length === 0) {
            console.log('創建預設供應商資料...');
            const defaultSuppliers = [
                {
                    name: '新鮮農場',
                    category: '蔬菜',
                    contact: '02-1234-5678',
                    email: 'farm@example.com',
                    address: '台北市信義區農場路123號'
                },
                {
                    name: '優質肉品',
                    category: '肉類',
                    contact: '02-8765-4321',
                    email: 'meat@example.com',
                    address: '台北市大安區肉品街456號'
                }
            ];

            for (const supplier of defaultSuppliers) {
                await this.dataManager.add('suppliers', supplier);
            }
        }
    }

    // 重置所有資料（開發用）
    async resetAllData() {
        if (confirm('確定要重置所有資料嗎？此操作無法復原！')) {
            try {
                // 清空所有表
                for (const tableName of Object.values(this.dataManager.tables)) {
                    const transaction = this.dataManager.db.transaction([tableName], 'readwrite');
                    const store = transaction.objectStore(tableName);
                    await store.clear();
                }
                
                // 移除初始化標記
                localStorage.removeItem('dataInitialized');
                
                // 重新初始化
                await this.initializeAllData();
                
                console.log('資料重置完成！');
                alert('資料重置完成！');
                
            } catch (error) {
                console.error('資料重置失敗:', error);
                alert('資料重置失敗！');
            }
        }
    }

    // 匯出所有資料
    async exportAllData() {
        try {
            const backup = await this.dataManager.backup();
            const blob = new Blob([backup], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `tanawat-restaurant-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('資料匯出完成！');
            
        } catch (error) {
            console.error('資料匯出失敗:', error);
            alert('資料匯出失敗！');
        }
    }

    // 匯入資料
    async importData(file) {
        try {
            const text = await file.text();
            await this.dataManager.restore(text);
            
            console.log('資料匯入完成！');
            alert('資料匯入完成！');
            
        } catch (error) {
            console.error('資料匯入失敗:', error);
            alert('資料匯入失敗！');
        }
    }

    // 建立開發者工具
    createDevTools() {
        // 只在開發環境顯示
        if (!window.location.hostname.includes('localhost') && 
            !window.location.hostname.includes('127.0.0.1')) {
            return;
        }

        const devToolsHTML = `
            <div id="dev-tools" style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 10000;
                display: none;
            ">
                <h4>開發者工具</h4>
                <button onclick="dataInitializer.resetAllData()">重置資料</button>
                <button onclick="dataInitializer.exportAllData()">匯出資料</button>
                <input type="file" id="import-file" accept=".json" style="display:none">
                <button onclick="document.getElementById('import-file').click()">匯入資料</button>
                <button onclick="document.getElementById('dev-tools').style.display='none'">關閉</button>
            </div>
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: #007acc;
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 10px;
                cursor: pointer;
                z-index: 9999;
            " onclick="document.getElementById('dev-tools').style.display='block'">
                DEV
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', devToolsHTML);

        // 匯入檔案事件
        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
            }
        });
    }
}

// 建立全域資料初始化器
window.dataInitializer = new DataInitializer();

// 當頁面載入完成時自動初始化資料
document.addEventListener('DOMContentLoaded', () => {
    // 等待一下讓 DataManager 完全載入
    setTimeout(() => {
        window.dataInitializer.initializeAllData();
        window.dataInitializer.createDevTools();
    }, 1000);
});
