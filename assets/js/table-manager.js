// table-manager.js - 桌況管理系統
class TableManager {
    constructor() {
        this.tables = [];
        this.tableStatuses = ['空閒中', '使用中', '已預訂', '清理中', '維修中'];
        this.tableShapes = ['方形', '圓形', '長形', '吧台'];
        this.reservationHistory = [];
        this.currentOrders = {};
        
        this.initializeTableData();
    }

    // 初始化桌位數據 - 從 Notion 載入
    async initializeTableData() {
        try {
            console.log('📋 開始從 Notion 載入桌況資料...');
            
            const response = await fetch('/api/tables');
            if (!response.ok) {
                throw new Error(`載入桌況失敗: ${response.status}`);
            }
            
            this.tables = await response.json();
            console.log(`✅ 成功載入 ${this.tables.length} 筆桌況資料`);
            
            // 如果沒有資料，使用基本預設資料
            if (this.tables.length === 0) {
                console.log('⚠️ Notion 中沒有桌況資料，使用基本預設資料');
                this.createDefaultTables();
            }
        } catch (error) {
            console.error('❌ 載入桌況資料失敗:', error);
            // 錯誤時使用基本預設資料
            this.createDefaultTables();
        }
    }

    // 建立基本預設桌位（僅作為後備）
    createDefaultTables() {
        this.tables = [
            {
                id: 'default-1',
                tableNumber: '1號桌',
                status: '空閒中',
                maxCapacity: 2,
                currentCapacity: 0,
                shape: '方形',
                location: '前區',
                position: '靠窗',
                isMainTable: false,
                mergeNote: '',
                currentOrder: null,
                currentTotal: 0,
                lastCleaned: new Date().toISOString(),
                isAvailable: true,
                features: ['靠窗'],
                priority: 1
            },
            {
                id: 'default-2',
                tableNumber: '2號桌',
                status: '空閒中',
                maxCapacity: 4,
                currentCapacity: 0,
                shape: '方形',
                location: '中區',
                position: '中央',
                isMainTable: false,
                mergeNote: '',
                currentOrder: null,
                currentTotal: 0,
                lastCleaned: new Date().toISOString(),
                isAvailable: true,
                features: ['標準桌'],
                priority: 2
            }
        ];
    }

    // 重新載入桌況資料
    async refreshTables() {
        await this.initializeTableData();
        return this.tables;
    }

    // 獲取所有桌位
    getAllTables() {
        return this.tables;
    }

    // 根據狀態獲取桌位
    getTablesByStatus(status) {
        return this.tables.filter(table => table.status === status);
    }

    // 獲取可用桌位
    getAvailableTables(partySize = 1) {
        return this.tables.filter(table => 
            table.status === '空閒中' && 
            table.maxCapacity >= partySize &&
            table.isAvailable
        ).sort((a, b) => {
            // 優先推薦容量接近的桌位
            const aDiff = a.maxCapacity - partySize;
            const bDiff = b.maxCapacity - partySize;
            return aDiff - bDiff;
        });
    }

    // 更改桌位狀態
    async updateTableStatus(tableId, newStatus, customerCount = 0) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return false;

        const oldStatus = table.status;
        
        try {
            // 更新到 Notion
            const response = await fetch(`/api/tables/${tableId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus,
                    currentCapacity: customerCount
                })
            });

            if (!response.ok) {
                throw new Error(`更新桌況失敗: ${response.status}`);
            }

            // 本地更新
            table.status = newStatus;
            table.currentCapacity = customerCount;
            
            // 根據狀態更新相關屬性
            if (newStatus === '使用中') {
                table.isAvailable = false;
                table.occupiedSince = new Date().toISOString();
            } else if (newStatus === '空閒中') {
                table.isAvailable = true;
                table.currentCapacity = 0;
                table.currentOrder = null;
                table.currentTotal = 0;
                table.occupiedSince = null;
                table.lastCleaned = new Date().toISOString();
            }

            console.log(`✅ 桌位 ${table.tableNumber} 狀態已更新: ${oldStatus} → ${newStatus}`);
            return true;
        } catch (error) {
            console.error('❌ 更新桌況狀態失敗:', error);
            return false;
        }
    }

    // 獲取特定桌位
    getTableById(tableId) {
        return this.tables.find(table => table.id === tableId);
    }

    // 獲取桌位詳細資訊
    getTableDetails(tableId) {
        const table = this.getTableById(tableId);
        if (!table) return null;

        return {
            ...table,
            statusDisplay: this.getStatusDisplay(table.status),
            occupiedTime: table.occupiedSince ? 
                this.calculateOccupiedTime(table.occupiedSince) : null,
            isOvertime: table.occupiedSince ? 
                this.isTableOvertime(table.occupiedSince) : false
        };
    }

    // 獲取狀態顯示文字
    getStatusDisplay(status) {
        const statusMap = {
            '空閒中': { text: '空閒中', color: 'success' },
            '使用中': { text: '使用中', color: 'warning' },
            '已預訂': { text: '已預訂', color: 'info' },
            '清理中': { text: '清理中', color: 'secondary' },
            '維修中': { text: '維修中', color: 'danger' }
        };
        return statusMap[status] || { text: status, color: 'secondary' };
    }

    // 計算使用時間
    calculateOccupiedTime(occupiedSince) {
        const now = new Date();
        const occupied = new Date(occupiedSince);
        const diffMs = now - occupied;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}小時${minutes}分鐘`;
        } else {
            return `${minutes}分鐘`;
        }
    }

    // 檢查是否超時
    isTableOvertime(occupiedSince, maxHours = 2) {
        const now = new Date();
        const occupied = new Date(occupiedSince);
        const diffHours = (now - occupied) / (1000 * 60 * 60);
        return diffHours > maxHours;
    }

    // 獲取桌況統計
    getTableStatistics() {
        const stats = {
            total: this.tables.length,
            available: 0,
            occupied: 0,
            reserved: 0,
            cleaning: 0,
            maintenance: 0,
            totalCapacity: 0,
            occupiedCapacity: 0
        };

        this.tables.forEach(table => {
            stats.totalCapacity += table.maxCapacity;
            
            switch (table.status) {
                case '空閒中':
                    stats.available++;
                    break;
                case '使用中':
                    stats.occupied++;
                    stats.occupiedCapacity += table.currentCapacity;
                    break;
                case '已預訂':
                    stats.reserved++;
                    break;
                case '清理中':
                    stats.cleaning++;
                    break;
                case '維修中':
                    stats.maintenance++;
                    break;
            }
        });

        stats.occupancyRate = stats.totalCapacity > 0 ? 
            Math.round((stats.occupiedCapacity / stats.totalCapacity) * 100) : 0;

        return stats;
    }

    // 搜尋桌位
    searchTables(query) {
        const searchTerm = query.toLowerCase();
        return this.tables.filter(table => 
            table.tableNumber.toLowerCase().includes(searchTerm) ||
            table.location.toLowerCase().includes(searchTerm) ||
            table.status.toLowerCase().includes(searchTerm) ||
            table.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }

    // 清理桌位
    async cleanTable(tableId) {
        return await this.updateTableStatus(tableId, '清理中');
    }

    // 完成清理
    async finishCleaning(tableId) {
        return await this.updateTableStatus(tableId, '空閒中');
    }

    // 預訂桌位
    async reserveTable(tableId, reservationData) {
        const success = await this.updateTableStatus(tableId, '已預訂');
        if (success) {
            const table = this.getTableById(tableId);
            if (table) {
                table.reservationRecord = reservationData;
            }
        }
        return success;
    }

    // 取消預訂
    async cancelReservation(tableId) {
        const success = await this.updateTableStatus(tableId, '空閒中');
        if (success) {
            const table = this.getTableById(tableId);
            if (table) {
                table.reservationRecord = null;
            }
        }
        return success;
    }

    // 獲取需要清理的桌位
    getTablesNeedCleaning() {
        return this.tables.filter(table => 
            table.status === '使用中' && 
            table.occupiedSince &&
            this.isTableOvertime(table.occupiedSince, 1.5) // 1.5小時後提醒清理
        );
    }

    // 獲取空閒時間過長的桌位
    getIdleTables(maxIdleHours = 3) {
        const now = new Date();
        return this.tables.filter(table => {
            if (table.status !== '空閒中' || !table.lastCleaned) return false;
            const lastCleaned = new Date(table.lastCleaned);
            const idleHours = (now - lastCleaned) / (1000 * 60 * 60);
            return idleHours > maxIdleHours;
        });
    }

    // 安排客人入座
    async seatCustomers(tableId, customerCount) {
        const table = this.getTableById(tableId);
        if (!table) {
            return { success: false, message: '找不到指定桌位' };
        }

        if (table.status !== '空閒中') {
            return { success: false, message: '此桌位目前不可使用' };
        }

        if (customerCount > table.maxCapacity) {
            return { success: false, message: `人數超過桌位容量 (最多${table.maxCapacity}人)` };
        }

        try {
            const success = await this.updateTableStatus(tableId, '使用中', customerCount);
            if (success) {
                return { 
                    success: true, 
                    message: `${table.tableNumber} 已安排 ${customerCount} 位客人入座` 
                };
            } else {
                return { success: false, message: '更新桌況狀態失敗' };
            }
        } catch (error) {
            console.error('安排入座失敗:', error);
            return { success: false, message: '安排入座時發生錯誤' };
        }
    }

    // 清空桌位
    async clearTable(tableId) {
        const table = this.getTableById(tableId);
        if (!table) {
            return { success: false, message: '找不到指定桌位' };
        }

        if (table.status === '空閒中') {
            return { success: false, message: '此桌位已經是空閒狀態' };
        }

        // 檢查是否有未結帳金額
        if (table.currentTotal > 0) {
            return { 
                success: false, 
                message: '請先完成結帳', 
                unpaidAmount: table.currentTotal 
            };
        }

        try {
            const success = await this.updateTableStatus(tableId, '清理中');
            if (success) {
                return { 
                    success: true, 
                    message: `${table.tableNumber} 已清空，正在清理中` 
                };
            } else {
                return { success: false, message: '更新桌況狀態失敗' };
            }
        } catch (error) {
            console.error('清空桌位失敗:', error);
            return { success: false, message: '清空桌位時發生錯誤' };
        }
    }
}

// 匯出供其他模組使用
window.TableManager = TableManager;
