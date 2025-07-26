// 成本控制與分析系統
class CostAnalytics {
    constructor() {
        this.suppliers = this.loadSuppliersData();
        this.purchases = this.loadPurchasesData();
        this.inventory = this.loadInventoryData();
        this.charts = {};
        this.currentDateRange = this.getDefaultDateRange();
        this.init();
    }

    loadSuppliersData() {
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
        return this.generateSamplePurchases();
    }

    loadInventoryData() {
        const saved = localStorage.getItem('inventoryData');
        return saved ? JSON.parse(saved) : [];
    }

    getDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end };
    }

    generateSamplePurchases() {
        const sampleData = [];
        const categories = ['蛋品', '肉品', '水產', '蔬菜', '食品'];
        const suppliers = ['YZ', 'YJ', 'CSS', 'JL', 'DL'];
        
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));
            
            sampleData.push({
                id: `PO${Date.now()}${i}`,
                supplierId: suppliers[Math.floor(Math.random() * suppliers.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                totalAmount: Math.floor(Math.random() * 10000) + 1000,
                orderDate: date,
                status: Math.random() > 0.1 ? 'delivered' : 'pending',
                deliveryDays: Math.floor(Math.random() * 7) + 1
            });
        }
        
        return sampleData;
    }

    init() {
        this.setInitialDates();
        this.bindEvents();
        this.updateAnalysis();
    }

    setInitialDates() {
        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');
        
        startInput.value = this.currentDateRange.start.toISOString().split('T')[0];
        endInput.value = this.currentDateRange.end.toISOString().split('T')[0];
    }

    bindEvents() {
        // 日期範圍快速選擇
        window.setDateRange = (days) => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - days);
            
            document.getElementById('start-date').value = start.toISOString().split('T')[0];
            document.getElementById('end-date').value = end.toISOString().split('T')[0];
            
            this.currentDateRange = { start, end };
            this.updateAnalysis();
        };

        // 更新分析
        window.updateAnalysis = () => {
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);
            
            this.currentDateRange = { start: startDate, end: endDate };
            this.updateAnalysis();
        };

        // 績效指標選擇
        document.getElementById('performance-metric').addEventListener('change', () => {
            this.updateSupplierPerformanceTable();
        });
    }

    updateAnalysis() {
        this.updateMetrics();
        this.updateCharts();
        this.updateSupplierPerformanceTable();
        this.generateOptimizationSuggestions();
    }

    updateMetrics() {
        const filteredPurchases = this.getFilteredPurchases();
        const previousPeriodPurchases = this.getPreviousPeriodPurchases();

        // 總採購成本
        const totalCost = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const prevTotalCost = previousPeriodPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const costChange = prevTotalCost > 0 ? ((totalCost - prevTotalCost) / prevTotalCost * 100) : 0;

        document.getElementById('total-cost').textContent = this.formatCurrency(totalCost);
        document.getElementById('cost-change').textContent = `${costChange >= 0 ? '+' : ''}${costChange.toFixed(1)}%`;
        document.getElementById('cost-change').className = costChange >= 0 ? 'text-red-400' : 'text-green-400';

        // 平均訂單金額
        const avgOrder = filteredPurchases.length > 0 ? totalCost / filteredPurchases.length : 0;
        const prevAvgOrder = previousPeriodPurchases.length > 0 ? prevTotalCost / previousPeriodPurchases.length : 0;
        const orderChange = prevAvgOrder > 0 ? ((avgOrder - prevAvgOrder) / prevAvgOrder * 100) : 0;

        document.getElementById('avg-order').textContent = this.formatCurrency(avgOrder);
        document.getElementById('order-change').textContent = `${orderChange >= 0 ? '+' : ''}${orderChange.toFixed(1)}%`;
        document.getElementById('order-change').className = orderChange >= 0 ? 'text-red-400' : 'text-green-400';

        // 成本節省 (模擬計算)
        const costSavings = Math.max(0, prevTotalCost - totalCost);
        document.getElementById('cost-savings').textContent = this.formatCurrency(costSavings);

        // 供應商效率
        const deliveredOrders = filteredPurchases.filter(p => p.status === 'delivered');
        const onTimeOrders = deliveredOrders.filter(p => p.deliveryDays <= 3);
        const efficiency = deliveredOrders.length > 0 ? (onTimeOrders.length / deliveredOrders.length * 100) : 0;
        document.getElementById('supplier-efficiency').textContent = `${efficiency.toFixed(0)}%`;
    }

    getFilteredPurchases() {
        return this.purchases.filter(p => 
            p.orderDate >= this.currentDateRange.start && 
            p.orderDate <= this.currentDateRange.end
        );
    }

    getPreviousPeriodPurchases() {
        const periodLength = this.currentDateRange.end - this.currentDateRange.start;
        const prevStart = new Date(this.currentDateRange.start - periodLength);
        const prevEnd = new Date(this.currentDateRange.start);
        
        return this.purchases.filter(p => 
            p.orderDate >= prevStart && 
            p.orderDate < prevEnd
        );
    }

    updateCharts() {
        this.updateCostTrendChart();
        this.updateSupplierCostChart();
        this.updateCategoryCostChart();
        this.updatePriceTrendChart();
    }

    updateCostTrendChart() {
        const ctx = document.getElementById('cost-trend-chart').getContext('2d');
        
        if (this.charts.costTrend) {
            this.charts.costTrend.destroy();
        }

        const dailyCosts = this.calculateDailyCosts();
        
        this.charts.costTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailyCosts.labels,
                datasets: [{
                    label: '每日採購成本',
                    data: dailyCosts.data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e5e7eb' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    }
                }
            }
        });
    }

    updateSupplierCostChart() {
        const ctx = document.getElementById('supplier-cost-chart').getContext('2d');
        
        if (this.charts.supplierCost) {
            this.charts.supplierCost.destroy();
        }

        const supplierCosts = this.calculateSupplierCosts();
        
        this.charts.supplierCost = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: supplierCosts.labels,
                datasets: [{
                    data: supplierCosts.data,
                    backgroundColor: [
                        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
                        '#10b981', '#3b82f6', '#ef4444', '#6b7280'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#e5e7eb',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    updateCategoryCostChart() {
        const ctx = document.getElementById('category-cost-chart').getContext('2d');
        
        if (this.charts.categoryCost) {
            this.charts.categoryCost.destroy();
        }

        const categoryCosts = this.calculateCategoryCosts();
        
        this.charts.categoryCost = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categoryCosts.labels,
                datasets: [{
                    label: '類別成本',
                    data: categoryCosts.data,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: '#6366f1',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e5e7eb' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    }
                }
            }
        });
    }

    updatePriceTrendChart() {
        const ctx = document.getElementById('price-trend-chart').getContext('2d');
        
        if (this.charts.priceTrend) {
            this.charts.priceTrend.destroy();
        }

        const priceTrends = this.calculatePriceTrends();
        
        this.charts.priceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: priceTrends.labels,
                datasets: priceTrends.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e5e7eb' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    }
                }
            }
        });
    }

    calculateDailyCosts() {
        const purchases = this.getFilteredPurchases();
        const dailyTotals = {};
        
        purchases.forEach(purchase => {
            const dateKey = purchase.orderDate.toISOString().split('T')[0];
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + purchase.totalAmount;
        });

        const sortedDates = Object.keys(dailyTotals).sort();
        
        return {
            labels: sortedDates.map(date => new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })),
            data: sortedDates.map(date => dailyTotals[date])
        };
    }

    calculateSupplierCosts() {
        const purchases = this.getFilteredPurchases();
        const supplierTotals = {};
        
        purchases.forEach(purchase => {
            const supplier = this.suppliers.find(s => s.id === purchase.supplierId);
            const name = supplier ? supplier.name : purchase.supplierId;
            supplierTotals[name] = (supplierTotals[name] || 0) + purchase.totalAmount;
        });

        const sorted = Object.entries(supplierTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            labels: sorted.map(([name]) => name),
            data: sorted.map(([,amount]) => amount)
        };
    }

    calculateCategoryCosts() {
        const purchases = this.getFilteredPurchases();
        const categoryTotals = {};
        
        purchases.forEach(purchase => {
            categoryTotals[purchase.category] = (categoryTotals[purchase.category] || 0) + purchase.totalAmount;
        });

        return {
            labels: Object.keys(categoryTotals),
            data: Object.values(categoryTotals)
        };
    }

    calculatePriceTrends() {
        // 模擬主要商品的價格趨勢
        const products = ['雞蛋', '豬肉', '魚類', '蔬菜'];
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'];
        
        const labels = [];
        const currentDate = new Date(this.currentDateRange.start);
        while (currentDate <= this.currentDateRange.end) {
            labels.push(currentDate.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
            currentDate.setDate(currentDate.getDate() + 7);
        }

        const datasets = products.map((product, index) => ({
            label: product,
            data: labels.map(() => Math.random() * 50 + 20), // 模擬價格
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }));

        return { labels, datasets };
    }

    updateSupplierPerformanceTable() {
        const tbody = document.getElementById('supplier-performance-table');
        const metric = document.getElementById('performance-metric').value;
        
        const supplierPerformance = this.calculateSupplierPerformance();
        const sorted = this.sortSuppliersByMetric(supplierPerformance, metric);
        
        tbody.innerHTML = sorted.map((supplier, index) => `
            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                <td class="py-3 px-4">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${this.getRankColor(index)} text-white font-bold text-sm">
                        ${index + 1}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div>
                        <div class="font-semibold text-white">${supplier.name}</div>
                        <div class="text-sm text-gray-400">${supplier.id}</div>
                    </div>
                </td>
                <td class="py-3 px-4 text-gray-300">${this.formatCurrency(supplier.totalCost)}</td>
                <td class="py-3 px-4 text-gray-300">${supplier.avgDeliveryDays} 天</td>
                <td class="py-3 px-4">
                    <span class="text-${supplier.onTimeRate >= 90 ? 'green' : supplier.onTimeRate >= 80 ? 'yellow' : 'red'}-400">
                        ${supplier.onTimeRate}%
                    </span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${this.getCostRatingColor(supplier.costRating)}">
                        ${supplier.costRating}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    calculateSupplierPerformance() {
        const purchases = this.getFilteredPurchases();
        const supplierStats = {};
        
        this.suppliers.forEach(supplier => {
            const supplierPurchases = purchases.filter(p => p.supplierId === supplier.id);
            
            if (supplierPurchases.length > 0) {
                const totalCost = supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
                const deliveredOrders = supplierPurchases.filter(p => p.status === 'delivered');
                const onTimeOrders = deliveredOrders.filter(p => p.deliveryDays <= 3);
                const avgDeliveryDays = deliveredOrders.length > 0 ? 
                    deliveredOrders.reduce((sum, p) => sum + p.deliveryDays, 0) / deliveredOrders.length : 0;
                const onTimeRate = deliveredOrders.length > 0 ? 
                    (onTimeOrders.length / deliveredOrders.length * 100) : 0;
                
                supplierStats[supplier.id] = {
                    id: supplier.id,
                    name: supplier.name,
                    totalCost,
                    orderCount: supplierPurchases.length,
                    avgDeliveryDays: Math.round(avgDeliveryDays * 10) / 10,
                    onTimeRate: Math.round(onTimeRate),
                    costRating: this.calculateCostRating(totalCost, supplierPurchases.length),
                    costEfficiency: totalCost / supplierPurchases.length
                };
            }
        });
        
        return Object.values(supplierStats);
    }

    sortSuppliersByMetric(suppliers, metric) {
        switch (metric) {
            case 'cost-efficiency':
                return suppliers.sort((a, b) => a.costEfficiency - b.costEfficiency);
            case 'delivery-time':
                return suppliers.sort((a, b) => a.avgDeliveryDays - b.avgDeliveryDays);
            case 'quality-score':
                return suppliers.sort((a, b) => b.onTimeRate - a.onTimeRate);
            case 'total-volume':
                return suppliers.sort((a, b) => b.totalCost - a.totalCost);
            default:
                return suppliers;
        }
    }

    calculateCostRating(totalCost, orderCount) {
        const avgOrderValue = totalCost / orderCount;
        if (avgOrderValue > 5000) return 'A+';
        if (avgOrderValue > 3000) return 'A';
        if (avgOrderValue > 2000) return 'B+';
        if (avgOrderValue > 1000) return 'B';
        return 'C';
    }

    getRankColor(index) {
        if (index === 0) return 'bg-yellow-500';
        if (index === 1) return 'bg-gray-400';
        if (index === 2) return 'bg-orange-600';
        return 'bg-gray-600';
    }

    getCostRatingColor(rating) {
        switch (rating) {
            case 'A+': return 'bg-green-100 text-green-800';
            case 'A': return 'bg-green-100 text-green-700';
            case 'B+': return 'bg-yellow-100 text-yellow-800';
            case 'B': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-red-100 text-red-800';
        }
    }

    generateOptimizationSuggestions() {
        const container = document.getElementById('optimization-suggestions');
        const suggestions = this.calculateOptimizationOpportunities();
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="p-4 rounded-lg border-l-4 ${this.getSuggestionColor(suggestion.type)} bg-gray-700/30">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        ${this.getSuggestionIcon(suggestion.type)}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-white mb-1">${suggestion.title}</h4>
                        <p class="text-gray-300 text-sm mb-2">${suggestion.description}</p>
                        <div class="text-xs text-gray-400">
                            預估節省: <span class="text-green-400 font-semibold">${this.formatCurrency(suggestion.potentialSavings)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    calculateOptimizationOpportunities() {
        const suggestions = [];
        const purchases = this.getFilteredPurchases();
        const supplierPerformance = this.calculateSupplierPerformance();
        
        // 高成本供應商建議
        const highCostSuppliers = supplierPerformance
            .filter(s => s.costEfficiency > 3000)
            .sort((a, b) => b.costEfficiency - a.costEfficiency)
            .slice(0, 3);
            
        if (highCostSuppliers.length > 0) {
            suggestions.push({
                type: 'cost',
                title: '高成本供應商優化',
                description: `${highCostSuppliers[0].name} 等供應商的平均訂單金額較高，建議重新談判價格或尋找替代供應商。`,
                potentialSavings: highCostSuppliers[0].totalCost * 0.1
            });
        }

        // 交貨延遲建議
        const lateSuppliers = supplierPerformance
            .filter(s => s.onTimeRate < 80)
            .sort((a, b) => a.onTimeRate - b.onTimeRate);
            
        if (lateSuppliers.length > 0) {
            suggestions.push({
                type: 'delivery',
                title: '改善交貨效率',
                description: `${lateSuppliers[0].name} 等供應商準時交貨率偏低，建議建立配送時程管理機制。`,
                potentialSavings: 5000 // 估算因延遲造成的損失
            });
        }

        // 採購量最佳化
        const categoryData = this.calculateCategoryCosts();
        const maxCategoryIndex = categoryData.data.indexOf(Math.max(...categoryData.data));
        if (maxCategoryIndex >= 0) {
            suggestions.push({
                type: 'volume',
                title: '採購量最佳化',
                description: `${categoryData.labels[maxCategoryIndex]} 類別採購量最大，建議批量採購以獲得更好價格。`,
                potentialSavings: categoryData.data[maxCategoryIndex] * 0.05
            });
        }

        // 庫存週轉建議
        suggestions.push({
            type: 'inventory',
            title: '庫存週轉優化',
            description: '部分商品庫存週轉率偏低，建議調整採購頻率和數量以減少資金佔用。',
            potentialSavings: 8000
        });

        return suggestions;
    }

    getSuggestionColor(type) {
        const colors = {
            cost: 'border-red-500',
            delivery: 'border-yellow-500',
            volume: 'border-blue-500',
            inventory: 'border-green-500'
        };
        return colors[type] || 'border-gray-500';
    }

    getSuggestionIcon(type) {
        const icons = {
            cost: '<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>',
            delivery: '<svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            volume: '<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
            inventory: '<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'
        };
        return icons[type] || '';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// 初始化成本分析系統
document.addEventListener('DOMContentLoaded', () => {
    const costAnalytics = new CostAnalytics();
});
