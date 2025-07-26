/**
 * 採購管理系統
 * 管理採購單、採購項目、供應商、庫存等功能
 */

class PurchaseManager {
    constructor() {
        this.purchaseOrders = [];
        this.purchaseItems = [];
        this.suppliers = [];
        this.inventory = new Map();
        this.init();
    }

    /**
     * 初始化採購管理系統
     */
    init() {
        this.loadPurchaseData();
        this.calculateInventory();
        this.checkExpiryAlerts();
    }

    /**
     * 載入採購資料
     */
    loadPurchaseData() {
        // 基於CSV資料建立採購單
        this.purchaseOrders = [
            {
                id: '菜商0723',
                supplier: 'CS',
                supplierName: 'CS蔬菜供應商',
                date: '2023-07-23',
                totalAmount: 0,
                responsible: '',
                notes: '',
                status: '已到貨',
                items: [
                    '花生仁', '韭菜', '大辣椒', '菜豆', '豆芽菜', '菜脯',
                    '無子檸檬', '糯米椒', '小黃瓜', '紅葱穗', '高麗菜', 
                    '小番茄', '空心菜', '洋蔥', '白花菜', '青花菜'
                ],
                deliveryDate: '2023-07-23',
                category: '蔬菜類'
            },
            {
                id: '東莉0723',
                supplier: 'DL',
                supplierName: '東莉肉品供應商',
                date: '2023-07-23',
                totalAmount: 0,
                responsible: '',
                notes: '',
                status: '已到貨',
                items: ['二節翅', '雞塊', '玉米塊'],
                deliveryDate: '2023-07-23',
                category: '肉品類'
            }
        ];

        // 建立採購項目詳細資料
        this.purchaseItems = [
            // 蔬菜類
            { name: '花生仁', ingredient: '花生仁', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 180, inStock: true, weight: 600, category: '堅果類', expiryDays: 30 },
            { name: '韭菜', ingredient: '韭菜', quantity: 0.5, unit: '斤', orderId: '菜商0723', amount: 40, inStock: true, weight: 300, category: '蔬菜類', expiryDays: 7 },
            { name: '大辣椒', ingredient: '大辣椒', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 120, inStock: true, weight: 600, category: '蔬菜類', expiryDays: 14 },
            { name: '菜豆', ingredient: '菜豆', quantity: 2, unit: '斤', orderId: '菜商0723', amount: 160, inStock: true, weight: 1200, category: '蔬菜類', expiryDays: 10 },
            { name: '豆芽菜', ingredient: '豆芽菜', quantity: 2, unit: '斤', orderId: '菜商0723', amount: 80, inStock: true, weight: 1200, category: '蔬菜類', expiryDays: 3 },
            { name: '菜脯', ingredient: '菜脯', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 200, inStock: true, weight: 600, category: '醃製品', expiryDays: 90 },
            { name: '無子檸檬', ingredient: '無子檸檬', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 150, inStock: true, weight: 600, category: '水果類', expiryDays: 14 },
            { name: '糯米椒', ingredient: '糯米椒', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 180, inStock: true, weight: 600, category: '蔬菜類', expiryDays: 10 },
            { name: '小黃瓜', ingredient: '小黃瓜', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 80, inStock: true, weight: 600, category: '蔬菜類', expiryDays: 10 },
            { name: '紅葱穗', ingredient: '紅葱穗', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 200, inStock: true, weight: 600, category: '調味類', expiryDays: 21 },
            { name: '高麗菜', ingredient: '高麗菜', quantity: 700, unit: '顆', orderId: '菜商0723', amount: 150, inStock: true, weight: 700, category: '蔬菜類', expiryDays: 14 },
            { name: '小番茄', ingredient: '小番茄', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 120, inStock: true, weight: 600, category: '蔬菜類', expiryDays: 10 },
            { name: '空心菜', ingredient: '空心菜', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 60, inStock: true, weight: 600, category: '蔬菜類', expiryDays: 5 },
            { name: '洋蔥', ingredient: '洋蔥', quantity: 1, unit: '斤', orderId: '菜商0723', amount: 60, inStock: true, weight: 600, category: '蔬菜類', expiryDays: 30 },
            { name: '白花菜', ingredient: '白花菜', quantity: 800, unit: '顆', orderId: '菜商0723', amount: 120, inStock: true, weight: 800, category: '蔬菜類', expiryDays: 10 },
            { name: '青花菜', ingredient: '青花菜', quantity: 800, unit: '顆', orderId: '菜商0723', amount: 120, inStock: true, weight: 800, category: '蔬菜類', expiryDays: 10 },
            
            // 肉品類
            { name: '二節翅', ingredient: '二節翅', quantity: 6, unit: '公斤', orderId: '東莉0723', amount: 480, inStock: true, weight: 6000, category: '肉品類', expiryDays: 7 },
            { name: '雞塊', ingredient: '雞塊', quantity: 3, unit: '公斤', orderId: '東莉0723', amount: 300, inStock: true, weight: 3000, category: '肉品類', expiryDays: 7 },
            { name: '玉米塊', ingredient: '玉米塊', quantity: 3, unit: '公斤', orderId: '東莉0723', amount: 150, inStock: true, weight: 3000, category: '冷凍食品', expiryDays: 180 }
        ];

        // 建立供應商資料
        this.suppliers = [
            {
                id: 'CS',
                name: 'CS蔬菜供應商',
                contact: '王先生',
                phone: '0912-345-678',
                address: '台北市大安區信義路四段',
                email: 'cs.vegetables@gmail.com',
                category: '蔬菜水果',
                rating: 4.5,
                paymentTerms: '月結30天',
                deliveryDays: ['週一', '週三', '週五'],
                minOrderAmount: 1000,
                notes: '品質穩定，價格合理'
            },
            {
                id: 'DL',
                name: '東莉肉品供應商',
                contact: '李小姐',
                phone: '0923-456-789',
                address: '新北市三重區重新路',
                email: 'dongli.meat@gmail.com',
                category: '肉品冷凍',
                rating: 4.8,
                paymentTerms: '貨到付款',
                deliveryDays: ['週二', '週四', '週六'],
                minOrderAmount: 2000,
                notes: '新鮮度佳，配送準時'
            }
        ];

        // 計算採購單總金額
        this.calculateOrderTotals();
    }

    /**
     * 計算採購單總金額
     */
    calculateOrderTotals() {
        this.purchaseOrders.forEach(order => {
            const orderItems = this.purchaseItems.filter(item => item.orderId === order.id);
            order.totalAmount = orderItems.reduce((sum, item) => sum + item.amount, 0);
        });
    }

    /**
     * 建立庫存清單
     */
    calculateInventory() {
        this.inventory.clear();
        
        this.purchaseItems.forEach(item => {
            if (item.inStock) {
                if (this.inventory.has(item.ingredient)) {
                    const existing = this.inventory.get(item.ingredient);
                    existing.totalWeight += item.weight;
                    existing.totalQuantity += item.quantity;
                    existing.batches.push({
                        orderId: item.orderId,
                        quantity: item.quantity,
                        weight: item.weight,
                        unit: item.unit,
                        purchaseDate: this.getPurchaseDate(item.orderId),
                        expiryDate: this.calculateExpiryDate(item.orderId, item.expiryDays)
                    });
                } else {
                    this.inventory.set(item.ingredient, {
                        name: item.ingredient,
                        category: item.category,
                        totalWeight: item.weight,
                        totalQuantity: item.quantity,
                        unit: item.unit,
                        averageCost: item.amount / item.quantity,
                        batches: [{
                            orderId: item.orderId,
                            quantity: item.quantity,
                            weight: item.weight,
                            unit: item.unit,
                            purchaseDate: this.getPurchaseDate(item.orderId),
                            expiryDate: this.calculateExpiryDate(item.orderId, item.expiryDays)
                        }],
                        expiryDays: item.expiryDays,
                        status: this.getInventoryStatus(item.expiryDays)
                    });
                }
            }
        });
    }

    /**
     * 取得採購日期
     */
    getPurchaseDate(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        return order ? order.date : new Date().toISOString().split('T')[0];
    }

    /**
     * 計算到期日期
     */
    calculateExpiryDate(orderId, expiryDays) {
        const purchaseDate = new Date(this.getPurchaseDate(orderId));
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        return expiryDate.toISOString().split('T')[0];
    }

    /**
     * 取得庫存狀態
     */
    getInventoryStatus(expiryDays) {
        if (expiryDays <= 3) return 'urgent';
        if (expiryDays <= 7) return 'warning';
        if (expiryDays <= 14) return 'caution';
        return 'good';
    }

    /**
     * 檢查即將到期警示
     */
    checkExpiryAlerts() {
        const today = new Date();
        const alerts = [];
        
        this.inventory.forEach((item, ingredient) => {
            item.batches.forEach(batch => {
                const expiryDate = new Date(batch.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry <= 3) {
                    alerts.push({
                        type: 'urgent',
                        ingredient: ingredient,
                        daysLeft: daysUntilExpiry,
                        quantity: batch.quantity,
                        unit: batch.unit,
                        expiryDate: batch.expiryDate,
                        orderId: batch.orderId
                    });
                } else if (daysUntilExpiry <= 7) {
                    alerts.push({
                        type: 'warning',
                        ingredient: ingredient,
                        daysLeft: daysUntilExpiry,
                        quantity: batch.quantity,
                        unit: batch.unit,
                        expiryDate: batch.expiryDate,
                        orderId: batch.orderId
                    });
                }
            });
        });
        
        this.expiryAlerts = alerts;
        return alerts;
    }

    /**
     * 新增採購單
     */
    addPurchaseOrder(orderData) {
        const newOrder = {
            id: orderData.id || this.generateOrderId(),
            supplier: orderData.supplier,
            supplierName: orderData.supplierName || this.getSupplierName(orderData.supplier),
            date: orderData.date || new Date().toISOString().split('T')[0],
            totalAmount: 0,
            responsible: orderData.responsible || '',
            notes: orderData.notes || '',
            status: orderData.status || '待確認',
            items: orderData.items || [],
            deliveryDate: orderData.deliveryDate,
            category: orderData.category || '一般'
        };

        this.purchaseOrders.push(newOrder);
        return newOrder;
    }

    /**
     * 新增採購項目
     */
    addPurchaseItem(itemData) {
        const newItem = {
            name: itemData.name,
            ingredient: itemData.ingredient,
            quantity: itemData.quantity,
            unit: itemData.unit,
            orderId: itemData.orderId,
            amount: itemData.amount,
            inStock: itemData.inStock || false,
            weight: itemData.weight,
            category: itemData.category,
            expiryDays: itemData.expiryDays || 7
        };

        this.purchaseItems.push(newItem);
        this.calculateOrderTotals();
        this.calculateInventory();
        return newItem;
    }

    /**
     * 更新採購單狀態
     */
    updateOrderStatus(orderId, status) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            
            // 如果狀態是已到貨，更新所有相關項目為入庫
            if (status === '已到貨') {
                this.purchaseItems
                    .filter(item => item.orderId === orderId)
                    .forEach(item => {
                        item.inStock = true;
                    });
                this.calculateInventory();
            }
        }
        return order;
    }

    /**
     * 產生採購單編號
     */
    generateOrderId() {
        const today = new Date();
        const dateStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        const count = this.purchaseOrders.filter(o => o.id.includes(dateStr)).length + 1;
        return `PO${dateStr}-${count.toString().padStart(2, '0')}`;
    }

    /**
     * 取得供應商名稱
     */
    getSupplierName(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : supplierId;
    }

    /**
     * 搜尋採購單
     */
    searchOrders(criteria) {
        return this.purchaseOrders.filter(order => {
            if (criteria.status && order.status !== criteria.status) return false;
            if (criteria.supplier && order.supplier !== criteria.supplier) return false;
            if (criteria.dateFrom && order.date < criteria.dateFrom) return false;
            if (criteria.dateTo && order.date > criteria.dateTo) return false;
            if (criteria.keyword) {
                const keyword = criteria.keyword.toLowerCase();
                return order.id.toLowerCase().includes(keyword) ||
                       order.supplierName.toLowerCase().includes(keyword) ||
                       order.items.some(item => item.toLowerCase().includes(keyword));
            }
            return true;
        });
    }

    /**
     * 取得庫存報告
     */
    getInventoryReport() {
        const report = {
            totalValue: 0,
            totalItems: this.inventory.size,
            categories: {},
            lowStock: [],
            expiringSoon: [],
            summary: []
        };

        this.inventory.forEach((item, ingredient) => {
            const value = item.totalQuantity * item.averageCost;
            report.totalValue += value;

            // 分類統計
            if (!report.categories[item.category]) {
                report.categories[item.category] = {
                    count: 0,
                    value: 0,
                    items: []
                };
            }
            report.categories[item.category].count++;
            report.categories[item.category].value += value;
            report.categories[item.category].items.push(ingredient);

            // 庫存不足警示 (假設最少庫存為1公斤或10個單位)
            const minStock = item.unit === '公斤' ? 1000 : (item.unit === '斤' ? 600 : 10);
            if (item.totalWeight < minStock) {
                report.lowStock.push({
                    ingredient: ingredient,
                    current: item.totalWeight,
                    minimum: minStock,
                    unit: item.unit
                });
            }

            // 即將到期
            const today = new Date();
            item.batches.forEach(batch => {
                const expiryDate = new Date(batch.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry <= 7) {
                    report.expiringSoon.push({
                        ingredient: ingredient,
                        daysLeft: daysUntilExpiry,
                        quantity: batch.quantity,
                        unit: batch.unit,
                        expiryDate: batch.expiryDate
                    });
                }
            });

            report.summary.push({
                ingredient: ingredient,
                category: item.category,
                quantity: item.totalQuantity,
                weight: item.totalWeight,
                unit: item.unit,
                value: value,
                status: item.status
            });
        });

        return report;
    }

    /**
     * 取得供應商績效報告
     */
    getSupplierPerformance() {
        const performance = {};
        
        this.suppliers.forEach(supplier => {
            const orders = this.purchaseOrders.filter(o => o.supplier === supplier.id);
            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === '已到貨').length;
            const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
            
            performance[supplier.id] = {
                name: supplier.name,
                totalOrders: totalOrders,
                completedOrders: completedOrders,
                completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0,
                totalValue: totalValue,
                averageOrderValue: totalOrders > 0 ? (totalValue / totalOrders).toFixed(0) : 0,
                rating: supplier.rating,
                category: supplier.category,
                contact: supplier.contact,
                phone: supplier.phone
            };
        });
        
        return performance;
    }

    /**
     * 取得採購統計
     */
    getPurchaseStatistics() {
        const stats = {
            totalOrders: this.purchaseOrders.length,
            totalValue: this.purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0),
            totalItems: this.purchaseItems.length,
            averageOrderValue: 0,
            statusDistribution: {},
            monthlyTrend: {},
            supplierDistribution: {},
            categoryDistribution: {}
        };

        // 平均訂單金額
        if (stats.totalOrders > 0) {
            stats.averageOrderValue = (stats.totalValue / stats.totalOrders).toFixed(0);
        }

        // 狀態分布
        this.purchaseOrders.forEach(order => {
            stats.statusDistribution[order.status] = (stats.statusDistribution[order.status] || 0) + 1;
        });

        // 供應商分布
        this.purchaseOrders.forEach(order => {
            stats.supplierDistribution[order.supplierName] = {
                count: (stats.supplierDistribution[order.supplierName]?.count || 0) + 1,
                value: (stats.supplierDistribution[order.supplierName]?.value || 0) + order.totalAmount
            };
        });

        // 分類分布
        this.purchaseItems.forEach(item => {
            stats.categoryDistribution[item.category] = {
                count: (stats.categoryDistribution[item.category]?.count || 0) + 1,
                value: (stats.categoryDistribution[item.category]?.value || 0) + item.amount
            };
        });

        return stats;
    }

    /**
     * 使用庫存
     */
    useInventory(ingredient, quantity, unit) {
        if (!this.inventory.has(ingredient)) {
            throw new Error(`庫存中沒有 ${ingredient}`);
        }

        const item = this.inventory.get(ingredient);
        let remainingQuantity = quantity;
        let usedBatches = [];

        // 按照先進先出原則使用庫存
        item.batches.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

        for (let i = 0; i < item.batches.length && remainingQuantity > 0; i++) {
            const batch = item.batches[i];
            const availableQuantity = batch.quantity;

            if (availableQuantity <= remainingQuantity) {
                // 整批使用完
                usedBatches.push(batch);
                remainingQuantity -= availableQuantity;
                item.totalQuantity -= availableQuantity;
                item.totalWeight -= batch.weight;
                item.batches.splice(i, 1);
                i--; // 因為陣列長度變了，索引需要調整
            } else {
                // 部分使用
                const usedQuantity = remainingQuantity;
                const usedWeight = (batch.weight / batch.quantity) * usedQuantity;
                
                usedBatches.push({
                    ...batch,
                    quantity: usedQuantity,
                    weight: usedWeight
                });

                batch.quantity -= usedQuantity;
                batch.weight -= usedWeight;
                item.totalQuantity -= usedQuantity;
                item.totalWeight -= usedWeight;
                
                remainingQuantity = 0;
            }
        }

        // 如果沒有庫存了，從 inventory 中移除
        if (item.totalQuantity <= 0) {
            this.inventory.delete(ingredient);
        }

        return {
            ingredient: ingredient,
            usedQuantity: quantity - remainingQuantity,
            remainingQuantity: remainingQuantity,
            usedBatches: usedBatches,
            success: remainingQuantity === 0
        };
    }

    /**
     * 新增供應商
     */
    addSupplier(supplierData) {
        const newSupplier = {
            id: supplierData.id || this.generateSupplierId(),
            name: supplierData.name,
            contact: supplierData.contact || '',
            phone: supplierData.phone || '',
            address: supplierData.address || '',
            email: supplierData.email || '',
            category: supplierData.category || '一般',
            rating: supplierData.rating || 0,
            paymentTerms: supplierData.paymentTerms || '月結30天',
            deliveryDays: supplierData.deliveryDays || [],
            minOrderAmount: supplierData.minOrderAmount || 0,
            notes: supplierData.notes || ''
        };

        this.suppliers.push(newSupplier);
        return newSupplier;
    }

    /**
     * 產生供應商編號
     */
    generateSupplierId() {
        const maxId = Math.max(...this.suppliers.map(s => parseInt(s.id.replace(/\D/g, '')) || 0));
        return `SUP${(maxId + 1).toString().padStart(3, '0')}`;
    }

    /**
     * 匯出採購報告
     */
    exportPurchaseReport(format = 'json') {
        const report = {
            purchaseOrders: this.purchaseOrders,
            purchaseItems: this.purchaseItems,
            suppliers: this.suppliers,
            inventory: Array.from(this.inventory.entries()).map(([key, value]) => ({
                ingredient: key,
                ...value
            })),
            statistics: this.getPurchaseStatistics(),
            inventoryReport: this.getInventoryReport(),
            supplierPerformance: this.getSupplierPerformance(),
            generatedAt: new Date().toISOString()
        };

        if (format === 'csv') {
            return this.convertToCSV(report);
        }
        
        return JSON.stringify(report, null, 2);
    }

    /**
     * 轉換為CSV格式
     */
    convertToCSV(data) {
        // 簡化的CSV轉換，實際使用時可以用更完整的CSV庫
        const csvSections = [];
        
        // 採購單
        csvSections.push('採購單');
        csvSections.push('單號,供應商,日期,金額,狀態');
        data.purchaseOrders.forEach(order => {
            csvSections.push(`${order.id},${order.supplierName},${order.date},${order.totalAmount},${order.status}`);
        });
        
        csvSections.push('');
        
        // 庫存
        csvSections.push('庫存清單');
        csvSections.push('食材,分類,數量,單位,總重量,狀態');
        data.inventory.forEach(item => {
            csvSections.push(`${item.ingredient},${item.category},${item.totalQuantity},${item.unit},${item.totalWeight},${item.status}`);
        });
        
        return csvSections.join('\n');
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PurchaseManager;
}
