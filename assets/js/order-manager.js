/**
 * 訂單管理系統
 * 負責處理餐廳的所有訂單操作，包括點餐、修改、結帳、報表等功能
 */

class OrderManager {
    constructor() {
        this.orders = new Map();
        this.orderHistory = new Map();
        this.dailyReports = new Map();
        this.orderSequence = 1;
        this.settings = {
            taxRate: 0.05, // 5% 營業稅
            serviceCharge: 0.1, // 10% 服務費
            autoOrderTimeout: 1800000, // 30分鐘後自動結單
            maxOrderItems: 50, // 單筆訂單最大項目數
            allowModification: true, // 允許修改訂單
            roundingMethod: 'round' // 四捨五入方式
        };
        this.orderStatuses = [
            '點餐中',
            '已確認',
            '製作中',
            '製作完成',
            '已送達',
            '已結帳',
            '已取消'
        ];
        this.paymentMethods = [
            '現金',
            '信用卡',
            '行動支付',
            '電子票證',
            '轉帳',
            '其他'
        ];
        this.init();
    }

    /**
     * 初始化訂單管理系統
     */
    init() {
        // 初始化 Notion 資料管理器
        this.notionManager = new NotionDataManager();
        
        this.loadOrderData();
        this.startAutoSave();
        this.startDailyReportGeneration();
        console.log('訂單管理系統已初始化');
    }

    /**
     * 載入訂單資料
     */
    loadOrderData() {
        try {
            // 載入現有訂單
            const savedOrders = localStorage.getItem('tanawat_orders');
            if (savedOrders) {
                const ordersData = JSON.parse(savedOrders);
                ordersData.forEach(order => {
                    this.orders.set(order.id, order);
                });
            }

            // 載入歷史訂單
            const savedHistory = localStorage.getItem('tanawat_order_history');
            if (savedHistory) {
                const historyData = JSON.parse(savedHistory);
                historyData.forEach(order => {
                    this.orderHistory.set(order.id, order);
                });
            }

            // 載入每日報表
            const savedReports = localStorage.getItem('tanawat_daily_reports');
            if (savedReports) {
                const reportsData = JSON.parse(savedReports);
                Object.entries(reportsData).forEach(([date, report]) => {
                    this.dailyReports.set(date, report);
                });
            }

            // 設定訂單序號
            const maxOrderId = Math.max(
                ...Array.from(this.orders.keys()).map(id => parseInt(id.split('-')[2]) || 0),
                ...Array.from(this.orderHistory.keys()).map(id => parseInt(id.split('-')[2]) || 0),
                0
            );
            this.orderSequence = maxOrderId + 1;

        } catch (error) {
            console.error('載入訂單資料失敗:', error);
        }
    }

    /**
     * 儲存訂單資料
     */
    saveOrderData() {
        try {
            localStorage.setItem('tanawat_orders', JSON.stringify(Array.from(this.orders.values())));
            localStorage.setItem('tanawat_order_history', JSON.stringify(Array.from(this.orderHistory.values())));
            localStorage.setItem('tanawat_daily_reports', JSON.stringify(Object.fromEntries(this.dailyReports)));
        } catch (error) {
            console.error('儲存訂單資料失敗:', error);
        }
    }

    /**
     * 建立新訂單
     */
    createOrder(tableId, customerCount = 1, customerInfo = {}) {
        const orderId = this.generateOrderId(tableId);
        const timestamp = new Date();

        const order = {
            id: orderId,
            tableId: tableId,
            customerCount: customerCount,
            customerInfo: customerInfo,
            status: '點餐中',
            items: [],
            subtotal: 0,
            tax: 0,
            serviceCharge: 0,
            discount: 0,
            total: 0,
            paymentMethod: null,
            paymentStatus: '未付款',
            notes: '',
            createdAt: timestamp.toISOString(),
            updatedAt: timestamp.toISOString(),
            completedAt: null,
            orderSource: '現場點餐',
            waiter: '',
            kitchen: {
                startTime: null,
                estimatedTime: null,
                actualTime: null,
                notes: ''
            },
            modifications: [],
            printHistory: []
        };

        this.orders.set(orderId, order);
        this.saveOrderData();

        // 同步到 Notion
        this.syncOrderToNotion(order);

        return {
            success: true,
            orderId: orderId,
            order: order
        };
    }

    /**
     * 生成訂單編號
     */
    generateOrderId(tableId) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
        return `${tableId}-${dateStr}-${timeStr}-${this.orderSequence++}`;
    }

    /**
     * 新增品項到訂單
     */
    addItemToOrder(orderId, item) {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('訂單不存在');
        }

        if (order.status !== '點餐中' && order.status !== '已確認') {
            throw new Error('此訂單狀態不允許新增品項');
        }

        if (order.items.length >= this.settings.maxOrderItems) {
            throw new Error(`單筆訂單最多只能有 ${this.settings.maxOrderItems} 個品項`);
        }

        // 驗證品項資料
        const validatedItem = this.validateOrderItem(item);
        
        // 檢查是否已存在相同品項（可合併）
        const existingItemIndex = order.items.findIndex(
            existing => existing.name === validatedItem.name && 
                       JSON.stringify(existing.customizations) === JSON.stringify(validatedItem.customizations)
        );

        if (existingItemIndex >= 0) {
            // 合併數量
            order.items[existingItemIndex].quantity += validatedItem.quantity;
            order.items[existingItemIndex].subtotal = 
                order.items[existingItemIndex].quantity * order.items[existingItemIndex].price;
        } else {
            // 新增品項
            validatedItem.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            validatedItem.addedAt = new Date().toISOString();
            order.items.push(validatedItem);
        }

        this.calculateOrderTotal(order);
        order.updatedAt = new Date().toISOString();
        
        this.saveOrderData();
        return { success: true, order: order };
    }

    /**
     * 驗證訂單品項
     */
    validateOrderItem(item) {
        if (!item.name || !item.price || !item.quantity) {
            throw new Error('品項資料不完整');
        }

        if (item.quantity <= 0) {
            throw new Error('數量必須大於 0');
        }

        if (item.price < 0) {
            throw new Error('價格不能為負數');
        }

        return {
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            category: item.category || '其他',
            itemType: item.itemType || '單點',
            subtotal: parseFloat(item.price) * parseInt(item.quantity),
            customizations: item.customizations || [],
            notes: item.notes || '',
            allergens: item.allergens || [],
            nutritionInfo: item.nutritionInfo || {},
            preparationTime: item.preparationTime || 15
        };
    }

    /**
     * 移除訂單品項
     */
    removeItemFromOrder(orderId, itemId) {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('訂單不存在');
        }

        if (order.status !== '點餐中' && order.status !== '已確認') {
            throw new Error('此訂單狀態不允許移除品項');
        }

        const itemIndex = order.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            throw new Error('品項不存在');
        }

        const removedItem = order.items.splice(itemIndex, 1)[0];
        
        // 記錄修改
        order.modifications.push({
            type: '移除品項',
            item: removedItem,
            timestamp: new Date().toISOString(),
            reason: '客戶要求'
        });

        this.calculateOrderTotal(order);
        order.updatedAt = new Date().toISOString();
        
        this.saveOrderData();
        return { success: true, removedItem: removedItem };
    }

    /**
     * 修改品項數量
     */
    updateItemQuantity(orderId, itemId, newQuantity) {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('訂單不存在');
        }

        if (order.status !== '點餐中' && order.status !== '已確認') {
            throw new Error('此訂單狀態不允許修改品項');
        }

        const item = order.items.find(item => item.id === itemId);
        if (!item) {
            throw new Error('品項不存在');
        }

        if (newQuantity <= 0) {
            return this.removeItemFromOrder(orderId, itemId);
        }

        const oldQuantity = item.quantity;
        item.quantity = parseInt(newQuantity);
        item.subtotal = item.price * item.quantity;

        // 記錄修改
        order.modifications.push({
            type: '修改數量',
            item: item.name,
            oldQuantity: oldQuantity,
            newQuantity: newQuantity,
            timestamp: new Date().toISOString()
        });

        this.calculateOrderTotal(order);
        order.updatedAt = new Date().toISOString();
        
        this.saveOrderData();
        return { success: true, item: item };
    }

    /**
     * 計算訂單總額
     */
    calculateOrderTotal(order) {
        // 計算小計
        order.subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
        
        // 計算折扣後金額
        const discountedAmount = order.subtotal - order.discount;
        
        // 計算服務費
        order.serviceCharge = Math.round(discountedAmount * this.settings.serviceCharge);
        
        // 計算稅額
        order.tax = Math.round((discountedAmount + order.serviceCharge) * this.settings.taxRate);
        
        // 計算總額
        order.total = discountedAmount + order.serviceCharge + order.tax;

        return order;
    }

    /**
     * 更新訂單狀態
     */
    updateOrderStatus(orderId, newStatus, notes = '') {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('訂單不存在');
        }

        if (!this.orderStatuses.includes(newStatus)) {
            throw new Error('無效的訂單狀態');
        }

        const oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        // 處理狀態變更的特殊邏輯
        switch (newStatus) {
            case '製作中':
                order.kitchen.startTime = new Date().toISOString();
                order.kitchen.estimatedTime = this.calculateEstimatedCookingTime(order);
                break;
            
            case '製作完成':
                order.kitchen.actualTime = new Date().toISOString();
                break;
            
            case '已結帳':
                order.completedAt = new Date().toISOString();
                order.paymentStatus = '已付款';
                this.moveToHistory(orderId);
                break;
            
            case '已取消':
                order.completedAt = new Date().toISOString();
                this.moveToHistory(orderId);
                break;
        }

        // 記錄狀態變更
        order.modifications.push({
            type: '狀態變更',
            oldStatus: oldStatus,
            newStatus: newStatus,
            notes: notes,
            timestamp: new Date().toISOString()
        });

        this.saveOrderData();
        
        // 同步更新到 Notion
        this.updateOrderInNotion(order);
        
        return { success: true, order: order };
    }

    /**
     * 計算預估製作時間
     */
    calculateEstimatedCookingTime(order) {
        const maxPrepTime = Math.max(...order.items.map(item => item.preparationTime || 15));
        const complexityFactor = order.items.length > 5 ? 1.2 : 1;
        const estimatedMinutes = Math.ceil(maxPrepTime * complexityFactor);
        
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + estimatedMinutes);
        
        return estimatedTime.toISOString();
    }

    /**
     * 將訂單移至歷史記錄
     */
    moveToHistory(orderId) {
        const order = this.orders.get(orderId);
        if (order) {
            this.orderHistory.set(orderId, order);
            this.orders.delete(orderId);
            
            // 更新每日報表
            this.updateDailyReport(order);
        }
    }

    /**
     * 更新每日報表
     */
    updateDailyReport(order) {
        const orderDate = order.createdAt.split('T')[0];
        
        if (!this.dailyReports.has(orderDate)) {
            this.dailyReports.set(orderDate, {
                date: orderDate,
                totalOrders: 0,
                totalRevenue: 0,
                totalCustomers: 0,
                averageOrderValue: 0,
                ordersByStatus: {},
                ordersByPaymentMethod: {},
                hourlyBreakdown: {},
                topSellingItems: new Map(),
                categoryBreakdown: {}
            });
        }

        const report = this.dailyReports.get(orderDate);
        
        if (order.status === '已結帳') {
            report.totalOrders++;
            report.totalRevenue += order.total;
            report.totalCustomers += order.customerCount;
            report.averageOrderValue = report.totalRevenue / report.totalOrders;
            
            // 付款方式統計
            if (order.paymentMethod) {
                report.ordersByPaymentMethod[order.paymentMethod] = 
                    (report.ordersByPaymentMethod[order.paymentMethod] || 0) + 1;
            }
            
            // 時段統計
            const hour = new Date(order.createdAt).getHours();
            report.hourlyBreakdown[hour] = (report.hourlyBreakdown[hour] || 0) + 1;
            
            // 商品銷售統計
            order.items.forEach(item => {
                const currentCount = report.topSellingItems.get(item.name) || 0;
                report.topSellingItems.set(item.name, currentCount + item.quantity);
                
                report.categoryBreakdown[item.category] = 
                    (report.categoryBreakdown[item.category] || 0) + item.quantity;
            });
        }

        // 狀態統計
        report.ordersByStatus[order.status] = (report.ordersByStatus[order.status] || 0) + 1;
    }

    /**
     * 處理付款
     */
    processPayment(orderId, paymentMethod, paidAmount, notes = '') {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('訂單不存在');
        }

        if (order.status === '已結帳') {
            throw new Error('此訂單已經結帳');
        }

        if (!this.paymentMethods.includes(paymentMethod)) {
            throw new Error('無效的付款方式');
        }

        if (paidAmount < order.total) {
            throw new Error(`付款金額不足，應付 ${order.total} 元`);
        }

        order.paymentMethod = paymentMethod;
        order.paymentStatus = '已付款';
        order.paidAmount = paidAmount;
        order.change = paidAmount - order.total;
        order.paymentNotes = notes;
        order.paidAt = new Date().toISOString();

        // 自動更新狀態為已結帳
        this.updateOrderStatus(orderId, '已結帳', `付款方式: ${paymentMethod}`);

        return {
            success: true,
            order: order,
            change: order.change
        };
    }

    /**
     * 取消訂單
     */
    cancelOrder(orderId, reason = '') {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('訂單不存在');
        }

        if (order.status === '已結帳') {
            throw new Error('已結帳的訂單無法取消');
        }

        order.cancelReason = reason;
        order.cancelledAt = new Date().toISOString();

        this.updateOrderStatus(orderId, '已取消', reason);

        return { success: true, order: order };
    }

    /**
     * 取得當前活躍訂單
     */
    getActiveOrders() {
        return Array.from(this.orders.values())
            .filter(order => order.status !== '已結帳' && order.status !== '已取消')
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    /**
     * 取得特定桌號的訂單
     */
    getOrdersByTable(tableId) {
        return Array.from(this.orders.values())
            .filter(order => order.tableId === tableId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * 取得訂單詳情
     */
    getOrderDetails(orderId) {
        return this.orders.get(orderId) || this.orderHistory.get(orderId);
    }

    /**
     * 搜尋訂單
     */
    searchOrders(criteria) {
        const allOrders = [
            ...Array.from(this.orders.values()),
            ...Array.from(this.orderHistory.values())
        ];

        return allOrders.filter(order => {
            if (criteria.orderId && !order.id.includes(criteria.orderId)) return false;
            if (criteria.tableId && order.tableId !== criteria.tableId) return false;
            if (criteria.status && order.status !== criteria.status) return false;
            if (criteria.paymentMethod && order.paymentMethod !== criteria.paymentMethod) return false;
            if (criteria.dateFrom && order.createdAt < criteria.dateFrom) return false;
            if (criteria.dateTo && order.createdAt > criteria.dateTo) return false;
            if (criteria.minAmount && order.total < criteria.minAmount) return false;
            if (criteria.maxAmount && order.total > criteria.maxAmount) return false;
            
            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * 取得廚房顯示訂單
     */
    getKitchenOrders() {
        return Array.from(this.orders.values())
            .filter(order => ['已確認', '製作中'].includes(order.status))
            .sort((a, b) => {
                // 優先顯示確認時間較早的訂單
                const aTime = new Date(order.kitchen.startTime || order.updatedAt);
                const bTime = new Date(order.kitchen.startTime || order.updatedAt);
                return aTime - bTime;
            });
    }

    /**
     * 取得等待送餐的訂單
     */
    getReadyOrders() {
        return Array.from(this.orders.values())
            .filter(order => order.status === '製作完成')
            .sort((a, b) => new Date(a.kitchen.actualTime) - new Date(b.kitchen.actualTime));
    }

    /**
     * 取得今日統計
     */
    getTodayStatistics() {
        const today = new Date().toISOString().split('T')[0];
        const todayReport = this.dailyReports.get(today);
        
        if (!todayReport) {
            return {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                totalCustomers: 0
            };
        }

        return todayReport;
    }

    /**
     * 取得營業報表
     */
    getBusinessReport(startDate, endDate) {
        const reports = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const report = this.dailyReports.get(dateStr);
            if (report) {
                reports.push(report);
            }
        }

        return {
            period: { startDate, endDate },
            dailyReports: reports,
            summary: this.calculateReportSummary(reports)
        };
    }

    /**
     * 計算報表摘要
     */
    calculateReportSummary(reports) {
        const summary = {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            averageOrderValue: 0,
            averageDailyRevenue: 0,
            paymentMethodBreakdown: {},
            categoryBreakdown: {},
            topSellingItems: new Map()
        };

        reports.forEach(report => {
            summary.totalOrders += report.totalOrders;
            summary.totalRevenue += report.totalRevenue;
            summary.totalCustomers += report.totalCustomers;

            // 合併付款方式統計
            Object.entries(report.ordersByPaymentMethod).forEach(([method, count]) => {
                summary.paymentMethodBreakdown[method] = (summary.paymentMethodBreakdown[method] || 0) + count;
            });

            // 合併類別統計
            Object.entries(report.categoryBreakdown).forEach(([category, count]) => {
                summary.categoryBreakdown[category] = (summary.categoryBreakdown[category] || 0) + count;
            });

            // 合併商品銷售統計
            report.topSellingItems.forEach((count, itemName) => {
                const currentCount = summary.topSellingItems.get(itemName) || 0;
                summary.topSellingItems.set(itemName, currentCount + count);
            });
        });

        summary.averageOrderValue = summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;
        summary.averageDailyRevenue = reports.length > 0 ? summary.totalRevenue / reports.length : 0;

        return summary;
    }

    /**
     * 匯出訂單報告
     */
    exportOrderReport(format = 'csv', dateRange = null) {
        let orders;
        
        if (dateRange) {
            orders = this.searchOrders({
                dateFrom: dateRange.start + 'T00:00:00.000Z',
                dateTo: dateRange.end + 'T23:59:59.999Z'
            });
        } else {
            orders = [
                ...Array.from(this.orders.values()),
                ...Array.from(this.orderHistory.values())
            ];
        }

        if (format === 'csv') {
            return this.generateCSVReport(orders);
        } else if (format === 'json') {
            return JSON.stringify(orders, null, 2);
        }
    }

    /**
     * 生成 CSV 報告
     */
    generateCSVReport(orders) {
        const headers = [
            '訂單ID', '桌號', '訂單狀態', '總金額', '客戶數量', 
            '付款方式', '建立時間', '完成時間', '訂單內容'
        ];

        const rows = orders.map(order => [
            order.id,
            order.tableId,
            order.status,
            order.total,
            order.customerCount,
            order.paymentMethod || '',
            order.createdAt,
            order.completedAt || '',
            JSON.stringify(order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })))
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * 開始自動儲存
     */
    startAutoSave() {
        setInterval(() => {
            this.saveOrderData();
        }, 30000); // 每30秒自動儲存
    }

    /**
     * 開始每日報表生成
     */
    startDailyReportGeneration() {
        // 每天凌晨生成前一天的報表
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.generateDailyReport();
            setInterval(() => {
                this.generateDailyReport();
            }, 24 * 60 * 60 * 1000); // 每24小時執行一次
        }, timeUntilMidnight);
    }

    /**
     * 生成每日報表
     */
    generateDailyReport() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        
        // 如果報表已存在，不重複生成
        if (this.dailyReports.has(dateStr)) {
            return;
        }

        // 從歷史訂單中找出昨天的訂單
        const yesterdayOrders = Array.from(this.orderHistory.values())
            .filter(order => order.createdAt.startsWith(dateStr));

        yesterdayOrders.forEach(order => {
            this.updateDailyReport(order);
        });

        console.log(`已生成 ${dateStr} 的每日報表`);
    }

    /**
     * 同步訂單到 Notion
     */
    async syncOrderToNotion(order) {
        if (!this.notionManager) {
            console.warn('Notion 管理器未初始化');
            return;
        }

        try {
            const notionOrder = {
                '訂單編號': { title: [{ text: { content: order.id } }] },
                '桌號': { rich_text: [{ text: { content: order.tableId } }] },
                '客人數量': { number: order.customerCount },
                '狀態': { select: { name: order.status } },
                '小計': { number: order.subtotal },
                '總金額': { number: order.total },
                '付款狀態': { select: { name: order.paymentStatus } },
                '付款方式': { rich_text: [{ text: { content: order.paymentMethod || '' } }] },
                '建立時間': { date: { start: order.createdAt } },
                '備註': { rich_text: [{ text: { content: order.notes || '' } }] }
            };

            const result = await this.notionManager.createRecord('orders', notionOrder);
            console.log('訂單已同步到 Notion:', result);
            
            // 儲存 Notion ID 以便後續更新
            order.notionId = result.id;
            this.saveOrderData();
            
        } catch (error) {
            console.error('同步訂單到 Notion 失敗:', error);
        }
    }

    /**
     * 更新 Notion 中的訂單
     */
    async updateOrderInNotion(order) {
        if (!this.notionManager || !order.notionId) {
            console.warn('Notion 管理器未初始化或訂單沒有 Notion ID');
            return;
        }

        try {
            const notionOrder = {
                '狀態': { select: { name: order.status } },
                '小計': { number: order.subtotal },
                '總金額': { number: order.total },
                '付款狀態': { select: { name: order.paymentStatus } },
                '付款方式': { rich_text: [{ text: { content: order.paymentMethod || '' } }] },
                '更新時間': { date: { start: order.updatedAt } },
                '備註': { rich_text: [{ text: { content: order.notes || '' } }] }
            };

            const result = await this.notionManager.updateRecord('orders', order.notionId, notionOrder);
            console.log('訂單已在 Notion 中更新:', result);
            
        } catch (error) {
            console.error('更新 Notion 中的訂單失敗:', error);
        }
    }
}

// 全域訂單管理實例
window.OrderManager = OrderManager;
