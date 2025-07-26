/**
 * 訂位管理使用者介面
 * 提供訂位管理、客戶管理、等候名單等功能的完整UI
 */

class ReservationUI {
    constructor() {
        this.reservationManager = new ReservationManager();
        this.currentView = 'today';
        this.selectedDate = new Date().toISOString().split('T')[0];
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
        
        const reservationHTML = `
            <div id="reservation-management-container">
                <!-- 標題區 -->
                <div class="reservation-header">
                    <h2><i class="fas fa-calendar-check"></i> 訂位管理系統</h2>
                    <div class="reservation-actions">
                        <button class="btn btn-primary" onclick="reservationUI.showNewReservationModal()">
                            <i class="fas fa-plus"></i> 新增訂位
                        </button>
                        <button class="btn btn-info" onclick="reservationUI.showCustomerModal()">
                            <i class="fas fa-user-plus"></i> 客戶管理
                        </button>
                        <button class="btn btn-warning" onclick="reservationUI.showWaitingListModal()">
                            <i class="fas fa-clock"></i> 等候名單
                        </button>
                        <button class="btn btn-success" onclick="reservationUI.exportReport()">
                            <i class="fas fa-download"></i> 匯出報告
                        </button>
                    </div>
                </div>

                <!-- 快速統計 -->
                <div class="reservation-stats">
                    <div class="stat-card today-total">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="today-total">0</h3>
                            <p>今日訂位</p>
                        </div>
                    </div>
                    <div class="stat-card confirmed-count">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="confirmed-count">0</h3>
                            <p>已確認</p>
                        </div>
                    </div>
                    <div class="stat-card waiting-count">
                        <div class="stat-icon">
                            <i class="fas fa-hourglass-half"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="waiting-count">0</h3>
                            <p>等候中</p>
                        </div>
                    </div>
                    <div class="stat-card customer-count">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="customer-count">0</h3>
                            <p>客戶總數</p>
                        </div>
                    </div>
                </div>

                <!-- 導航選單 -->
                <div class="reservation-nav">
                    <button class="nav-btn active" data-view="today">
                        <i class="fas fa-calendar-day"></i> 今日訂位
                    </button>
                    <button class="nav-btn" data-view="upcoming">
                        <i class="fas fa-calendar-week"></i> 近期訂位
                    </button>
                    <button class="nav-btn" data-view="calendar">
                        <i class="fas fa-calendar"></i> 日曆檢視
                    </button>
                    <button class="nav-btn" data-view="customers">
                        <i class="fas fa-address-book"></i> 客戶管理
                    </button>
                    <button class="nav-btn" data-view="analytics">
                        <i class="fas fa-chart-line"></i> 分析報表
                    </button>
                </div>

                <!-- 快速操作區 -->
                <div class="quick-actions">
                    <div class="date-selector">
                        <label>選擇日期:</label>
                        <input type="date" id="selected-date" value="${this.selectedDate}" onchange="reservationUI.changeDate(this.value)">
                    </div>
                    <div class="status-filters">
                        <button class="filter-btn active" data-status="all">全部</button>
                        <button class="filter-btn" data-status="待確認">待確認</button>
                        <button class="filter-btn" data-status="已確認">已確認</button>
                        <button class="filter-btn" data-status="已到場">已到場</button>
                        <button class="filter-btn" data-status="未到場">未到場</button>
                    </div>
                </div>

                <!-- 內容區域 -->
                <div id="reservation-content" class="reservation-content">
                    <!-- 內容將在這裡動態載入 -->
                </div>
            </div>

            <!-- 彈窗區域 -->
            <div id="reservation-modals"></div>
        `;

        container.innerHTML = reservationHTML;
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
        const stats = this.reservationManager.getReservationStatistics();

        document.getElementById('today-total').textContent = stats.today.total;
        document.getElementById('confirmed-count').textContent = stats.today.confirmed;
        document.getElementById('waiting-count').textContent = stats.overall.waitingListCount;
        document.getElementById('customer-count').textContent = stats.overall.totalCustomers;
    }

    /**
     * 渲染內容區域
     */
    renderContent() {
        const content = document.getElementById('reservation-content');
        
        switch (this.currentView) {
            case 'today':
                content.innerHTML = this.renderTodayView();
                break;
            case 'upcoming':
                content.innerHTML = this.renderUpcomingView();
                break;
            case 'calendar':
                content.innerHTML = this.renderCalendarView();
                break;
            case 'customers':
                content.innerHTML = this.renderCustomersView();
                break;
            case 'analytics':
                content.innerHTML = this.renderAnalyticsView();
                break;
        }
    }

    /**
     * 渲染今日訂位視圖
     */
    renderTodayView() {
        const todayReservations = this.reservationManager.getTodayReservations();
        
        return `
            <div class="today-reservations">
                <div class="view-header">
                    <h3>今日訂位 (${todayReservations.length})</h3>
                    <div class="view-actions">
                        <button class="btn btn-sm btn-info" onclick="reservationUI.refreshData()">
                            <i class="fas fa-sync"></i> 重新整理
                        </button>
                    </div>
                </div>

                ${todayReservations.length === 0 ? `
                    <div class="no-reservations">
                        <i class="fas fa-calendar-times"></i>
                        <h4>今日暫無訂位</h4>
                        <p>您可以新增訂位或檢查其他日期</p>
                        <button class="btn btn-primary" onclick="reservationUI.showNewReservationModal()">
                            <i class="fas fa-plus"></i> 新增訂位
                        </button>
                    </div>
                ` : `
                    <div class="reservations-timeline">
                        ${this.renderTimeSlots(todayReservations)}
                    </div>
                `}
            </div>
        `;
    }

    /**
     * 渲染時間軸
     */
    renderTimeSlots(reservations) {
        const timeSlots = this.reservationManager.settings.timeSlots;
        
        return timeSlots.map(time => {
            const slotReservations = reservations.filter(res => res.reservationTime === time);
            
            return `
                <div class="time-slot ${slotReservations.length > 0 ? 'has-reservations' : 'empty'}">
                    <div class="time-label">
                        <span class="time">${time}</span>
                        <span class="count">${slotReservations.length > 0 ? `${slotReservations.length} 組` : '空閒'}</span>
                    </div>
                    <div class="slot-reservations">
                        ${slotReservations.map(res => this.renderReservationCard(res)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 渲染訂位卡片
     */
    renderReservationCard(reservation) {
        const statusClass = this.getStatusClass(reservation.status);
        const customer = this.reservationManager.customers.get(reservation.phone);
        
        return `
            <div class="reservation-card ${statusClass}" data-reservation-id="${reservation.id}">
                <div class="card-header">
                    <div class="customer-info">
                        <h4>${reservation.customerName}</h4>
                        <p class="party-size">
                            <i class="fas fa-users"></i> ${reservation.partySize} 人
                        </p>
                        <p class="phone">
                            <i class="fas fa-phone"></i> ${reservation.phone}
                        </p>
                    </div>
                    <div class="reservation-status">
                        <span class="status-badge ${statusClass}">${reservation.status}</span>
                        ${reservation.tableAssignment ? `
                            <span class="table-assignment">
                                <i class="fas fa-table"></i> ${reservation.tableAssignment}
                            </span>
                        ` : ''}
                    </div>
                </div>

                ${customer && customer.vip ? `
                    <div class="vip-indicator">
                        <i class="fas fa-crown"></i> VIP 客戶
                    </div>
                ` : ''}

                ${reservation.specialRequests && reservation.specialRequests.length > 0 ? `
                    <div class="special-requests">
                        <h5>特殊需求</h5>
                        <div class="request-tags">
                            ${reservation.specialRequests.map(req => `<span class="request-tag">${req}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${reservation.notes ? `
                    <div class="reservation-notes">
                        <i class="fas fa-sticky-note"></i> ${reservation.notes}
                    </div>
                ` : ''}

                <div class="card-actions">
                    ${reservation.status === '待確認' ? `
                        <button class="btn btn-sm btn-success" onclick="reservationUI.confirmReservation('${reservation.id}')">
                            <i class="fas fa-check"></i> 確認
                        </button>
                    ` : ''}
                    
                    ${reservation.status === '已確認' ? `
                        <button class="btn btn-sm btn-info" onclick="reservationUI.markArrived('${reservation.id}')">
                            <i class="fas fa-sign-in-alt"></i> 到場
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="reservationUI.markNoShow('${reservation.id}')">
                            <i class="fas fa-user-times"></i> 未到場
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-sm btn-info" onclick="reservationUI.showReservationDetails('${reservation.id}')">
                        <i class="fas fa-eye"></i> 詳情
                    </button>
                    
                    ${reservation.status !== '已取消' && reservation.status !== '已到場' ? `
                        <button class="btn btn-sm btn-danger" onclick="reservationUI.cancelReservation('${reservation.id}')">
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
            '待確認': 'pending',
            '已確認': 'confirmed',
            '已到場': 'arrived',
            '未到場': 'no-show',
            '已取消': 'cancelled'
        };
        return statusClasses[status] || 'unknown';
    }

    /**
     * 渲染近期訂位視圖
     */
    renderUpcomingView() {
        const upcomingReservations = this.reservationManager.getUpcomingReservations(7);
        const groupedByDate = this.groupReservationsByDate(upcomingReservations);
        
        return `
            <div class="upcoming-reservations">
                <div class="view-header">
                    <h3>近期訂位 (7天內)</h3>
                </div>

                ${Object.keys(groupedByDate).length === 0 ? `
                    <div class="no-reservations">
                        <i class="fas fa-calendar-times"></i>
                        <h4>近期暫無訂位</h4>
                        <p>您可以新增訂位或檢查其他日期</p>
                    </div>
                ` : `
                    <div class="date-groups">
                        ${Object.entries(groupedByDate).map(([date, reservations]) => `
                            <div class="date-group">
                                <div class="date-header">
                                    <h4>${this.formatDate(date)}</h4>
                                    <span class="count">${reservations.length} 組訂位</span>
                                </div>
                                <div class="reservations-list">
                                    ${reservations.map(res => this.renderReservationCard(res)).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }

    /**
     * 按日期分組訂位
     */
    groupReservationsByDate(reservations) {
        return reservations.reduce((groups, reservation) => {
            const date = reservation.reservationDate;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(reservation);
            return groups;
        }, {});
    }

    /**
     * 格式化日期顯示
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (dateString === today.toISOString().split('T')[0]) {
            return '今天 ' + date.toLocaleDateString('zh-TW');
        } else if (dateString === tomorrow.toISOString().split('T')[0]) {
            return '明天 ' + date.toLocaleDateString('zh-TW');
        } else {
            return date.toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            });
        }
    }

    /**
     * 渲染客戶管理視圖
     */
    renderCustomersView() {
        const customers = Array.from(this.reservationManager.customers.values())
            .sort((a, b) => b.visitCount - a.visitCount);
        
        return `
            <div class="customers-management">
                <div class="view-header">
                    <h3>客戶管理 (${customers.length})</h3>
                    <div class="view-actions">
                        <button class="btn btn-sm btn-primary" onclick="reservationUI.showAddCustomerModal()">
                            <i class="fas fa-user-plus"></i> 新增客戶
                        </button>
                    </div>
                </div>

                <div class="customers-filters">
                    <input type="text" id="customer-search" placeholder="搜尋客戶..." onkeyup="reservationUI.filterCustomers()">
                    <select id="customer-type-filter" onchange="reservationUI.filterCustomers()">
                        <option value="">所有客戶</option>
                        <option value="vip">VIP 客戶</option>
                        <option value="regular">常客</option>
                        <option value="new">新客戶</option>
                    </select>
                </div>

                <div class="customers-grid">
                    ${customers.map(customer => `
                        <div class="customer-card ${customer.vip ? 'vip' : ''}" data-customer-phone="${customer.phone}">
                            <div class="customer-header">
                                <div class="customer-info">
                                    <h4>${customer.name}</h4>
                                    <p class="phone">${customer.phone}</p>
                                    ${customer.email ? `<p class="email">${customer.email}</p>` : ''}
                                </div>
                                ${customer.vip ? `
                                    <div class="vip-badge">
                                        <i class="fas fa-crown"></i> VIP
                                    </div>
                                ` : ''}
                            </div>

                            <div class="customer-stats">
                                <div class="stat-item">
                                    <span class="label">造訪次數</span>
                                    <span class="value">${customer.visitCount}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">總消費</span>
                                    <span class="value">NT$ ${customer.totalSpent.toLocaleString()}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">平均消費</span>
                                    <span class="value">NT$ ${customer.averageSpent.toLocaleString()}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">上次來訪</span>
                                    <span class="value">${customer.lastVisit || '未曾來訪'}</span>
                                </div>
                            </div>

                            ${customer.preferences.length > 0 ? `
                                <div class="customer-preferences">
                                    <h5>偏好菜品</h5>
                                    <div class="preference-tags">
                                        ${customer.preferences.map(pref => `<span class="pref-tag">${pref}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${customer.allergies.length > 0 ? `
                                <div class="customer-allergies">
                                    <h5>過敏資訊</h5>
                                    <div class="allergy-tags">
                                        ${customer.allergies.map(allergy => `<span class="allergy-tag">${allergy}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            <div class="customer-actions">
                                <button class="btn btn-sm btn-primary" onclick="reservationUI.createReservationForCustomer('${customer.phone}')">
                                    <i class="fas fa-calendar-plus"></i> 新增訂位
                                </button>
                                <button class="btn btn-sm btn-info" onclick="reservationUI.showCustomerDetails('${customer.phone}')">
                                    <i class="fas fa-eye"></i> 詳情
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="reservationUI.editCustomer('${customer.phone}')">
                                    <i class="fas fa-edit"></i> 編輯
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染分析報表視圖
     */
    renderAnalyticsView() {
        const stats = this.reservationManager.getReservationStatistics();
        
        return `
            <div class="analytics-dashboard">
                <div class="view-header">
                    <h3>分析報表</h3>
                </div>

                <div class="analytics-grid">
                    <!-- 今日概況 -->
                    <div class="analytics-section">
                        <h4>今日概況</h4>
                        <div class="today-overview">
                            <div class="overview-item">
                                <span class="label">總訂位</span>
                                <span class="value">${stats.today.total}</span>
                            </div>
                            <div class="overview-item">
                                <span class="label">已確認</span>
                                <span class="value">${stats.today.confirmed}</span>
                            </div>
                            <div class="overview-item">
                                <span class="label">待確認</span>
                                <span class="value">${stats.today.pending}</span>
                            </div>
                            <div class="overview-item">
                                <span class="label">已到場</span>
                                <span class="value">${stats.today.arrived}</span>
                            </div>
                            <div class="overview-item">
                                <span class="label">未到場</span>
                                <span class="value alert">${stats.today.noShow}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 本月統計 -->
                    <div class="analytics-section">
                        <h4>本月統計</h4>
                        <div class="month-stats">
                            <div class="stat-item">
                                <span class="label">總訂位數</span>
                                <span class="value">${stats.thisMonth.total}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">確認率</span>
                                <span class="value">${stats.thisMonth.total > 0 ? ((stats.thisMonth.confirmed / stats.thisMonth.total) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">取消率</span>
                                <span class="value">${stats.thisMonth.total > 0 ? ((stats.thisMonth.cancelled / stats.thisMonth.total) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">平均人數</span>
                                <span class="value">${stats.thisMonth.avgPartySize.toFixed(1)} 人</span>
                            </div>
                        </div>
                    </div>

                    <!-- 客戶分析 -->
                    <div class="analytics-section">
                        <h4>客戶分析</h4>
                        <div class="customer-analytics">
                            <div class="stat-item">
                                <span class="label">總客戶數</span>
                                <span class="value">${stats.overall.totalCustomers}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">VIP 客戶</span>
                                <span class="value">${stats.overall.vipCustomers}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">等候名單</span>
                                <span class="value">${stats.overall.waitingListCount}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">黑名單</span>
                                <span class="value alert">${stats.overall.blacklistCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 顯示新增訂位彈窗
     */
    showNewReservationModal() {
        const modalHTML = `
            <div class="modal" id="new-reservation-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>新增訂位</h3>
                        <button class="close-modal" onclick="reservationUI.closeModal('new-reservation-modal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="new-reservation-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>客戶姓名 *</label>
                                    <input type="text" id="customer-name" required>
                                </div>
                                <div class="form-group">
                                    <label>聯絡電話 *</label>
                                    <input type="tel" id="customer-phone" placeholder="0912-345-678" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>用餐人數 *</label>
                                    <select id="party-size" required>
                                        <option value="">請選擇</option>
                                        ${Array.from({length: 10}, (_, i) => `<option value="${i+1}">${i+1} 人</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>訂位日期 *</label>
                                    <input type="date" id="reservation-date" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>訂位時間 *</label>
                                    <select id="reservation-time" required>
                                        <option value="">請選擇時間</option>
                                        ${this.reservationManager.settings.timeSlots.map(time => 
                                            `<option value="${time}">${time}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>訂位來源</label>
                                    <select id="reservation-source">
                                        <option value="電話訂位">電話訂位</option>
                                        <option value="線上訂位">線上訂位</option>
                                        <option value="現場訂位">現場訂位</option>
                                        <option value="其他">其他</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>特殊需求</label>
                                <div class="special-requests">
                                    <label><input type="checkbox" value="生日蛋糕"> 生日蛋糕</label>
                                    <label><input type="checkbox" value="靠窗座位"> 靠窗座位</label>
                                    <label><input type="checkbox" value="素食菜單"> 素食菜單</label>
                                    <label><input type="checkbox" value="兒童座椅"> 兒童座椅</label>
                                    <label><input type="checkbox" value="安靜角落"> 安靜角落</label>
                                    <label><input type="checkbox" value="發票"> 發票</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>備註</label>
                                <textarea id="reservation-notes" placeholder="其他特殊要求或備註"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="reservationUI.closeModal('new-reservation-modal')">
                            取消
                        </button>
                        <button class="btn btn-primary" onclick="reservationUI.createReservation()">
                            建立訂位
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('reservation-modals').innerHTML = modalHTML;
        document.getElementById('new-reservation-modal').classList.remove('hidden');
        
        // 設定預設日期為今天
        document.getElementById('reservation-date').value = new Date().toISOString().split('T')[0];
    }

    /**
     * 建立訂位
     */
    createReservation() {
        const formData = {
            customerName: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            partySize: parseInt(document.getElementById('party-size').value),
            date: document.getElementById('reservation-date').value,
            time: document.getElementById('reservation-time').value,
            source: document.getElementById('reservation-source').value,
            notes: document.getElementById('reservation-notes').value,
            specialRequests: Array.from(document.querySelectorAll('.special-requests input:checked')).map(cb => cb.value)
        };

        try {
            const result = this.reservationManager.createReservation(formData);
            
            if (result.success) {
                this.showNotification('success', '訂位建立成功！');
                this.closeModal('new-reservation-modal');
                this.renderInterface();
            } else {
                this.showNotification('warning', result.message);
            }
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 確認訂位
     */
    confirmReservation(reservationId) {
        try {
            this.reservationManager.confirmReservation(reservationId);
            this.showNotification('success', '訂位已確認');
            this.renderInterface();
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 標記到場
     */
    markArrived(reservationId) {
        try {
            this.reservationManager.markAsArrived(reservationId);
            this.showNotification('success', '客戶已到場');
            this.renderInterface();
        } catch (error) {
            this.showNotification('error', error.message);
        }
    }

    /**
     * 標記未到場
     */
    markNoShow(reservationId) {
        if (confirm('確定要標記此訂位為未到場嗎？')) {
            try {
                this.reservationManager.markAsNoShow(reservationId);
                this.showNotification('warning', '已標記為未到場');
                this.renderInterface();
            } catch (error) {
                this.showNotification('error', error.message);
            }
        }
    }

    /**
     * 取消訂位
     */
    cancelReservation(reservationId) {
        const reason = prompt('請輸入取消原因（可選）：');
        if (reason !== null) {
            try {
                this.reservationManager.cancelReservation(reservationId, reason);
                this.showNotification('info', '訂位已取消');
                this.renderInterface();
            } catch (error) {
                this.showNotification('error', error.message);
            }
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
     * 改變日期
     */
    changeDate(date) {
        this.selectedDate = date;
        this.renderContent();
    }

    /**
     * 匯出報告
     */
    exportReport() {
        const report = this.reservationManager.exportReservationReport('csv');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `reservation-report-${timestamp}.csv`;
        
        const blob = new Blob([report], { type: 'text/csv' });
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
        this.renderInterface();
        this.showNotification('success', '資料已重新整理');
    }

    /**
     * 開始自動重新整理
     */
    startAutoRefresh() {
        setInterval(() => {
            this.updateStatistics();
        }, 30000); // 每30秒更新一次統計
    }
}

// 全域訂位實例
let reservationUI;

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    if (typeof ReservationManager !== 'undefined') {
        reservationUI = new ReservationUI();
    }
});
