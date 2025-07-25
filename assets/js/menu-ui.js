// menu-ui.js - 菜單管理介面
class MenuUI {
    constructor() {
        this.menuManager = new MenuManager();
        this.currentView = 'menu-overview';
        this.selectedCategory = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.createMenuContainer();
        this.bindEvents();
        this.renderMenuInterface();
        this.startAutoRefresh();
    }

    createMenuContainer() {
        const container = document.createElement('div');
        container.id = 'menu-management-container';
        container.innerHTML = `
            <div class="menu-header">
                <h2><i class="fas fa-utensils"></i> 菜單管理系統</h2>
                <div class="menu-actions">
                    <button id="refresh-menu" class="btn btn-primary">
                        <i class="fas fa-sync-alt"></i> 重新整理
                    </button>
                    <button id="export-menu" class="btn btn-secondary">
                        <i class="fas fa-download"></i> 匯出菜單
                    </button>
                </div>
            </div>

            <div class="menu-nav">
                <button class="nav-btn active" data-view="menu-overview">
                    <i class="fas fa-chart-pie"></i> 菜單總覽
                </button>
                <button class="nav-btn" data-view="menu-items">
                    <i class="fas fa-list"></i> 菜單項目
                </button>
                <button class="nav-btn" data-view="availability">
                    <i class="fas fa-exclamation-triangle"></i> 供應狀況
                </button>
                <button class="nav-btn" data-view="profitability">
                    <i class="fas fa-dollar-sign"></i> 獲利分析
                </button>
                <button class="nav-btn" data-view="customer-menu">
                    <i class="fas fa-users"></i> 顧客菜單
                </button>
            </div>

            <div id="menu-content" class="menu-content">
                <!-- 動態內容將在這裡顯示 -->
            </div>
        `;

        return container;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                this.switchView(e.target.dataset.view);
            }

            if (e.target.id === 'refresh-menu') {
                this.refreshMenu();
            }

            if (e.target.id === 'export-menu') {
                this.exportMenu();
            }

            if (e.target.classList.contains('category-filter')) {
                this.filterByCategory(e.target.dataset.category);
            }

            if (e.target.classList.contains('toggle-availability')) {
                this.toggleItemAvailability(e.target.dataset.item);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'menu-search') {
                this.searchTerm = e.target.value;
                this.renderCurrentView();
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
        const content = document.getElementById('menu-content');
        if (!content) return;

        switch (this.currentView) {
            case 'menu-overview':
                content.innerHTML = this.renderMenuOverview();
                break;
            case 'menu-items':
                content.innerHTML = this.renderMenuItems();
                break;
            case 'availability':
                content.innerHTML = this.renderAvailability();
                break;
            case 'profitability':
                content.innerHTML = this.renderProfitability();
                break;
            case 'customer-menu':
                content.innerHTML = this.renderCustomerMenu();
                break;
        }
    }

    renderMenuOverview() {
        const stats = this.menuManager.getMenuStatistics();
        const alerts = this.menuManager.generateShortageAlerts();
        
        return `
            <div class="overview-grid">
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-utensils"></i></div>
                        <div class="stat-info">
                            <h3>${stats.totalItems}</h3>
                            <p>總菜單項目</p>
                        </div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <h3>${stats.availableItems}</h3>
                            <p>可供應項目</p>
                        </div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="stat-info">
                            <h3>${stats.lowStockItems}</h3>
                            <p>低庫存項目</p>
                        </div>
                    </div>
                    <div class="stat-card danger">
                        <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                        <div class="stat-info">
                            <h3>${stats.unavailableItems}</h3>
                            <p>無法供應項目</p>
                        </div>
                    </div>
                </div>

                <div class="overview-section">
                    <h3><i class="fas fa-chart-bar"></i> 財務概覽</h3>
                    <div class="financial-overview">
                        <div class="financial-item">
                            <span class="label">平均售價：</span>
                            <span class="value">$${stats.averagePrice}</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">平均成本：</span>
                            <span class="value">$${stats.averageCost}</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">平均利潤率：</span>
                            <span class="value">${stats.averageMargin}%</span>
                        </div>
                    </div>
                </div>

                ${alerts.length > 0 ? `
                    <div class="overview-section">
                        <h3><i class="fas fa-bell"></i> 即時警報 (${alerts.length})</h3>
                        <div class="alerts-list">
                            ${alerts.slice(0, 5).map(alert => `
                                <div class="alert-item ${alert.severity}">
                                    <div class="alert-icon">
                                        <i class="fas ${alert.type === 'unavailable' ? 'fa-times' : 'fa-exclamation'}"></i>
                                    </div>
                                    <div class="alert-content">
                                        <strong>${alert.menuItem}</strong>
                                        <p>${alert.message}</p>
                                    </div>
                                </div>
                            `).join('')}
                            ${alerts.length > 5 ? `<p class="more-alerts">還有 ${alerts.length - 5} 個警報...</p>` : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="overview-section">
                    <h3><i class="fas fa-tags"></i> 分類統計</h3>
                    <div class="category-breakdown">
                        ${Object.entries(stats.categoryBreakdown).map(([category, data]) => `
                            <div class="category-item">
                                <div class="category-name">${category}</div>
                                <div class="category-stats">
                                    <span class="total">${data.count} 項</span>
                                    <span class="available">${data.available} 可供應</span>
                                    <span class="price">均價 $${data.averagePrice}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderMenuItems() {
        const menusByCategory = this.menuManager.getMenuByCategory();
        const filteredMenus = this.selectedCategory === 'all' ? 
            this.menuManager.menuItems : 
            menusByCategory[this.selectedCategory] || [];

        const searchResults = this.menuManager.searchMenuItems(this.searchTerm);
        const displayItems = this.searchTerm ? 
            searchResults : 
            filteredMenus;

        return `
            <div class="menu-items-header">
                <div class="search-section">
                    <input type="text" id="menu-search" placeholder="搜尋菜單..." value="${this.searchTerm}">
                    <i class="fas fa-search search-icon"></i>
                </div>
                <div class="category-filters">
                    <button class="category-filter ${this.selectedCategory === 'all' ? 'active' : ''}" data-category="all">
                        全部 (${this.menuManager.menuItems.length})
                    </button>
                    ${this.menuManager.categories.map(category => {
                        const count = menusByCategory[category]?.length || 0;
                        return count > 0 ? `
                            <button class="category-filter ${this.selectedCategory === category ? 'active' : ''}" data-category="${category}">
                                ${category} (${count})
                            </button>
                        ` : '';
                    }).join('')}
                </div>
            </div>

            <div class="menu-items-grid">
                ${displayItems.map(item => {
                    const maxServings = this.menuManager.calculateMaxServings(item.name);
                    const isAvailable = maxServings > 0 && item.available;
                    const profitMargin = this.menuManager.calculateProfitMargin(item.name);
                    
                    return `
                        <div class="menu-item-card ${!isAvailable ? 'unavailable' : ''}">
                            <div class="item-header">
                                <h4>${item.name}</h4>
                                <div class="availability-toggle">
                                    <label class="switch">
                                        <input type="checkbox" class="toggle-availability" 
                                               data-item="${item.name}" ${item.available ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="item-details">
                                <p class="description">${item.description}</p>
                                <div class="item-specs">
                                    <span class="category">${item.category}</span>
                                    ${item.spiceLevel ? `<span class="spice-level">${item.spiceLevel}</span>` : ''}
                                    <span class="location">${item.location}</span>
                                </div>
                            </div>

                            <div class="item-metrics">
                                <div class="metric">
                                    <span class="label">售價</span>
                                    <span class="value price">$${item.price}</span>
                                </div>
                                <div class="metric">
                                    <span class="label">成本</span>
                                    <span class="value cost">$${item.cost.toFixed(2)}</span>
                                </div>
                                <div class="metric">
                                    <span class="label">利潤率</span>
                                    <span class="value margin">${profitMargin}%</span>
                                </div>
                                <div class="metric">
                                    <span class="label">可製作</span>
                                    <span class="value stock ${maxServings === 0 ? 'zero' : maxServings < 5 ? 'low' : 'normal'}">
                                        ${maxServings} 份
                                    </span>
                                </div>
                            </div>

                            ${!isAvailable ? `
                                <div class="unavailable-overlay">
                                    <i class="fas fa-times-circle"></i>
                                    <span>暫停供應</span>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            ${displayItems.length === 0 ? `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>沒有找到符合條件的菜單項目</p>
                </div>
            ` : ''}
        `;
    }

    renderAvailability() {
        const unavailableItems = this.menuManager.getUnavailableItems();
        const lowStockItems = this.menuManager.getLowStockItems();
        const alerts = this.menuManager.generateShortageAlerts();
        const suggestions = this.menuManager.generatePurchaseSuggestions();

        return `
            <div class="availability-overview">
                <div class="availability-summary">
                    <div class="summary-card danger">
                        <h3>${unavailableItems.length}</h3>
                        <p>無法供應項目</p>
                    </div>
                    <div class="summary-card warning">
                        <h3>${lowStockItems.length}</h3>
                        <p>低庫存項目</p>
                    </div>
                    <div class="summary-card info">
                        <h3>${suggestions.length}</h3>
                        <p>採購建議項目</p>
                    </div>
                </div>

                <div class="availability-sections">
                    ${alerts.length > 0 ? `
                        <div class="availability-section">
                            <h3><i class="fas fa-exclamation-triangle"></i> 供應警報</h3>
                            <div class="alerts-table">
                                <div class="table-header">
                                    <div>菜單項目</div>
                                    <div>分類</div>
                                    <div>狀況</div>
                                    <div>可製作份數</div>
                                    <div>操作</div>
                                </div>
                                ${alerts.map(alert => `
                                    <div class="table-row ${alert.severity}">
                                        <div class="item-name">${alert.menuItem}</div>
                                        <div class="category">${alert.category}</div>
                                        <div class="status">
                                            <span class="status-badge ${alert.type}">
                                                ${alert.type === 'unavailable' ? '無法供應' : '庫存不足'}
                                            </span>
                                        </div>
                                        <div class="servings">${alert.maxServings} 份</div>
                                        <div class="actions">
                                            <button class="btn btn-sm btn-primary" onclick="menuUI.viewItemDetails('${alert.menuItem}')">
                                                查看詳情
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${suggestions.length > 0 ? `
                        <div class="availability-section">
                            <h3><i class="fas fa-shopping-cart"></i> 採購建議</h3>
                            <div class="suggestions-table">
                                <div class="table-header">
                                    <div>項目名稱</div>
                                    <div>類型</div>
                                    <div>目前庫存</div>
                                    <div>建議採購量</div>
                                    <div>預估成本</div>
                                </div>
                                ${suggestions.map(suggestion => `
                                    <div class="table-row">
                                        <div class="item-name">${suggestion.name}</div>
                                        <div class="type">
                                            <span class="type-badge ${suggestion.type}">
                                                ${suggestion.type === 'recipe' ? '配方' : '食材'}
                                            </span>
                                        </div>
                                        <div class="current-stock">${suggestion.currentStock}</div>
                                        <div class="suggested-quantity">${suggestion.suggestedQuantity}</div>
                                        <div class="estimated-cost">$${suggestion.estimatedCost.toFixed(2)}</div>
                                    </div>
                                `).join('')}
                                <div class="table-footer">
                                    <div class="total-cost">
                                        總採購成本：$${suggestions.reduce((sum, s) => sum + s.estimatedCost, 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderProfitability() {
        const items = this.menuManager.menuItems.map(item => ({
            ...item,
            cost: this.menuManager.calculateMenuCost(item.name),
            margin: this.menuManager.calculateProfitMargin(item.name),
            profit: item.price - this.menuManager.calculateMenuCost(item.name)
        }));

        // 按利潤率排序
        const sortedByMargin = [...items].sort((a, b) => parseFloat(b.margin) - parseFloat(a.margin));
        const topProfitable = sortedByMargin.slice(0, 5);
        const lowProfitable = sortedByMargin.slice(-5).reverse();

        return `
            <div class="profitability-analysis">
                <div class="profitability-summary">
                    <div class="summary-metrics">
                        <div class="metric-card">
                            <h4>最高利潤率</h4>
                            <p class="value">${topProfitable[0]?.margin || 0}%</p>
                            <p class="item">${topProfitable[0]?.name || '無'}</p>
                        </div>
                        <div class="metric-card">
                            <h4>平均利潤率</h4>
                            <p class="value">${this.menuManager.getMenuStatistics().averageMargin}%</p>
                        </div>
                        <div class="metric-card">
                            <h4>最低利潤率</h4>
                            <p class="value">${lowProfitable[0]?.margin || 0}%</p>
                            <p class="item">${lowProfitable[0]?.name || '無'}</p>
                        </div>
                    </div>
                </div>

                <div class="profitability-tables">
                    <div class="table-section">
                        <h3><i class="fas fa-arrow-up text-success"></i> 高利潤項目</h3>
                        <div class="profitability-table">
                            <div class="table-header">
                                <div>項目名稱</div>
                                <div>售價</div>
                                <div>成本</div>
                                <div>利潤</div>
                                <div>利潤率</div>
                            </div>
                            ${topProfitable.map(item => `
                                <div class="table-row">
                                    <div class="item-name">${item.name}</div>
                                    <div class="price">$${item.price}</div>
                                    <div class="cost">$${item.cost.toFixed(2)}</div>
                                    <div class="profit">$${item.profit.toFixed(2)}</div>
                                    <div class="margin">
                                        <span class="margin-badge high">${item.margin}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="table-section">
                        <h3><i class="fas fa-arrow-down text-warning"></i> 低利潤項目</h3>
                        <div class="profitability-table">
                            <div class="table-header">
                                <div>項目名稱</div>
                                <div>售價</div>
                                <div>成本</div>
                                <div>利潤</div>
                                <div>利潤率</div>
                            </div>
                            ${lowProfitable.map(item => `
                                <div class="table-row">
                                    <div class="item-name">${item.name}</div>
                                    <div class="price">$${item.price}</div>
                                    <div class="cost">$${item.cost.toFixed(2)}</div>
                                    <div class="profit">$${item.profit.toFixed(2)}</div>
                                    <div class="margin">
                                        <span class="margin-badge ${parseFloat(item.margin) < 20 ? 'low' : 'medium'}">${item.margin}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="category-profitability">
                    <h3><i class="fas fa-chart-pie"></i> 分類獲利分析</h3>
                    <div class="category-profit-grid">
                        ${Object.entries(this.menuManager.getMenuByCategory()).map(([category, categoryItems]) => {
                            if (categoryItems.length === 0) return '';
                            
                            const avgMargin = categoryItems.reduce((sum, item) => 
                                sum + parseFloat(this.menuManager.calculateProfitMargin(item.name)), 0
                            ) / categoryItems.length;
                            
                            const totalRevenue = categoryItems.reduce((sum, item) => sum + item.price, 0);
                            const totalCost = categoryItems.reduce((sum, item) => 
                                sum + this.menuManager.calculateMenuCost(item.name), 0);
                            
                            return `
                                <div class="category-profit-card">
                                    <h4>${category}</h4>
                                    <div class="profit-metrics">
                                        <div class="metric">
                                            <span class="label">平均利潤率</span>
                                            <span class="value">${avgMargin.toFixed(2)}%</span>
                                        </div>
                                        <div class="metric">
                                            <span class="label">總營收</span>
                                            <span class="value">$${totalRevenue}</span>
                                        </div>
                                        <div class="metric">
                                            <span class="label">總成本</span>
                                            <span class="value">$${totalCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderCustomerMenu() {
        const menusByCategory = this.menuManager.getMenuByCategory();
        const availableCategories = Object.entries(menusByCategory).filter(([category, items]) => 
            items.some(item => this.menuManager.checkAvailability(item.name))
        );

        return `
            <div class="customer-menu-preview">
                <div class="menu-header-customer">
                    <h2>泰式料理菜單</h2>
                    <p class="menu-subtitle">正宗泰式風味，新鮮現做</p>
                </div>

                ${availableCategories.map(([category, items]) => {
                    const availableItems = items.filter(item => this.menuManager.checkAvailability(item.name));
                    if (availableItems.length === 0) return '';

                    return `
                        <div class="menu-category-section">
                            <h3 class="category-title">${category}</h3>
                            <div class="menu-items-customer">
                                ${availableItems.map(item => {
                                    const maxServings = this.menuManager.calculateMaxServings(item.name);
                                    const isLowStock = maxServings < 5;
                                    
                                    return `
                                        <div class="customer-menu-item ${isLowStock ? 'low-stock' : ''}">
                                            <div class="item-info">
                                                <div class="item-name-price">
                                                    <h4 class="item-name">${item.name}</h4>
                                                    <span class="item-price">$${item.price}</span>
                                                </div>
                                                <p class="item-description">${item.description}</p>
                                                <div class="item-tags">
                                                    ${item.spiceLevel && item.spiceLevel !== '無辣度' ? `
                                                        <span class="spice-tag ${item.spiceLevel}">${item.spiceLevel}</span>
                                                    ` : ''}
                                                    ${item.allergens ? `
                                                        <span class="allergen-tag">${item.allergens}</span>
                                                    ` : ''}
                                                    ${item.spiceOptions.length > 0 ? `
                                                        <span class="customizable-tag">可調辣度</span>
                                                    ` : ''}
                                                    ${isLowStock ? `
                                                        <span class="stock-warning">數量有限</span>
                                                    ` : ''}
                                                </div>
                                            </div>
                                            <div class="item-actions">
                                                <button class="add-to-cart-btn" data-item="${item.name}">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}

                <div class="menu-footer-customer">
                    <p class="menu-note">* 價格如有異動，以現場公告為準</p>
                    <p class="menu-note">* 辣度可依個人喜好調整</p>
                    <p class="menu-note">* 部分品項售完為止</p>
                </div>
            </div>
        `;
    }

    filterByCategory(category) {
        this.selectedCategory = category;
        this.renderCurrentView();
    }

    toggleItemAvailability(itemName) {
        const item = this.menuManager.menuItems.find(item => item.name === itemName);
        if (item) {
            item.available = !item.available;
            this.renderCurrentView();
            this.showNotification(`${itemName} ${item.available ? '已啟用' : '已停用'}`);
        }
    }

    refreshMenu() {
        // 重新計算所有項目的庫存
        this.menuManager.menuItems.forEach(item => {
            item.stock = this.menuManager.calculateMaxServings(item.name);
        });
        
        this.renderCurrentView();
        this.showNotification('菜單已重新整理');
    }

    exportMenu() {
        const menuData = {
            timestamp: new Date().toISOString(),
            statistics: this.menuManager.getMenuStatistics(),
            menuItems: this.menuManager.menuItems,
            alerts: this.menuManager.generateShortageAlerts(),
            suggestions: this.menuManager.generatePurchaseSuggestions()
        };

        const dataStr = JSON.stringify(menuData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `menu-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('菜單已匯出');
    }

    viewItemDetails(itemName) {
        const item = this.menuManager.menuItems.find(item => item.name === itemName);
        const components = this.menuManager.menuComponents.filter(component => 
            component.menuItem === itemName
        );
        
        if (!item) return;

        // 創建詳情彈窗
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${item.name} - 詳細資訊</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="item-details-grid">
                        <div class="detail-section">
                            <h4>基本資訊</h4>
                            <div class="detail-row">
                                <span class="label">分類：</span>
                                <span class="value">${item.category}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">售價：</span>
                                <span class="value">$${item.price}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">成本：</span>
                                <span class="value">$${item.cost.toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">利潤率：</span>
                                <span class="value">${this.menuManager.calculateProfitMargin(item.name)}%</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">可製作份數：</span>
                                <span class="value">${this.menuManager.calculateMaxServings(item.name)} 份</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>組成項目</h4>
                            <div class="components-list">
                                ${components.map(component => `
                                    <div class="component-item">
                                        <div class="component-name">${component.componentName}</div>
                                        <div class="component-details">
                                            ${component.recipe ? `
                                                <span class="recipe-info">配方: ${component.recipe}</span>
                                                <span class="quantity">用量: ${component.recipeQuantity}</span>
                                                <span class="stock">庫存: ${component.recipeStock}</span>
                                            ` : `
                                                <span class="ingredient-info">食材: ${component.ingredient}</span>
                                                <span class="quantity">用量: ${component.ingredientQuantity}</span>
                                                <span class="stock">庫存: ${component.ingredientStock}</span>
                                            `}
                                            <span class="cost">成本: $${component.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 綁定關閉事件
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showNotification(message, type = 'success') {
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
        // 每30秒自動重新整理數據
        setInterval(() => {
            if (this.currentView === 'menu-overview' || this.currentView === 'availability') {
                this.refreshMenu();
            }
        }, 30000);
    }

    renderMenuInterface() {
        const container = this.createMenuContainer();
        
        // 如果已經存在容器，替換它
        const existingContainer = document.getElementById('menu-management-container');
        if (existingContainer) {
            existingContainer.replaceWith(container);
        } else {
            document.body.appendChild(container);
        }
        
        this.renderCurrentView();
    }
}

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuUI;
}
