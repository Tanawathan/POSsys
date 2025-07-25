/**
 * 採購管理使用者介面
 * 提供採購單管理、庫存管理、供應商管理等功能的完整UI
 */

class PurchaseUI {
    constructor() {
        this.purchaseManager = new PurchaseManager();
        this.currentView = 'orders';
        this.init();
    }

    /**
     * 初始化使用者介面
     */
    init() {
        this.createMainContainer();
        this.renderInterface();
        this.bindEvents();
        this.startAutoRefresh();
    }

    /**
     * 建立主容器
     */
    createMainContainer() {
        const container = document.querySelector('.container');
        
        const purchaseHTML = `
            <div id="purchase-management-container">
                <!-- 標題區 -->
                <div class="purchase-header">
                    <h2><i class="fas fa-shopping-cart"></i> 採購管理系統</h2>
                    <div class="purchase-actions">
                        <button class="btn btn-primary" onclick="purchaseUI.showNewOrderModal()">
                            <i class="fas fa-plus"></i> 新增採購單
                        </button>
                        <button class="btn btn-success" onclick="purchaseUI.exportReport()">
                            <i class="fas fa-download"></i> 匯出報告
                        </button>
                        <button class="btn btn-info" onclick="purchaseUI.refreshData()">
                            <i class="fas fa-sync"></i> 重新整理
                        </button>
                    </div>
                </div>

                <!-- 快速統計 -->
                <div class="purchase-stats">
                    <div class="stat-card total-orders">
                        <div class="stat-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-orders">0</h3>
                            <p>總採購單數</p>
                        </div>
                    </div>
                    <div class="stat-card total-value">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-value">NT$ 0</h3>
                            <p>總採購金額</p>
                        </div>
                    </div>
                    <div class="stat-card total-items">
                        <div class="stat-icon">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-items">0</h3>
                            <p>庫存品項</p>
                        </div>
                    </div>
                    <div class="stat-card expiry-alerts">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="expiry-alerts">0</h3>
                            <p>即將到期</p>
                        </div>
                    </div>
                </div>

                <!-- 導航選單 -->
                <div class="purchase-nav">
                    <button class="nav-btn active" data-view="orders">
                        <i class="fas fa-file-invoice"></i> 採購單管理
                    </button>
                    <button class="nav-btn" data-view="inventory">
                        <i class="fas fa-warehouse"></i> 庫存管理
                    </button>
                    <button class="nav-btn" data-view="suppliers">
                        <i class="fas fa-truck"></i> 供應商管理
                    </button>
                    <button class="nav-btn" data-view="reports">
                        <i class="fas fa-chart-bar"></i> 報表分析
                    </button>
                </div>

                <!-- 警示區 -->
                <div id="alerts-section" class="alerts-section"></div>

                <!-- 內容區域 -->
                <div id="purchase-content" class="purchase-content">
                    <!-- 內容將在這裡動態載入 -->
                </div>
            </div>

            <!-- 彈窗區域 -->
            <div id="purchase-modals"></div>
        `;

        container.innerHTML = purchaseHTML;
    }

    /**
     * 渲染介面
     */
    renderInterface() {
        this.updateStatistics();
        this.renderAlerts();
        this.renderContent();
    }

    /**
     * 更新統計資訊
     */
    updateStatistics() {
        const stats = this.purchaseManager.getPurchaseStatistics();
        const alerts = this.purchaseManager.checkExpiryAlerts();

        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('total-value').textContent = `NT$ ${stats.totalValue.toLocaleString()}`;
        document.getElementById('total-items').textContent = this.purchaseManager.inventory.size;
        document.getElementById('expiry-alerts').textContent = alerts.length;

        // 添加警示樣式
        const alertsCard = document.querySelector('.stat-card.expiry-alerts');
        if (alerts.length > 0) {
            alertsCard.classList.add('alert');
        } else {
            alertsCard.classList.remove('alert');
        }
    }

    /**
     * 渲染警示
     */
    renderAlerts() {
        const alertsSection = document.getElementById('alerts-section');
        const alerts = this.purchaseManager.checkExpiryAlerts();

        if (alerts.length === 0) {
            alertsSection.innerHTML = '';
            return;
        }

        const urgentAlerts = alerts.filter(a => a.type === 'urgent');
        const warningAlerts = alerts.filter(a => a.type === 'warning');

        let alertsHTML = '<div class="alerts-container">';

        if (urgentAlerts.length > 0) {
            alertsHTML += `
                <div class="alert-group urgent">
                    <h4><i class="fas fa-exclamation-circle"></i> 緊急提醒 (${urgentAlerts.length})</h4>
                    <div class="alert-items">
                        ${urgentAlerts.map(alert => `
                            <div class="alert-item">
                                <span class="ingredient">${alert.ingredient}</span>
                                <span class="details">${alert.quantity} ${alert.unit} - 還有 ${alert.daysLeft} 天到期</span>
                                <span class="date">${alert.expiryDate}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (warningAlerts.length > 0) {
            alertsHTML += `
                <div class="alert-group warning">
                    <h4><i class="fas fa-exclamation-triangle"></i> 注意提醒 (${warningAlerts.length})</h4>
                    <div class="alert-items">
                        ${warningAlerts.map(alert => `
                            <div class="alert-item">
                                <span class="ingredient">${alert.ingredient}</span>
                                <span class="details">${alert.quantity} ${alert.unit} - 還有 ${alert.daysLeft} 天到期</span>
                                <span class="date">${alert.expiryDate}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        alertsHTML += '</div>';
        alertsSection.innerHTML = alertsHTML;
    }

    /**
     * 渲染內容區域
     */
    renderContent() {
        const content = document.getElementById('purchase-content');
        
        switch (this.currentView) {
            case 'orders':
                content.innerHTML = this.renderOrdersView();
                break;
            case 'inventory':
                content.innerHTML = this.renderInventoryView();
                break;
            case 'suppliers':
                content.innerHTML = this.renderSuppliersView();
                break;
            case 'reports':
                content.innerHTML = this.renderReportsView();
                break;
        }
    }

    /**
     * 渲染採購單管理視圖
     */
    renderOrdersView() {
        const orders = this.purchaseManager.purchaseOrders;
        
        return `
            <div class="orders-management">
                <div class="orders-header">
                    <h3>採購單列表</h3>
                    <div class="orders-filters">
                        <select id="status-filter" onchange="purchaseUI.filterOrders()">
                            <option value="">所有狀態</option>
                            <option value="待確認">待確認</option>
                            <option value="已確認">已確認</option>
                            <option value="配送中">配送中</option>
                            <option value="已到貨">已到貨</option>
                            <option value="已取消">已取消</option>
                        </select>
                        <select id="supplier-filter" onchange="purchaseUI.filterOrders()">
                            <option value="">所有供應商</option>
                            ${this.purchaseManager.suppliers.map(s => 
                                `<option value="${s.id}">${s.name}</option>`
                            ).join('')}
                        </select>
                        <input type="text" id="search-orders" placeholder="搜尋採購單..." 
                               onkeyup="purchaseUI.filterOrders()">
                    </div>
                </div>

                <div class="orders-list">
                    ${orders.map(order => `
                        <div class="order-card" data-order-id="${order.id}">
                            <div class="order-header">
                                <div class="order-info">
                                    <h4>${order.id}</h4>
                                    <p class="supplier">${order.supplierName}</p>
                                    <p class="date">${order.date}</p>
                                </div>
                                <div class="order-status">
                                    <span class="status-badge ${order.status}">${order.status}</span>
                                    <p class="amount">NT$ ${order.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div class="order-items">
                                <h5>採購項目 (${order.items.length})</h5>
                                <div class="items-preview">
                                    ${order.items.slice(0, 3).map(item => `<span class="item-tag">${item}</span>`).join('')}
                                    ${order.items.length > 3 ? `<span class="item-tag more">+${order.items.length - 3}</span>` : ''}
                                </div>
                            </div>

                            <div class="order-actions">
                                <button class="btn btn-sm btn-info" onclick="purchaseUI.showOrderDetails('${order.id}')">
                                    <i class="fas fa-eye"></i> 詳情
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="purchaseUI.editOrder('${order.id}')">
                                    <i class="fas fa-edit"></i> 編輯
                                </button>
                                ${order.status !== '已到貨' ? `
                                    <button class="btn btn-sm btn-success" onclick="purchaseUI.markAsDelivered('${order.id}')">
                                        <i class="fas fa-check"></i> 標記到貨
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染庫存管理視圖
     */
    renderInventoryView() {
        const inventory = Array.from(this.purchaseManager.inventory.entries());
        const report = this.purchaseManager.getInventoryReport();
        
        return `
            <div class="inventory-management">
                <div class="inventory-header">
                    <h3>庫存管理</h3>
                    <div class="inventory-summary">
                        <div class="summary-item">
                            <span class="label">總價值</span>
                            <span class="value">NT$ ${report.totalValue.toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">品項數量</span>
                            <span class="value">${report.totalItems}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">庫存不足</span>
                            <span class="value alert">${report.lowStock.length}</span>
                        </div>
                    </div>
                </div>

                <div class="inventory-filters">
                    <select id="category-filter" onchange="purchaseUI.filterInventory()">
                        <option value="">所有分類</option>
                        ${Object.keys(report.categories).map(cat => 
                            `<option value="${cat}">${cat}</option>`
                        ).join('')}
                    </select>
                    <select id="status-filter" onchange="purchaseUI.filterInventory()">
                        <option value="">所有狀態</option>
                        <option value="good">狀態良好</option>
                        <option value="caution">注意</option>
                        <option value="warning">警告</option>
                        <option value="urgent">緊急</option>
                    </select>
                    <input type="text" id="search-inventory" placeholder="搜尋食材..." 
                           onkeyup="purchaseUI.filterInventory()">
                </div>

                <div class="inventory-grid">
                    ${inventory.map(([ingredient, item]) => `
                        <div class="inventory-card ${item.status}" data-ingredient="${ingredient}">
                            <div class="card-header">
                                <h4>${ingredient}</h4>
                                <span class="category-tag">${item.category}</span>
                            </div>
                            
                            <div class="card-body">
                                <div class="quantity-info">
                                    <div class="quantity">
                                        <span class="number">${item.totalQuantity}</span>
                                        <span class="unit">${item.unit}</span>
                                    </div>
                                    <div class="weight">
                                        <span class="label">重量</span>
                                        <span class="value">${item.totalWeight}g</span>
                                    </div>
                                </div>
                                
                                <div class="batches-info">
                                    <span class="label">批次</span>
                                    <span class="value">${item.batches.length}</span>
                                </div>
                                
                                <div class="cost-info">
                                    <span class="label">平均成本</span>
                                    <span class="value">NT$ ${item.averageCost.toFixed(2)}</span>
                                </div>
                            </div>

                            <div class="card-footer">
                                <div class="expiry-info">
                                    <span class="next-expiry">
                                        最近到期: ${item.batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate || 'N/A'}
                                    </span>
                                </div>
                                <div class="actions">
                                    <button class="btn btn-sm btn-info" onclick="purchaseUI.showInventoryDetails('${ingredient}')">
                                        <i class="fas fa-eye"></i> 詳情
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="purchaseUI.useInventory('${ingredient}')">
                                        <i class="fas fa-minus"></i> 使用
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染供應商管理視圖
     */
    renderSuppliersView() {
        const suppliers = this.purchaseManager.suppliers;
        const performance = this.purchaseManager.getSupplierPerformance();
        
        return `
            <div class="suppliers-management">
                <div class="suppliers-header">
                    <h3>供應商管理</h3>
                    <button class="btn btn-primary" onclick="purchaseUI.showNewSupplierModal()">
                        <i class="fas fa-plus"></i> 新增供應商
                    </button>
                </div>

                <div class="suppliers-grid">
                    ${suppliers.map(supplier => {
                        const perf = performance[supplier.id];
                        return `
                            <div class="supplier-card" data-supplier-id="${supplier.id}">
                                <div class="card-header">
                                    <h4>${supplier.name}</h4>
                                    <div class="rating">
                                        ${this.renderStars(supplier.rating)}
                                        <span class="rating-value">${supplier.rating}</span>
                                    </div>
                                </div>
                                
                                <div class="card-body">
                                    <div class="contact-info">
                                        <p><i class="fas fa-user"></i> ${supplier.contact}</p>
                                        <p><i class="fas fa-phone"></i> ${supplier.phone}</p>
                                        <p><i class="fas fa-envelope"></i> ${supplier.email}</p>
                                    </div>
                                    
                                    <div class="business-info">
                                        <div class="info-item">
                                            <span class="label">分類</span>
                                            <span class="value">${supplier.category}</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="label">付款條件</span>
                                            <span class="value">${supplier.paymentTerms}</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="label">最低訂購</span>
                                            <span class="value">NT$ ${supplier.minOrderAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="performance-info">
                                        <div class="perf-item">
                                            <span class="label">總訂單</span>
                                            <span class="value">${perf.totalOrders}</span>
                                        </div>
                                        <div class="perf-item">
                                            <span class="label">完成率</span>
                                            <span class="value">${perf.completionRate}%</span>
                                        </div>
                                        <div class="perf-item">
                                            <span class="label">總金額</span>
                                            <span class="value">NT$ ${perf.totalValue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="card-footer">
                                    <button class="btn btn-sm btn-info" onclick="purchaseUI.showSupplierDetails('${supplier.id}')">
                                        <i class="fas fa-eye"></i> 詳情
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="purchaseUI.editSupplier('${supplier.id}')">
                                        <i class="fas fa-edit"></i> 編輯
                                    </button>
                                    <button class="btn btn-sm btn-primary" onclick="purchaseUI.createOrderForSupplier('${supplier.id}')">
                                        <i class="fas fa-plus"></i> 新訂單
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染報表分析視圖
     */
    renderReportsView() {
        const stats = this.purchaseManager.getPurchaseStatistics();
        const inventoryReport = this.purchaseManager.getInventoryReport();
        const supplierPerformance = this.purchaseManager.getSupplierPerformance();
        
        return `
            <div class="reports-analysis">
                <div class="reports-header">
                    <h3>報表分析</h3>
                    <div class="report-actions">
                        <button class="btn btn-primary" onclick="purchaseUI.exportReport('pdf')">
                            <i class="fas fa-file-pdf"></i> 匯出PDF
                        </button>
                        <button class="btn btn-success" onclick="purchaseUI.exportReport('excel')">
                            <i class="fas fa-file-excel"></i> 匯出Excel
                        </button>
                    </div>
                </div>

                <div class="reports-grid">
                    <!-- 採購統計 -->
                    <div class="report-section">
                        <h4>採購統計</h4>
                        <div class="stats-cards">
                            <div class="stat-item">
                                <span class="label">總訂單數</span>
                                <span class="value">${stats.totalOrders}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">總金額</span>
                                <span class="value">NT$ ${stats.totalValue.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">平均訂單</span>
                                <span class="value">NT$ ${stats.averageOrderValue}</span>
                            </div>
                        </div>
                        
                        <div class="status-distribution">
                            <h5>狀態分布</h5>
                            ${Object.entries(stats.statusDistribution).map(([status, count]) => `
                                <div class="distribution-item">
                                    <span class="status-label ${status}">${status}</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${(count / stats.totalOrders * 100)}%"></div>
                                    </div>
                                    <span class="count">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 庫存分析 -->
                    <div class="report-section">
                        <h4>庫存分析</h4>
                        <div class="category-distribution">
                            <h5>分類分布</h5>
                            ${Object.entries(inventoryReport.categories).map(([category, data]) => `
                                <div class="category-item">
                                    <span class="category-label">${category}</span>
                                    <div class="category-stats">
                                        <span class="count">${data.count} 項</span>
                                        <span class="value">NT$ ${data.value.toFixed(0)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        ${inventoryReport.lowStock.length > 0 ? `
                            <div class="low-stock-alerts">
                                <h5>庫存不足警示</h5>
                                ${inventoryReport.lowStock.map(item => `
                                    <div class="alert-item warning">
                                        <span class="ingredient">${item.ingredient}</span>
                                        <span class="current">${item.current}g</span>
                                        <span class="minimum">需要 ${item.minimum}g</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- 供應商績效 -->
                    <div class="report-section">
                        <h4>供應商績效</h4>
                        <div class="supplier-performance">
                            ${Object.entries(supplierPerformance).map(([id, perf]) => `
                                <div class="performance-item">
                                    <div class="supplier-info">
                                        <h5>${perf.name}</h5>
                                        <p>${perf.category}</p>
                                    </div>
                                    <div class="performance-metrics">
                                        <div class="metric">
                                            <span class="label">完成率</span>
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${perf.completionRate}%"></div>
                                            </div>
                                            <span class="value">${perf.completionRate}%</span>
                                        </div>
                                        <div class="metric">
                                            <span class="label">總金額</span>
                                            <span class="value">NT$ ${perf.totalValue.toLocaleString()}</span>
                                        </div>
                                        <div class="metric">
                                            <span class="label">評分</span>
                                            <span class="value">${this.renderStars(perf.rating)} ${perf.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染星級評分
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 導航切換
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.renderContent();
            });
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchView('orders');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchView('inventory');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchView('suppliers');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchView('reports');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showNewOrderModal();
                        break;
                }
            }
        });
    }

    /**
     * 切換視圖
     */
    switchView(view) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        this.currentView = view;
        this.renderContent();
    }

    /**
     * 顯示新增採購單彈窗
     */
    showNewOrderModal() {
        const modalHTML = `
            <div class="modal" id="new-order-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>新增採購單</h3>
                        <button class="close-modal" onclick="purchaseUI.closeModal('new-order-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="new-order-form">
                            <div class="form-group">
                                <label>採購單號</label>
                                <input type="text" id="order-id" placeholder="系統自動產生" readonly>
                            </div>
                            <div class="form-group">
                                <label>供應商</label>
                                <select id="order-supplier" required>
                                    <option value="">請選擇供應商</option>
                                    ${this.purchaseManager.suppliers.map(s => 
                                        `<option value="${s.id}">${s.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>預計到貨日期</label>
                                <input type="date" id="delivery-date" required>
                            </div>
                            <div class="form-group">
                                <label>負責人</label>
                                <input type="text" id="responsible" placeholder="負責人姓名">
                            </div>
                            <div class="form-group">
                                <label>備註</label>
                                <textarea id="order-notes" placeholder="採購備註"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="purchaseUI.closeModal('new-order-modal')">
                            取消
                        </button>
                        <button class="btn btn-primary" onclick="purchaseUI.createOrder()">
                            建立採購單
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('purchase-modals').innerHTML = modalHTML;
        document.getElementById('new-order-modal').classList.remove('hidden');
        
        // 設定預設日期為明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('delivery-date').value = tomorrow.toISOString().split('T')[0];
    }

    /**
     * 顯示採購單詳情
     */
    showOrderDetails(orderId) {
        const order = this.purchaseManager.purchaseOrders.find(o => o.id === orderId);
        const items = this.purchaseManager.purchaseItems.filter(i => i.orderId === orderId);
        
        if (!order) return;

        const modalHTML = `
            <div class="modal" id="order-details-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>採購單詳情 - ${order.id}</h3>
                        <button class="close-modal" onclick="purchaseUI.closeModal('order-details-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="order-details">
                            <div class="detail-row">
                                <span class="label">採購單號</span>
                                <span class="value">${order.id}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">供應商</span>
                                <span class="value">${order.supplierName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">採購日期</span>
                                <span class="value">${order.date}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">到貨日期</span>
                                <span class="value">${order.deliveryDate || '未設定'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">狀態</span>
                                <span class="value">
                                    <span class="status-badge ${order.status}">${order.status}</span>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="label">總金額</span>
                                <span class="value">NT$ ${order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="items-details">
                            <h4>採購項目</h4>
                            <div class="items-table">
                                <div class="table-header">
                                    <span>品名</span>
                                    <span>數量</span>
                                    <span>單位</span>
                                    <span>金額</span>
                                    <span>狀態</span>
                                </div>
                                ${items.map(item => `
                                    <div class="table-row">
                                        <span>${item.name}</span>
                                        <span>${item.quantity}</span>
                                        <span>${item.unit}</span>
                                        <span>NT$ ${item.amount}</span>
                                        <span class="status ${item.inStock ? 'in-stock' : 'pending'}">
                                            ${item.inStock ? '已入庫' : '待入庫'}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        ${order.notes ? `
                            <div class="order-notes">
                                <h4>備註</h4>
                                <p>${order.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="purchaseUI.closeModal('order-details-modal')">
                            關閉
                        </button>
                        ${order.status !== '已到貨' ? `
                            <button class="btn btn-success" onclick="purchaseUI.markAsDelivered('${order.id}')">
                                標記為已到貨
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('purchase-modals').innerHTML = modalHTML;
        document.getElementById('order-details-modal').classList.remove('hidden');
    }

    /**
     * 標記為已到貨
     */
    markAsDelivered(orderId) {
        this.purchaseManager.updateOrderStatus(orderId, '已到貨');
        this.renderInterface();
        this.closeModal('order-details-modal');
        this.showNotification('success', '採購單已標記為已到貨');
    }

    /**
     * 匯出報告
     */
    exportReport(format = 'json') {
        const report = this.purchaseManager.exportPurchaseReport(format);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `purchase-report-${timestamp}.${format === 'json' ? 'json' : 'csv'}`;
        
        const blob = new Blob([report], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('success', `報告已匯出: ${filename}`);
    }

    /**
     * 關閉彈窗
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    /**
     * 顯示通知
     */
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'warning' ? 'fa-exclamation-triangle' :
                           type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * 重新整理資料
     */
    refreshData() {
        this.purchaseManager.init();
        this.renderInterface();
        this.showNotification('success', '資料已重新整理');
    }

    /**
     * 開始自動重新整理
     */
    startAutoRefresh() {
        setInterval(() => {
            this.updateStatistics();
            this.renderAlerts();
        }, 60000); // 每分鐘更新一次
    }

    /**
     * 過濾採購單
     */
    filterOrders() {
        // 實作採購單過濾邏輯
        console.log('過濾採購單');
    }

    /**
     * 過濾庫存
     */
    filterInventory() {
        // 實作庫存過濾邏輯
        console.log('過濾庫存');
    }
}

// 全域購物實例
let purchaseUI;

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    if (typeof PurchaseManager !== 'undefined') {
        purchaseUI = new PurchaseUI();
    }
});
