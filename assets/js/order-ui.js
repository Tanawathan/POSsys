/**
 * 訂單管理使用者介面
 * 提供完整的訂單操作介面，包括點餐、修改、結帳、廚房管理等功能
 */

class OrderUI {
    constructor() {
        this.orderManager = new OrderManager();
        this.currentView = 'active';
        this.selectedTableId = null;
        this.selectedOrderId = null;
        this.autoRefreshInterval = null;
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
        
        const orderHTML = `
            <div id="order-management-container">
                <!-- 標題區 -->
                <div class="order-header">
                    <h2><i class="fas fa-receipt"></i> 訂單管理系統</h2>
                    <div class="order-actions">
                        <button class="btn btn-primary" onclick="orderUI.showNewOrderModal()">
                            <i class="fas fa-plus"></i> 新增訂單
                        </button>
                        <button class="btn btn-info" onclick="orderUI.showKitchenView()">
                            <i class="fas fa-kitchen-set"></i> 廚房檢視
                        </button>
                        <button class="btn btn-warning" onclick="orderUI.showReportsModal()">
                            <i class="fas fa-chart-bar"></i> 報表統計
                        </button>
                        <button class="btn btn-success" onclick="orderUI.exportOrders()">
                            <i class="fas fa-download"></i> 匯出資料
                        </button>
                    </div>
                </div>

                <!-- 快速統計 -->
                <div class="order-stats">
                    <div class="stat-card active-orders">
                        <div class="stat-icon">
                            <i class="fas fa-list-alt"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="active-orders-count">0</h3>
                            <p>進行中訂單</p>
                        </div>
                    </div>
                    <div class="stat-card today-revenue">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="today-revenue">NT$ 0</h3>
                            <p>今日營收</p>
                        </div>
                    </div>
                    <div class="stat-card today-orders">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="today-orders-count">0</h3>
                            <p>今日訂單</p>
                        </div>
                    </div>
                    <div class="stat-card avg-order-value">
                        <div class="stat-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="avg-order-value">NT$ 0</h3>
                            <p>平均客單價</p>
                        </div>
                    </div>
                </div>

                <!-- 導航選單 -->
                <div class="order-nav">
                    <button class="nav-btn active" data-view="active">
                        <i class="fas fa-clock"></i> 進行中訂單
                    </button>
                    <button class="nav-btn" data-view="kitchen">
                        <i class="fas fa-utensils"></i> 廚房管理
                    </button>
                    <button class="nav-btn" data-view="ready">
                        <i class="fas fa-check-circle"></i> 待送餐
                    </button>
                    <button class="nav-btn" data-view="completed">
                        <i class="fas fa-history"></i> 已完成
                    </button>
                    <button class="nav-btn" data-view="analytics">
                        <i class="fas fa-analytics"></i> 分析報表
                    </button>
                </div>

                <!-- 快速操作區 -->
                <div class="quick-actions">
                    <div class="table-selector">
                        <label>選擇桌號:</label>
                        <select id="table-filter" onchange="orderUI.filterByTable(this.value)">
                            <option value="">全部桌號</option>
                            <option value="圓1">圓1</option>
                            <option value="圓2">圓2</option>
                            <option value="圓3">圓3</option>
                            <option value="圓4">圓4</option>
                            <option value="圓5">圓5</option>
                            <option value="圓6">圓6</option>
                        </select>
                    </div>
                    <div class="status-filters">
                        <button class="filter-btn active" data-status="all">全部</button>
                        <button class="filter-btn" data-status="點餐中">點餐中</button>
                        <button class="filter-btn" data-status="已確認">已確認</button>
                        <button class="filter-btn" data-status="製作中">製作中</button>
                        <button class="filter-btn" data-status="製作完成">製作完成</button>
                        <button class="filter-btn" data-status="已送達">已送達</button>
                    </div>
                    <div class="search-box">
                        <input type="text" id="order-search" placeholder="搜尋訂單編號..." onkeyup="orderUI.searchOrders()">
                        <button onclick="orderUI.searchOrders()">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                <!-- 內容區域 -->
                <div id="order-content" class="order-content">
                    <!-- 內容將在這裡動態載入 -->
                </div>
            </div>

            <!-- 彈窗區域 -->
            <div id="order-modals"></div>
        `;

        container.innerHTML = orderHTML;
    }

    /**
     * 渲染介面
     */
    renderInterface() {
        this.updateStatistics();
        this.renderContent();
    }

    /**
     * 更新統計資訊
     */
    updateStatistics() {
        const activeOrders = this.orderManager.getActiveOrders();
        const todayStats = this.orderManager.getTodayStatistics();

        document.getElementById('active-orders-count').textContent = activeOrders.length;
        document.getElementById('today-revenue').textContent = `NT$ ${todayStats.totalRevenue.toLocaleString()}`;
        document.getElementById('today-orders-count').textContent = todayStats.totalOrders;
        document.getElementById('avg-order-value').textContent = `NT$ ${Math.round(todayStats.averageOrderValue).toLocaleString()}`;
    }

    /**
     * 渲染內容區域
     */
    renderContent() {
        const content = document.getElementById('order-content');
        
        switch (this.currentView) {
            case 'active':
                content.innerHTML = this.renderActiveOrdersView();
                break;
            case 'kitchen':
                content.innerHTML = this.renderKitchenView();
                break;
            case 'ready':
                content.innerHTML = this.renderReadyOrdersView();
                break;
            case 'completed':
                content.innerHTML = this.renderCompletedOrdersView();
                break;
            case 'analytics':
                content.innerHTML = this.renderAnalyticsView();
                break;
        }
    }

    /**
     * 渲染進行中訂單視圖
     */
    renderActiveOrdersView() {
        const activeOrders = this.orderManager.getActiveOrders();
        
        return `
            <div class="active-orders">
                <div class="view-header">
                    <h3>進行中訂單 (${activeOrders.length})</h3>
                    <div class="view-actions">
                        <button class="btn btn-sm btn-info" onclick="orderUI.refreshData()">
                            <i class="fas fa-sync"></i> 重新整理
                        </button>
                    </div>
                </div>

                ${activeOrders.length === 0 ? `
                    <div class="no-orders">
                        <i class="fas fa-receipt"></i>
                        <h4>目前沒有進行中的訂單</h4>
                        <p>您可以新增訂單或檢查其他檢視</p>
                        <button class="btn btn-primary" onclick="orderUI.showNewOrderModal()">
                            <i class="fas fa-plus"></i> 新增訂單
                        </button>
                    </div>
                ` : `
                    <div class="orders-grid">
                        ${activeOrders.map(order => this.renderOrderCard(order)).join('')}
                    </div>
                `}
            </div>
        `;
    }

    /**
     * 渲染訂單卡片
     */
    renderOrderCard(order) {
        const statusClass = this.getStatusClass(order.status);
        const elapsedTime = this.calculateElapsedTime(order.createdAt);
        
        return `
            <div class="order-card ${statusClass}" data-order-id="${order.id}">
                <div class="card-header">
                    <div class="order-info">
                        <h4>${order.id}</h4>
                        <p class="table-info">
                            <i class="fas fa-table"></i> ${order.tableId}
                            <span class="customer-count">
                                <i class="fas fa-users"></i> ${order.customerCount} 人
                            </span>
                        </p>
                        <p class="order-time">
                            <i class="fas fa-clock"></i> ${elapsedTime}
                        </p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${order.status}</span>
                        <div class="order-total">
                            <span class="total-amount">NT$ ${order.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="order-items">
                    <h5>訂單內容 (${order.items.length} 項)</h5>
                    <div class="items-list">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="item-row">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">×${item.quantity}</span>
                                <span class="item-price">NT$ ${item.subtotal}</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `
                            <div class="more-items">
                                還有 ${order.items.length - 3} 項商品...
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${order.notes ? `
                    <div class="order-notes">
                        <i class="fas fa-sticky-note"></i> ${order.notes}
                    </div>
                ` : ''}

                ${order.kitchen.estimatedTime && order.status === '製作中' ? `
                    <div class="kitchen-info">
                        <i class="fas fa-hourglass-half"></i>
                        預計完成: ${new Date(order.kitchen.estimatedTime).toLocaleTimeString('zh-TW', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                ` : ''}

                <div class="card-actions">
                    ${order.status === '點餐中' ? `
                        <button class="btn btn-sm btn-success" onclick="orderUI.confirmOrder('${order.id}')">
                            <i class="fas fa-check"></i> 確認訂單
                        </button>
                        <button class="btn btn-sm btn-info" onclick="orderUI.editOrder('${order.id}')">
                            <i class="fas fa-edit"></i> 編輯
                        </button>
                    ` : ''}
                    
                    ${order.status === '已確認' ? `
                        <button class="btn btn-sm btn-warning" onclick="orderUI.startCooking('${order.id}')">
                            <i class="fas fa-fire"></i> 開始製作
                        </button>
                    ` : ''}
                    
                    ${order.status === '製作中' ? `
                        <button class="btn btn-sm btn-info" onclick="orderUI.markReady('${order.id}')">
                            <i class="fas fa-check-circle"></i> 製作完成
                        </button>
                    ` : ''}
                    
                    ${order.status === '製作完成' || order.status === '已送達' ? `
                        <button class="btn btn-sm btn-success" onclick="orderUI.showPaymentModal('${order.id}')">
                            <i class="fas fa-credit-card"></i> 結帳
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-sm btn-info" onclick="orderUI.showOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> 詳情
                    </button>
                    
                    ${order.status !== '已結帳' ? `
                        <button class="btn btn-sm btn-danger" onclick="orderUI.cancelOrder('${order.id}')">
                            <i class="fas fa-times"></i> 取消
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 取得狀態樣式類別
     */
    getStatusClass(status) {
        const statusClasses = {
            '點餐中': 'ordering',
            '已確認': 'confirmed',
            '製作中': 'cooking',
            '製作完成': 'ready',
            '已送達': 'served',
            '已結帳': 'paid',
            '已取消': 'cancelled'
        };
        return statusClasses[status] || 'unknown';
    }

    /**
     * 計算經過時間
     */
    calculateElapsedTime(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = now - created;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours} 小時 ${minutes % 60} 分鐘前`;
        } else {
            return `${minutes} 分鐘前`;
        }
    }

    /**
     * 渲染廚房檢視
     */
    renderKitchenView() {
        const kitchenOrders = this.orderManager.getKitchenOrders();
        
        return `
            <div class="kitchen-view">
                <div class="view-header">
                    <h3>廚房訂單 (${kitchenOrders.length})</h3>
                    <div class="kitchen-controls">
                        <button class="btn btn-sm btn-warning" onclick="orderUI.markAllReady()">
                            <i class="fas fa-check-double"></i> 全部完成
                        </button>
                    </div>
                </div>

                ${kitchenOrders.length === 0 ? `
                    <div class="no-orders">
                        <i class="fas fa-utensils"></i>
                        <h4>廚房暫無待製作訂單</h4>
                        <p>所有訂單都已完成或尚未確認</p>
                    </div>
                ` : `
                    <div class="kitchen-orders">
                        ${kitchenOrders.map(order => this.renderKitchenOrderCard(order)).join('')}
                    </div>
                `}
            </div>
        `;
    }

    /**
     * 渲染廚房訂單卡片
     */
    renderKitchenOrderCard(order) {
        const priority = this.calculateOrderPriority(order);
        const estimatedTime = order.kitchen.estimatedTime ? 
            new Date(order.kitchen.estimatedTime).toLocaleTimeString('zh-TW', {hour: '2-digit', minute: '2-digit'}) : 
            '未設定';
        
        return `
            <div class="kitchen-order-card priority-${priority}" data-order-id="${order.id}">
                <div class="kitchen-header">
                    <div class="order-basic">
                        <h4>${order.tableId}</h4>
                        <span class="order-number">#${order.id.split('-').slice(-1)[0]}</span>
                        <span class="customer-count">${order.customerCount} 人</span>
                    </div>
                    <div class="kitchen-timing">
                        <div class="elapsed-time">
                            ${this.calculateElapsedTime(order.kitchen.startTime || order.updatedAt)}
                        </div>
                        <div class="estimated-time">
                            預計: ${estimatedTime}
                        </div>
                    </div>
                </div>

                <div class="kitchen-items">
                    ${order.items.map(item => `
                        <div class="kitchen-item">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">×${item.quantity}</span>
                            </div>
                            ${item.customizations && item.customizations.length > 0 ? `
                                <div class="customizations">
                                    ${item.customizations.map(custom => `<span class="custom-tag">${custom}</span>`).join('')}
                                </div>
                            ` : ''}
                            ${item.notes ? `
                                <div class="item-notes">
                                    <i class="fas fa-sticky-note"></i> ${item.notes}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                ${order.notes ? `
                    <div class="kitchen-notes">
                        <i class="fas fa-exclamation-triangle"></i> ${order.notes}
                    </div>
                ` : ''}

                <div class="kitchen-actions">
                    ${order.status === '已確認' ? `
                        <button class="btn btn-sm btn-warning" onclick="orderUI.startCooking('${order.id}')">
                            <i class="fas fa-play"></i> 開始製作
                        </button>
                    ` : ''}
                    
                    ${order.status === '製作中' ? `
                        <button class="btn btn-sm btn-success" onclick="orderUI.markReady('${order.id}')">
                            <i class="fas fa-check"></i> 製作完成
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 計算訂單優先級
     */
    calculateOrderPriority(order) {
        const elapsed = Date.now() - new Date(order.kitchen.startTime || order.updatedAt);
        const minutes = elapsed / (1000 * 60);
        
        if (minutes > 30) return 'high';
        if (minutes > 15) return 'medium';
        return 'low';
    }

    /**
     * 顯示新增訂單彈窗
     */
    showNewOrderModal() {
        const modalHTML = `
            <div class="modal" id="new-order-modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>新增訂單</h3>
                        <button class="close-modal" onclick="orderUI.closeModal('new-order-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="new-order-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>選擇桌號 *</label>
                                    <select id="order-table" required>
                                        <option value="">請選擇桌號</option>
                                        <option value="圓1">圓1</option>
                                        <option value="圓2">圓2</option>
                                        <option value="圓3">圓3</option>
                                        <option value="圓4">圓4</option>
                                        <option value="圓5">圓5</option>
                                        <option value="圓6">圓6</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>用餐人數 *</label>
                                    <input type="number" id="customer-count" min="1" max="12" value="2" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>服務員</label>
                                <input type="text" id="waiter-name" placeholder="服務員姓名">
                            </div>
                            
                            <div class="form-group">
                                <label>備註</label>
                                <textarea id="order-notes" placeholder="特殊需求或備註"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="orderUI.closeModal('new-order-modal')">
                            取消
                        </button>
                        <button class="btn btn-primary" onclick="orderUI.createOrder()">
                            建立訂單
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('order-modals').innerHTML = modalHTML;
        document.getElementById('new-order-modal').classList.remove('hidden');
    }

    /**
     * 建立訂單
     */
    createOrder() {
        const formData = {
            tableId: document.getElementById('order-table').value,
            customerCount: parseInt(document.getElementById('customer-count').value),
            waiter: document.getElementById('waiter-name').value,
            notes: document.getElementById('order-notes').value
        };

        if (!formData.tableId) {
            this.showNotification('error', '請選擇桌號');
            return;
        }

        try {
            const result = this.orderManager.createOrder(
                formData.tableId, 
                formData.customerCount, 
                { waiter: formData.waiter }
            );
            
            if (result.success) {
                // 設定備註
                if (formData.notes) {
                    const order = this.orderManager.orders.get(result.orderId);
                    order.notes = formData.notes;
                    order.waiter = formData.waiter;
                    this.orderManager.saveOrderData();
                }
                
                this.showNotification('success', '訂單建立成功！');
                this.closeModal('new-order-modal');
                this.renderInterface();
                
                // 自動開啟點餐介面
                this.showMenuSelectionModal(result.orderId);
            }
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 顯示菜單選擇彈窗
     */
    showMenuSelectionModal(orderId) {
        // 這裡可以整合菜單管理系統
        this.showNotification('info', `訂單 ${orderId} 已建立，請添加餐點`);
    }

    /**
     * 確認訂單
     */
    confirmOrder(orderId) {
        try {
            this.orderManager.updateOrderStatus(orderId, '已確認');
            this.showNotification('success', '訂單已確認');
            this.renderInterface();
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 開始製作
     */
    startCooking(orderId) {
        try {
            this.orderManager.updateOrderStatus(orderId, '製作中');
            this.showNotification('success', '開始製作');
            this.renderInterface();
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 標記完成
     */
    markReady(orderId) {
        try {
            this.orderManager.updateOrderStatus(orderId, '製作完成');
            this.showNotification('success', '製作完成');
            this.renderInterface();
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 顯示付款彈窗
     */
    showPaymentModal(orderId) {
        const order = this.orderManager.getOrderDetails(orderId);
        if (!order) return;

        const modalHTML = `
            <div class="modal" id="payment-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>結帳 - ${order.tableId}</h3>
                        <button class="close-modal" onclick="orderUI.closeModal('payment-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="payment-summary">
                            <h4>訂單摘要</h4>
                            <div class="summary-row">
                                <span>小計</span>
                                <span>NT$ ${order.subtotal.toLocaleString()}</span>
                            </div>
                            <div class="summary-row">
                                <span>服務費 (10%)</span>
                                <span>NT$ ${order.serviceCharge.toLocaleString()}</span>
                            </div>
                            <div class="summary-row">
                                <span>稅額 (5%)</span>
                                <span>NT$ ${order.tax.toLocaleString()}</span>
                            </div>
                            <div class="summary-row total">
                                <span>總計</span>
                                <span>NT$ ${order.total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="payment-method">
                            <label>付款方式 *</label>
                            <select id="payment-method" required>
                                <option value="">請選擇付款方式</option>
                                <option value="現金">現金</option>
                                <option value="信用卡">信用卡</option>
                                <option value="行動支付">行動支付</option>
                                <option value="電子票證">電子票證</option>
                                <option value="轉帳">轉帳</option>
                            </select>
                        </div>

                        <div class="payment-amount">
                            <label>收取金額</label>
                            <input type="number" id="paid-amount" value="${order.total}" min="${order.total}" step="1">
                        </div>

                        <div class="payment-notes">
                            <label>付款備註</label>
                            <textarea id="payment-notes" placeholder="發票號碼、統編等"></textarea>
                        </div>

                        <div class="change-amount" id="change-display" style="display: none;">
                            <strong>找零: NT$ <span id="change-amount">0</span></strong>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="orderUI.closeModal('payment-modal')">
                            取消
                        </button>
                        <button class="btn btn-success" onclick="orderUI.processPayment('${orderId}')">
                            完成結帳
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('order-modals').innerHTML = modalHTML;
        document.getElementById('payment-modal').classList.remove('hidden');

        // 綁定金額計算事件
        document.getElementById('paid-amount').addEventListener('input', (e) => {
            const paidAmount = parseFloat(e.target.value) || 0;
            const change = paidAmount - order.total;
            const changeDisplay = document.getElementById('change-display');
            const changeAmount = document.getElementById('change-amount');
            
            if (change >= 0) {
                changeAmount.textContent = change.toLocaleString();
                changeDisplay.style.display = 'block';
            } else {
                changeDisplay.style.display = 'none';
            }
        });
    }

    /**
     * 處理付款
     */
    processPayment(orderId) {
        const paymentMethod = document.getElementById('payment-method').value;
        const paidAmount = parseFloat(document.getElementById('paid-amount').value);
        const notes = document.getElementById('payment-notes').value;

        if (!paymentMethod) {
            this.showNotification('error', '請選擇付款方式');
            return;
        }

        try {
            const result = this.orderManager.processPayment(orderId, paymentMethod, paidAmount, notes);
            
            if (result.success) {
                this.showNotification('success', '結帳完成！');
                this.closeModal('payment-modal');
                this.renderInterface();
                
                if (result.change > 0) {
                    this.showNotification('info', `找零: NT$ ${result.change.toLocaleString()}`);
                }
            }
        } catch (error) {
            this.showNotification('error', error.message);
        }
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

        // 狀態篩選
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterByStatus(e.target.dataset.status);
            });
        });
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
        this.renderInterface();
        this.showNotification('success', '資料已重新整理');
    }

    /**
     * 開始自動重新整理
     */
    startAutoRefresh() {
        this.autoRefreshInterval = setInterval(() => {
            this.updateStatistics();
        }, 30000); // 每30秒更新一次統計
    }

    /**
     * 匯出訂單
     */
    exportOrders() {
        const today = new Date().toISOString().split('T')[0];
        const report = this.orderManager.exportOrderReport('csv', {
            start: today,
            end: today
        });
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `orders-${timestamp}.csv`;
        
        const blob = new Blob([report], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('success', `訂單資料已匯出: ${filename}`);
    }
}

// 全域訂單UI實例
let orderUI;

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    if (typeof OrderManager !== 'undefined') {
        orderUI = new OrderUI();
    }
});
