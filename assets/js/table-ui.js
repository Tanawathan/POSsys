// table-ui.js - 桌況管理介面
class TableUI {
    constructor() {
        this.tableManager = new TableManager();
        this.currentView = 'floor-plan';
        this.selectedTable = null;
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        this.showLoadingState();
        await this.waitForTableData();
        this.createTableContainer();
        this.bindEvents();
        this.renderTableInterface();
        this.startAutoRefresh();
    }

    showLoadingState() {
        const container = document.getElementById('table-management-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 50px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
                    <p style="margin-top: 10px; color: #666;">正在載入桌況資料...</p>
                </div>
            `;
        }
    }

    async waitForTableData() {
        // 等待TableManager初始化完成
        let attempts = 0;
        while (attempts < 50 && (!this.tableManager.tables || this.tableManager.tables.length === 0)) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (attempts >= 50) {
            console.warn('桌況資料載入超時，使用預設資料');
        }
    }

    createTableContainer() {
        const container = document.getElementById('table-management-container');
        if (!container) {
            console.error('找不到桌況管理容器');
            return;
        }
        
        container.innerHTML = `
            <div class="table-header">
                <h2><i class="fas fa-table"></i> 桌況管理系統</h2>
                <div class="table-actions">
                    <button id="refresh-tables" class="btn btn-primary">
                        <i class="fas fa-sync-alt"></i> 重新整理
                    </button>
                    <button id="add-reservation" class="btn btn-success">
                        <i class="fas fa-calendar-plus"></i> 新增預訂
                    </button>
                    <button id="table-statistics" class="btn btn-info">
                        <i class="fas fa-chart-bar"></i> 統計報表
                    </button>
                </div>
            </div>

            <div class="table-nav">
                <button class="nav-btn active" data-view="floor-plan">
                    <i class="fas fa-map"></i> 座位圖
                </button>
                <button class="nav-btn" data-view="table-list">
                    <i class="fas fa-list"></i> 桌位列表
                </button>
                <button class="nav-btn" data-view="reservations">
                    <i class="fas fa-calendar"></i> 預訂管理
                </button>
                <button class="nav-btn" data-view="statistics">
                    <i class="fas fa-analytics"></i> 營運分析
                </button>
            </div>

            <div class="table-status-bar">
                <div class="status-indicator available">
                    <span class="status-dot"></span>
                    <span class="status-text">空閒中</span>
                    <span class="status-count" id="available-count">0</span>
                </div>
                <div class="status-indicator occupied">
                    <span class="status-dot"></span>
                    <span class="status-text">使用中</span>
                    <span class="status-count" id="occupied-count">0</span>
                </div>
                <div class="status-indicator reserved">
                    <span class="status-dot"></span>
                    <span class="status-text">已預訂</span>
                    <span class="status-count" id="reserved-count">0</span>
                </div>
                <div class="status-indicator cleaning">
                    <span class="status-dot"></span>
                    <span class="status-text">清理中</span>
                    <span class="status-count" id="cleaning-count">0</span>
                </div>
                <div class="occupancy-rate">
                    入座率: <span id="occupancy-rate">0%</span>
                </div>
            </div>

            <div id="table-content" class="table-content">
                <!-- 動態內容將在這裡顯示 -->
            </div>

            <!-- 桌位操作彈窗 -->
            <div id="table-action-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">桌位操作</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-body">
                        <!-- 動態內容 -->
                    </div>
                </div>
            </div>

            <!-- 預訂彈窗 -->
            <div id="reservation-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>新增預訂</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="reservation-form">
                            <div class="form-group">
                                <label for="customer-name">客戶姓名</label>
                                <input type="text" id="customer-name" required>
                            </div>
                            <div class="form-group">
                                <label for="customer-phone">聯絡電話</label>
                                <input type="tel" id="customer-phone" required>
                            </div>
                            <div class="form-group">
                                <label for="party-size">用餐人數</label>
                                <select id="party-size" required>
                                    <option value="">請選擇</option>
                                    <option value="1">1人</option>
                                    <option value="2">2人</option>
                                    <option value="3">3人</option>
                                    <option value="4">4人</option>
                                    <option value="5">5人</option>
                                    <option value="6">6人</option>
                                    <option value="7">7人以上</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reservation-date">預訂日期</label>
                                <input type="date" id="reservation-date" required>
                            </div>
                            <div class="form-group">
                                <label for="reservation-time">預訂時間</label>
                                <input type="time" id="reservation-time" required>
                            </div>
                            <div class="form-group">
                                <label for="reservation-notes">備註</label>
                                <textarea id="reservation-notes" rows="3"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">確認預訂</button>
                                <button type="button" class="btn btn-secondary close-modal">取消</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        return container;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            // 導航切換
            if (e.target.classList.contains('nav-btn')) {
                this.switchView(e.target.dataset.view);
            }

            // 重新整理
            if (e.target.id === 'refresh-tables') {
                this.refreshTables();
            }

            // 新增預訂
            if (e.target.id === 'add-reservation') {
                this.showReservationModal();
            }

            // 統計報表
            if (e.target.id === 'table-statistics') {
                this.switchView('statistics');
            }

            // 桌位點擊
            if (e.target.classList.contains('table-item') || e.target.closest('.table-item')) {
                const tableElement = e.target.classList.contains('table-item') ? e.target : e.target.closest('.table-item');
                const tableId = tableElement.dataset.tableId;
                this.showTableActionModal(tableId);
            }

            // 關閉彈窗
            if (e.target.classList.contains('close-modal')) {
                this.closeModals();
            }

            // 桌位操作
            if (e.target.classList.contains('table-action-btn')) {
                const action = e.target.dataset.action;
                const tableId = e.target.dataset.tableId;
                this.handleTableAction(action, tableId);
            }
        });

        // 預訂表單提交
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'reservation-form') {
                e.preventDefault();
                this.handleReservationSubmit();
            }
        });

        // 點擊背景關閉彈窗
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // 更新導航按鈕狀態
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        this.renderCurrentView();
    }

    renderCurrentView() {
        const content = document.getElementById('table-content');
        if (!content) return;

        switch (this.currentView) {
            case 'floor-plan':
                content.innerHTML = this.renderFloorPlan();
                break;
            case 'table-list':
                content.innerHTML = this.renderTableList();
                break;
            case 'reservations':
                content.innerHTML = this.renderReservations();
                break;
            case 'statistics':
                content.innerHTML = this.renderStatistics();
                break;
        }

        this.updateStatusBar();
    }

    renderFloorPlan() {
        const tables = this.tableManager.getAllTables();
        
        return `
            <div class="floor-plan">
                <div class="restaurant-layout">
                    <div class="layout-section front-section">
                        <h3 class="section-title">前區</h3>
                        <div class="tables-grid">
                            ${tables.filter(table => table.location === '前區').map(table => 
                                this.renderTableItem(table, 'floor')
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="layout-section middle-section">
                        <h3 class="section-title">中區</h3>
                        <div class="tables-grid">
                            ${tables.filter(table => table.location === '中區').map(table => 
                                this.renderTableItem(table, 'floor')
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="layout-section back-section">
                        <h3 class="section-title">後區</h3>
                        <div class="tables-grid">
                            ${tables.filter(table => table.location === '後區').map(table => 
                                this.renderTableItem(table, 'floor')
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="floor-plan-legend">
                    <h4>圖例說明</h4>
                    <div class="legend-items">
                        <div class="legend-item">
                            <div class="legend-color available"></div>
                            <span>空閒中</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color occupied"></div>
                            <span>使用中</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color reserved"></div>
                            <span>已預訂</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color cleaning"></div>
                            <span>清理中</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTableItem(table, mode = 'list') {
        const statusClass = this.getStatusClass(table.status);
        const occupancyInfo = table.currentCapacity > 0 ? 
            `${table.currentCapacity}/${table.maxCapacity}` : 
            `${table.maxCapacity}人`;

        if (mode === 'floor') {
            return `
                <div class="table-item ${statusClass} ${table.shape}" data-table-id="${table.id}">
                    <div class="table-visual">
                        <div class="table-number">${table.tableNumber}</div>
                        <div class="table-capacity">${occupancyInfo}</div>
                    </div>
                    ${table.currentTotal > 0 ? `
                        <div class="table-revenue">$${table.currentTotal}</div>
                    ` : ''}
                    ${table.status === '使用中' && table.occupiedSince ? `
                        <div class="table-timer">${this.getOccupiedTime(table.occupiedSince)}</div>
                    ` : ''}
                </div>
            `;
        }

        return `
            <div class="table-list-item ${statusClass}" data-table-id="${table.id}">
                <div class="table-info">
                    <div class="table-number">${table.tableNumber}</div>
                    <div class="table-details">
                        <span class="capacity">容量: ${table.maxCapacity}人</span>
                        <span class="location">${table.location} - ${table.position}</span>
                        <span class="features">${table.features.join(', ')}</span>
                    </div>
                </div>
                <div class="table-status">
                    <span class="status-badge ${statusClass}">${table.status}</span>
                    ${table.currentCapacity > 0 ? `
                        <span class="occupancy">${table.currentCapacity}/${table.maxCapacity}人</span>
                    ` : ''}
                </div>
                <div class="table-revenue">
                    ${table.currentTotal > 0 ? `$${table.currentTotal}` : '-'}
                </div>
                <div class="table-actions-list">
                    <button class="btn btn-sm btn-primary table-action-btn" 
                            data-action="view" data-table-id="${table.id}">
                        查看
                    </button>
                </div>
            </div>
        `;
    }

    renderTableList() {
        const tables = this.tableManager.getAllTables();
        
        return `
            <div class="table-list">
                <div class="list-header">
                    <div class="search-section">
                        <input type="text" id="table-search" placeholder="搜尋桌號或狀態...">
                        <select id="status-filter">
                            <option value="">所有狀態</option>
                            <option value="空閒中">空閒中</option>
                            <option value="使用中">使用中</option>
                            <option value="已預訂">已預訂</option>
                            <option value="清理中">清理中</option>
                        </select>
                    </div>
                </div>
                
                <div class="table-list-container">
                    <div class="list-table-header">
                        <div>桌位資訊</div>
                        <div>狀態</div>
                        <div>營收</div>
                        <div>操作</div>
                    </div>
                    ${tables.map(table => this.renderTableItem(table, 'list')).join('')}
                </div>
            </div>
        `;
    }

    renderReservations() {
        const todayReservations = this.tableManager.getTodayReservations();
        const upcomingReservations = this.tableManager.reservationHistory
            .filter(r => r.status === '已預訂' && new Date(r.date) > new Date())
            .slice(0, 10);

        return `
            <div class="reservations-management">
                <div class="reservations-header">
                    <h3>今日預訂 (${todayReservations.length})</h3>
                    <button class="btn btn-primary" id="add-reservation">
                        <i class="fas fa-plus"></i> 新增預訂
                    </button>
                </div>
                
                <div class="reservations-grid">
                    <div class="today-reservations">
                        ${todayReservations.length > 0 ? `
                            <div class="reservations-list">
                                ${todayReservations.map(reservation => `
                                    <div class="reservation-card">
                                        <div class="reservation-header">
                                            <span class="reservation-time">${reservation.time}</span>
                                            <span class="table-number">${reservation.tableNumber}</span>
                                        </div>
                                        <div class="reservation-details">
                                            <div class="customer-info">
                                                <strong>${reservation.customerName}</strong>
                                                <span class="phone">${reservation.phone}</span>
                                            </div>
                                            <div class="party-info">
                                                <span class="party-size">${reservation.partySize}人</span>
                                            </div>
                                        </div>
                                        ${reservation.notes ? `
                                            <div class="reservation-notes">${reservation.notes}</div>
                                        ` : ''}
                                        <div class="reservation-actions">
                                            <button class="btn btn-sm btn-success" 
                                                    onclick="tableUI.confirmReservation('${reservation.id}')">
                                                確認到店
                                            </button>
                                            <button class="btn btn-sm btn-warning" 
                                                    onclick="tableUI.editReservation('${reservation.id}')">
                                                修改
                                            </button>
                                            <button class="btn btn-sm btn-danger" 
                                                    onclick="tableUI.cancelReservation('${reservation.id}')">
                                                取消
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="no-reservations">
                                <i class="fas fa-calendar-times"></i>
                                <p>今日無預訂</p>
                            </div>
                        `}
                    </div>
                    
                    <div class="upcoming-reservations">
                        <h4>未來預訂</h4>
                        ${upcomingReservations.length > 0 ? `
                            <div class="upcoming-list">
                                ${upcomingReservations.map(reservation => `
                                    <div class="upcoming-item">
                                        <div class="upcoming-date">${reservation.date}</div>
                                        <div class="upcoming-details">
                                            <span class="time">${reservation.time}</span>
                                            <span class="customer">${reservation.customerName}</span>
                                            <span class="party">${reservation.partySize}人</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="no-upcoming">無未來預訂</p>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    renderStatistics() {
        const stats = this.tableManager.getTableStatistics();
        const revenueStats = this.tableManager.getRevenueStatistics();
        const efficiency = this.tableManager.getTableEfficiencyAnalysis();
        const longestWaiting = this.tableManager.getLongestWaitingTables();

        return `
            <div class="statistics-dashboard">
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-table"></i></div>
                        <div class="stat-info">
                            <h3>${stats.total}</h3>
                            <p>總桌數</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <h3>${stats.currentOccupancy}/${stats.totalCapacity}</h3>
                            <p>入座人數</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                        <div class="stat-info">
                            <h3>${stats.occupancyRate}%</h3>
                            <p>入座率</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                        <div class="stat-info">
                            <h3>$${revenueStats.totalRevenue}</h3>
                            <p>當前營收</p>
                        </div>
                    </div>
                </div>

                <div class="stats-details">
                    <div class="stat-section">
                        <h3>桌位使用效率</h3>
                        <div class="efficiency-table">
                            <div class="table-header">
                                <div>桌號</div>
                                <div>容量</div>
                                <div>狀態</div>
                                <div>使用時間</div>
                                <div>效率</div>
                                <div>營收</div>
                            </div>
                            ${efficiency.map(item => `
                                <div class="table-row">
                                    <div>${item.tableNumber}</div>
                                    <div>${item.maxCapacity}人</div>
                                    <div>
                                        <span class="status-badge ${this.getStatusClass(item.currentStatus)}">
                                            ${item.currentStatus}
                                        </span>
                                    </div>
                                    <div>${item.occupiedMinutes}分鐘</div>
                                    <div>
                                        <div class="efficiency-bar">
                                            <div class="efficiency-fill" style="width: ${item.efficiency}%"></div>
                                            <span class="efficiency-text">${item.efficiency}%</span>
                                        </div>
                                    </div>
                                    <div>$${item.currentRevenue}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${longestWaiting.length > 0 ? `
                        <div class="stat-section">
                            <h3>用餐時間提醒</h3>
                            <div class="waiting-alerts">
                                ${longestWaiting.slice(0, 5).map(table => `
                                    <div class="waiting-alert ${table.waitingMinutes > 90 ? 'urgent' : ''}">
                                        <div class="alert-info">
                                            <strong>${table.tableNumber}</strong>
                                            <span>已用餐 ${table.waitingMinutes} 分鐘</span>
                                        </div>
                                        <div class="alert-actions">
                                            <button class="btn btn-sm btn-primary" 
                                                    onclick="tableUI.checkTable('${table.id}')">
                                                查看
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="stat-section">
                        <h3>各桌營收</h3>
                        <div class="revenue-chart">
                            ${revenueStats.revenueByTable.map(item => `
                                <div class="revenue-item">
                                    <span class="table-name">${item.tableNumber}</span>
                                    <div class="revenue-bar">
                                        <div class="revenue-fill" 
                                             style="width: ${(item.revenue / Math.max(...revenueStats.revenueByTable.map(r => r.revenue)) * 100)}%">
                                        </div>
                                        <span class="revenue-amount">$${item.revenue}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showTableActionModal(tableId) {
        const table = this.tableManager.tables.find(t => t.id === tableId);
        if (!table) return;

        const modal = document.getElementById('table-action-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = `${table.tableNumber} - ${table.status}`;
        
        let actionButtons = '';
        
        if (table.status === '空閒中') {
            actionButtons = `
                <button class="btn btn-success table-action-btn" 
                        data-action="seat" data-table-id="${tableId}">
                    <i class="fas fa-user-plus"></i> 安排入座
                </button>
                <button class="btn btn-info table-action-btn" 
                        data-action="reserve" data-table-id="${tableId}">
                    <i class="fas fa-calendar-plus"></i> 預訂桌位
                </button>
            `;
        } else if (table.status === '使用中') {
            actionButtons = `
                <button class="btn btn-primary table-action-btn" 
                        data-action="view-order" data-table-id="${tableId}">
                    <i class="fas fa-receipt"></i> 查看訂單
                </button>
                <button class="btn btn-warning table-action-btn" 
                        data-action="clear" data-table-id="${tableId}">
                    <i class="fas fa-sign-out-alt"></i> 客人離座
                </button>
            `;
        } else if (table.status === '清理中') {
            actionButtons = `
                <button class="btn btn-success table-action-btn" 
                        data-action="cleaned" data-table-id="${tableId}">
                    <i class="fas fa-check"></i> 清理完成
                </button>
            `;
        }

        body.innerHTML = `
            <div class="table-details">
                <div class="detail-row">
                    <span class="label">桌號:</span>
                    <span class="value">${table.tableNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="label">容量:</span>
                    <span class="value">${table.maxCapacity}人</span>
                </div>
                <div class="detail-row">
                    <span class="label">位置:</span>
                    <span class="value">${table.location} - ${table.position}</span>
                </div>
                <div class="detail-row">
                    <span class="label">特色:</span>
                    <span class="value">${table.features.join(', ')}</span>
                </div>
                ${table.currentCapacity > 0 ? `
                    <div class="detail-row">
                        <span class="label">目前人數:</span>
                        <span class="value">${table.currentCapacity}人</span>
                    </div>
                ` : ''}
                ${table.currentTotal > 0 ? `
                    <div class="detail-row">
                        <span class="label">目前消費:</span>
                        <span class="value">$${table.currentTotal}</span>
                    </div>
                ` : ''}
                ${table.occupiedSince ? `
                    <div class="detail-row">
                        <span class="label">用餐時間:</span>
                        <span class="value">${this.getOccupiedTime(table.occupiedSince)}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="action-buttons">
                ${actionButtons}
            </div>
        `;

        modal.classList.remove('hidden');
        this.selectedTable = tableId;
    }

    showReservationModal() {
        const modal = document.getElementById('reservation-modal');
        
        // 設置預設日期為今天
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reservation-date').value = today;
        
        modal.classList.remove('hidden');
    }

    handleTableAction(action, tableId) {
        const table = this.tableManager.tables.find(t => t.id === tableId);
        if (!table) return;

        switch (action) {
            case 'seat':
                this.handleSeatCustomers(tableId);
                break;
            case 'clear':
                this.handleClearTable(tableId);
                break;
            case 'cleaned':
                this.tableManager.updateTableStatus(tableId, '空閒中');
                this.showNotification('桌位清理完成', 'success');
                this.closeModals();
                this.renderCurrentView();
                break;
            case 'view-order':
                this.showOrderDetails(tableId);
                break;
            case 'reserve':
                this.showReservationModal();
                break;
        }
    }

    handleSeatCustomers(tableId) {
        const customerCount = prompt('請輸入用餐人數:');
        if (!customerCount || isNaN(customerCount) || customerCount < 1) {
            this.showNotification('請輸入有效的人數', 'error');
            return;
        }

        const result = this.tableManager.seatCustomers(tableId, parseInt(customerCount));
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.closeModals();
            this.renderCurrentView();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    handleClearTable(tableId) {
        if (!confirm('確定要清空此桌位嗎？請確保已完成結帳。')) return;

        const result = this.tableManager.clearTable(tableId);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.closeModals();
            this.renderCurrentView();
        } else {
            this.showNotification(`${result.message}${result.unpaidAmount ? ` (未結金額: $${result.unpaidAmount})` : ''}`, 'error');
        }
    }

    handleReservationSubmit() {
        const formData = {
            customerName: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            partySize: parseInt(document.getElementById('party-size').value),
            date: document.getElementById('reservation-date').value,
            time: document.getElementById('reservation-time').value,
            notes: document.getElementById('reservation-notes').value
        };

        // 找到合適的桌位
        const recommendations = this.tableManager.getTableRecommendations(formData.partySize);
        
        if (recommendations.length === 0) {
            this.showNotification('沒有合適的桌位可供預訂', 'error');
            return;
        }

        const bestTable = recommendations[0].table;
        const result = this.tableManager.makeReservation(bestTable.id, formData);

        if (result.success) {
            this.showNotification('預訂成功！', 'success');
            this.closeModals();
            document.getElementById('reservation-form').reset();
            this.renderCurrentView();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    updateStatusBar() {
        const stats = this.tableManager.getTableStatistics();
        
        document.getElementById('available-count').textContent = stats.available;
        document.getElementById('occupied-count').textContent = stats.occupied;
        document.getElementById('reserved-count').textContent = stats.reserved;
        document.getElementById('cleaning-count').textContent = stats.cleaning;
        document.getElementById('occupancy-rate').textContent = `${stats.occupancyRate}%`;
    }

    getStatusClass(status) {
        const statusMap = {
            '空閒中': 'available',
            '使用中': 'occupied',
            '已預訂': 'reserved',
            '清理中': 'cleaning',
            '已合併': 'merged'
        };
        return statusMap[status] || 'unknown';
    }

    getOccupiedTime(occupiedSince) {
        const now = new Date();
        const start = new Date(occupiedSince);
        const diffMinutes = Math.floor((now - start) / (1000 * 60));
        
        if (diffMinutes < 60) {
            return `${diffMinutes}分鐘`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours}小時${minutes}分鐘`;
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.selectedTable = null;
    }

    refreshTables() {
        this.renderCurrentView();
        this.showNotification('桌況已更新', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    startAutoRefresh() {
        // 每30秒自動更新
        this.refreshInterval = setInterval(() => {
            this.updateStatusBar();
            
            // 清理過期預訂
            this.tableManager.cleanupExpiredReservations();
        }, 30000);
    }

    renderTableInterface() {
        const container = this.createTableContainer();
        
        // 如果已經存在容器，替換它
        const existingContainer = document.getElementById('table-management-container');
        if (existingContainer) {
            existingContainer.replaceWith(container);
        } else {
            document.body.appendChild(container);
        }
        
        this.renderCurrentView();
    }

    // 預訂相關方法
    confirmReservation(reservationId) {
        // 這裡可以實現預訂確認邏輯
        this.showNotification('客人已確認到店', 'success');
    }

    editReservation(reservationId) {
        // 這裡可以實現預訂編輯邏輯
        this.showNotification('編輯功能開發中', 'info');
    }

    cancelReservation(reservationId) {
        if (!confirm('確定要取消此預訂嗎？')) return;
        
        const result = this.tableManager.cancelReservation(reservationId);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.renderCurrentView();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    checkTable(tableId) {
        this.showTableActionModal(tableId);
    }

    showOrderDetails(tableId) {
        const table = this.tableManager.tables.find(t => t.id === tableId);
        const order = this.tableManager.currentOrders[table.currentOrder];
        
        if (!order) {
            this.showNotification('找不到訂單資訊', 'error');
            return;
        }

        const modal = document.getElementById('table-action-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = `${table.tableNumber} - 訂單詳情`;
        
        body.innerHTML = `
            <div class="order-details">
                <div class="order-header">
                    <div class="order-info">
                        <span class="order-id">訂單號: ${order.orderId}</span>
                        <span class="order-time">下單時間: ${new Date(order.orderTime).toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="order-items">
                    <h4>訂單項目</h4>
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">x${item.quantity}</span>
                                <span class="item-price">$${item.price * item.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="order-summary">
                    <div class="summary-row">
                        <span>小計:</span>
                        <span>$${order.subtotal}</span>
                    </div>
                    <div class="summary-row">
                        <span>稅金:</span>
                        <span>$${order.tax}</span>
                    </div>
                    <div class="summary-row total">
                        <span>總計:</span>
                        <span>$${order.total}</span>
                    </div>
                </div>
                
                <div class="order-status">
                    <span class="status-label">狀態:</span>
                    <span class="status-badge">${order.status}</span>
                    <span class="payment-status">${order.paymentStatus}</span>
                </div>
                
                ${order.notes ? `
                    <div class="order-notes">
                        <span class="notes-label">備註:</span>
                        <span class="notes-text">${order.notes}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="tableUI.printOrder('${order.orderId}')">
                    <i class="fas fa-print"></i> 列印
                </button>
                <button class="btn btn-success" onclick="tableUI.processPayment('${order.orderId}')">
                    <i class="fas fa-credit-card"></i> 結帳
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    printOrder(orderId) {
        this.showNotification('列印功能開發中', 'info');
    }

    processPayment(orderId) {
        this.showNotification('結帳功能開發中', 'info');
    }
}

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableUI;
}
