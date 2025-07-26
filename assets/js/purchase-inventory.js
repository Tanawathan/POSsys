// 採購管理系統 - 與供應商管理整合
class PurchaseManager {
    constructor() {
        this.purchases = this.loadPurchasesData();
        this.suppliers = this.loadSuppliersData();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderPurchases();
        this.updateStats();
    }

    loadSuppliersData() {
        // 從供應商管理系統載入資料
        const saved = localStorage.getItem('suppliersData');
        return saved ? JSON.parse(saved) : [];
    }

    loadPurchasesData() {
        const saved = localStorage.getItem('purchasesData');
        if (saved) {
            return JSON.parse(saved).map(purchase => ({
                ...purchase,
                orderDate: new Date(purchase.orderDate),
                expectedDelivery: new Date(purchase.expectedDelivery),
                actualDelivery: purchase.actualDelivery ? new Date(purchase.actualDelivery) : null
            }));
        }
        return [];
    }

    // 新增採購訂單
    createPurchaseOrder(supplierId, items, notes = '') {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) {
            throw new Error('找不到指定的供應商');
        }

        const purchase = {
            id: this.generatePurchaseId(),
            supplierId: supplierId,
            supplierName: supplier.name,
            items: items,
            totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
            status: 'pending', // pending, confirmed, delivered, cancelled
            orderDate: new Date(),
            expectedDelivery: this.calculateExpectedDelivery(),
            actualDelivery: null,
            notes: notes,
            createdBy: 'POS系統',
            lastUpdated: new Date()
        };

        this.purchases.push(purchase);
        this.saveToStorage();
        return purchase;
    }

    generatePurchaseId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const sequence = this.purchases.filter(p => 
            p.id.startsWith(`PO${dateStr}`)
        ).length + 1;
        return `PO${dateStr}${sequence.toString().padStart(3, '0')}`;
    }

    calculateExpectedDelivery(days = 3) {
        const delivery = new Date();
        delivery.setDate(delivery.getDate() + days);
        return delivery;
    }

    // 更新採購訂單狀態
    updatePurchaseStatus(purchaseId, status, actualDelivery = null) {
        const purchase = this.purchases.find(p => p.id === purchaseId);
        if (purchase) {
            purchase.status = status;
            purchase.lastUpdated = new Date();
            
            if (status === 'delivered' && actualDelivery) {
                purchase.actualDelivery = actualDelivery;
            }
            
            this.saveToStorage();
            this.renderPurchases();
            this.updateStats();
        }
    }

    // 取得供應商的採購歷史
    getSupplierPurchaseHistory(supplierId) {
        return this.purchases
            .filter(p => p.supplierId === supplierId)
            .sort((a, b) => b.orderDate - a.orderDate);
    }

    // 計算供應商績效
    calculateSupplierPerformance(supplierId) {
        const history = this.getSupplierPurchaseHistory(supplierId);
        
        if (history.length === 0) {
            return {
                totalOrders: 0,
                totalAmount: 0,
                onTimeDeliveryRate: 0,
                averageDeliveryDays: 0
            };
        }

        const totalOrders = history.length;
        const totalAmount = history.reduce((sum, p) => sum + p.totalAmount, 0);
        
        const deliveredOrders = history.filter(p => p.status === 'delivered' && p.actualDelivery);
        const onTimeDeliveries = deliveredOrders.filter(p => p.actualDelivery <= p.expectedDelivery);
        const onTimeDeliveryRate = deliveredOrders.length > 0 ? 
            (onTimeDeliveries.length / deliveredOrders.length) * 100 : 0;

        const averageDeliveryDays = deliveredOrders.length > 0 ?
            deliveredOrders.reduce((sum, p) => {
                const days = Math.ceil((p.actualDelivery - p.orderDate) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0) / deliveredOrders.length : 0;

        return {
            totalOrders,
            totalAmount,
            onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
            averageDeliveryDays: Math.round(averageDeliveryDays)
        };
    }

    // 產生採購報表
    generatePurchaseReport(startDate, endDate) {
        const filteredPurchases = this.purchases.filter(p => 
            p.orderDate >= startDate && p.orderDate <= endDate
        );

        const supplierStats = {};
        filteredPurchases.forEach(purchase => {
            if (!supplierStats[purchase.supplierId]) {
                supplierStats[purchase.supplierId] = {
                    name: purchase.supplierName,
                    orders: 0,
                    totalAmount: 0,
                    performance: this.calculateSupplierPerformance(purchase.supplierId)
                };
            }
            supplierStats[purchase.supplierId].orders++;
            supplierStats[purchase.supplierId].totalAmount += purchase.totalAmount;
        });

        return {
            period: { startDate, endDate },
            totalPurchases: filteredPurchases.length,
            totalAmount: filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
            supplierStats: Object.values(supplierStats),
            statusBreakdown: this.getStatusBreakdown(filteredPurchases)
        };
    }

    getStatusBreakdown(purchases) {
        const breakdown = { pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };
        purchases.forEach(p => {
            breakdown[p.status] = (breakdown[p.status] || 0) + 1;
        });
        return breakdown;
    }

    saveToStorage() {
        localStorage.setItem('purchasesData', JSON.stringify(this.purchases));
    }

    bindEvents() {
        // 實作事件綁定
    }

    renderPurchases() {
        // 實作渲染邏輯
    }

    updateStats() {
        // 實作統計更新
    }
}

// 庫存管理系統 - 與供應商關聯
class InventoryManager {
    constructor() {
        this.inventory = this.loadInventoryData();
        this.suppliers = this.loadSuppliersData();
        this.init();
    }

    loadSuppliersData() {
        const saved = localStorage.getItem('suppliersData');
        return saved ? JSON.parse(saved) : [];
    }

    loadInventoryData() {
        const saved = localStorage.getItem('inventoryData');
        if (saved) {
            return JSON.parse(saved).map(item => ({
                ...item,
                lastUpdated: new Date(item.lastUpdated),
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : null
            }));
        }
        return this.getDefaultInventory();
    }

    getDefaultInventory() {
        return [
            {
                id: 'EGG001',
                name: '雞蛋',
                category: '蛋品',
                currentStock: 120,
                minStock: 50,
                maxStock: 200,
                unit: '顆',
                unitCost: 5,
                supplierId: 'YZ',
                supplierName: '益州蛋行',
                location: '冷藏區A1',
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                lastUpdated: new Date()
            },
            {
                id: 'PORK001',
                name: '豬肉片',
                category: '肉品',
                currentStock: 25,
                minStock: 20,
                maxStock: 80,
                unit: '公斤',
                unitCost: 180,
                supplierId: 'YJ',
                supplierName: '洋基肉品商行',
                location: '冷凍區B2',
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                lastUpdated: new Date()
            }
        ];
    }

    // 檢查需要補貨的項目
    getLowStockItems() {
        return this.inventory.filter(item => item.currentStock <= item.minStock);
    }

    // 檢查即將過期的項目
    getExpiringItems(days = 3) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() + days);
        
        return this.inventory.filter(item => 
            item.expiryDate && item.expiryDate <= checkDate
        );
    }

    // 根據供應商分組庫存
    getInventoryBySupplier() {
        const grouped = {};
        this.inventory.forEach(item => {
            if (!grouped[item.supplierId]) {
                grouped[item.supplierId] = {
                    supplier: this.suppliers.find(s => s.id === item.supplierId),
                    items: []
                };
            }
            grouped[item.supplierId].items.push(item);
        });
        return grouped;
    }

    // 建議採購清單
    generatePurchaseSuggestions() {
        const lowStockItems = this.getLowStockItems();
        const suggestions = {};

        lowStockItems.forEach(item => {
            if (!suggestions[item.supplierId]) {
                suggestions[item.supplierId] = {
                    supplier: this.suppliers.find(s => s.id === item.supplierId),
                    items: []
                };
            }

            const suggestedQuantity = item.maxStock - item.currentStock;
            suggestions[item.supplierId].items.push({
                ...item,
                suggestedQuantity,
                estimatedCost: suggestedQuantity * item.unitCost
            });
        });

        return suggestions;
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // 實作事件綁定
    }

    updateDisplay() {
        // 實作顯示更新
    }

    saveToStorage() {
        localStorage.setItem('inventoryData', JSON.stringify(this.inventory));
    }
}

// 整合供應商績效分析
class SupplierAnalytics {
    constructor(supplierManager, purchaseManager, inventoryManager) {
        this.supplierManager = supplierManager;
        this.purchaseManager = purchaseManager;
        this.inventoryManager = inventoryManager;
    }

    // 生成供應商綜合報告
    generateSupplierReport(supplierId) {
        const supplier = this.supplierManager.suppliers.find(s => s.id === supplierId);
        if (!supplier) return null;

        const purchaseHistory = this.purchaseManager.getSupplierPurchaseHistory(supplierId);
        const performance = this.purchaseManager.calculateSupplierPerformance(supplierId);
        const inventory = this.inventoryManager.inventory.filter(item => item.supplierId === supplierId);

        return {
            supplier,
            purchaseHistory,
            performance,
            currentInventory: inventory,
            recommendations: this.generateRecommendations(supplier, performance, inventory)
        };
    }

    generateRecommendations(supplier, performance, inventory) {
        const recommendations = [];

        // 根據準時交貨率提出建議
        if (performance.onTimeDeliveryRate < 80) {
            recommendations.push({
                type: 'warning',
                message: '準時交貨率偏低，建議與供應商討論改善配送時間'
            });
        }

        // 根據庫存狀況提出建議
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
        if (lowStockItems.length > 0) {
            recommendations.push({
                type: 'action',
                message: `有 ${lowStockItems.length} 項商品庫存偏低，建議儘快補貨`
            });
        }

        // 根據採購金額提出建議
        if (performance.totalAmount > 100000) {
            recommendations.push({
                type: 'opportunity',
                message: '採購金額較高，可考慮談判更優惠的價格條件'
            });
        }

        return recommendations;
    }
}

// 匯出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PurchaseManager, InventoryManager, SupplierAnalytics };
}
