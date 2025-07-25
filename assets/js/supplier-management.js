// 供應商管理系統 JavaScript
class SupplierManager {
    constructor() {
        this.suppliers = this.loadSuppliersData();
        this.currentEditingId = null;
        this.init();
    }

    // 初始化系統
    init() {
        this.bindEvents();
        this.renderSuppliers();
        this.updateStats();
    }

    // 載入供應商資料 (從 Notion 資料庫匯入)
    loadSuppliersData() {
        // 從 localStorage 讀取或使用預設資料
        const saved = localStorage.getItem('suppliersData');
        if (saved) {
            return JSON.parse(saved);
        }

        // 基於 Notion 的預設供應商資料
        return [
            {
                id: 'YZ',
                name: '益州蛋行',
                contactPerson: '李經理',
                contactPhone: '02-1234-5678',
                mainCategory: '蛋品',
                address: '台北市士林區大東路123號',
                notes: '專業蛋品供應商，品質穩定',
                status: 'active',
                createdAt: new Date('2024-01-15'),
                lastContact: new Date('2024-07-20')
            },
            {
                id: 'HQ',
                name: '合群行',
                contactPerson: '王先生',
                contactPhone: '02-2345-6789',
                mainCategory: '食品',
                address: '台北市大同區民生西路456號',
                notes: '綜合食品批發商',
                status: 'active',
                createdAt: new Date('2024-02-01'),
                lastContact: new Date('2024-07-18')
            },
            {
                id: 'DL',
                name: '東莉食品有限公司',
                contactPerson: '陳總經理',
                contactPhone: '02-3456-7890',
                mainCategory: '食品',
                address: '新北市三重區重新路789號',
                notes: '冷凍食品專業供應',
                status: 'active',
                createdAt: new Date('2024-01-20'),
                lastContact: new Date('2024-07-22')
            },
            {
                id: 'YJ',
                name: '洋基肉品商行',
                contactPerson: '張老闆',
                contactPhone: '02-4567-8901',
                mainCategory: '肉品',
                address: '台北市萬華區西園路321號',
                notes: '新鮮肉品，每日配送',
                status: 'active',
                createdAt: new Date('2024-02-10'),
                lastContact: new Date('2024-07-19')
            },
            {
                id: 'CSS',
                name: '昌順水產行',
                contactPerson: '林老闆',
                contactPhone: '02-5678-9012',
                mainCategory: '水產',
                address: '基隆市仁愛區愛四路654號',
                notes: '每日新鮮漁獲直送',
                status: 'active',
                createdAt: new Date('2024-01-25'),
                lastContact: new Date('2024-07-21')
            },
            {
                id: 'JL',
                name: '佳良行',
                contactPerson: '吳經理',
                contactPhone: '02-6789-0123',
                mainCategory: '蔬菜',
                address: '台北市內湖區成功路987號',
                notes: '有機蔬菜專門店',
                status: 'active',
                createdAt: new Date('2024-02-15'),
                lastContact: new Date('2024-07-23')
            },
            {
                id: 'HJ',
                name: '泓潔企業有限公司',
                contactPerson: '黃董事長',
                contactPhone: '02-7890-1234',
                mainCategory: '食品',
                address: '桃園市中壢區中央路147號',
                notes: '清潔用品與包裝材料',
                status: 'active',
                createdAt: new Date('2024-03-01'),
                lastContact: new Date('2024-07-17')
            },
            {
                id: 'CS',
                name: '菜商',
                contactPerson: '蔡先生',
                contactPhone: '02-8901-2345',
                mainCategory: '蔬菜',
                address: '台北市北投區中央北路258號',
                notes: '傳統市場蔬菜供應',
                status: 'pending',
                createdAt: new Date('2024-07-10'),
                lastContact: new Date('2024-07-10')
            },
            {
                id: 'HSD',
                name: '好事多',
                contactPerson: '客服部',
                contactPhone: '0800-123-456',
                mainCategory: '超市',
                address: '全台各分店',
                notes: '大型連鎖賣場採購',
                status: 'active',
                createdAt: new Date('2024-01-05'),
                lastContact: new Date('2024-07-15')
            },
            {
                id: 'QL',
                name: '全聯',
                contactPerson: '採購部',
                contactPhone: '0800-789-123',
                mainCategory: '超市',
                address: '全台各分店',
                notes: '便利商品補給',
                status: 'active',
                createdAt: new Date('2024-01-08'),
                lastContact: new Date('2024-07-16')
            },
            {
                id: 'BDL',
                name: '八斗聯',
                contactPerson: '船長',
                contactPhone: '02-2468-1357',
                mainCategory: '水產',
                address: '基隆市中正區北寧路369號',
                notes: '漁船直銷新鮮海產',
                status: 'active',
                createdAt: new Date('2024-02-20'),
                lastContact: new Date('2024-07-24')
            },
            {
                id: 'TANA',
                name: 'TanawatThai',
                contactPerson: 'Tanawat',
                contactPhone: '02-1357-2468',
                mainCategory: '泰式料理',
                address: '台北市信義區松仁路741號',
                notes: '泰式料理食材專門店',
                status: 'active',
                createdAt: new Date('2024-03-15'),
                lastContact: new Date('2024-07-22')
            },
            {
                id: 'KZD',
                name: '坎仔嵿',
                contactPerson: '老闆娘',
                contactPhone: '02-9876-5432',
                mainCategory: '其他',
                address: '新竹縣竹東鎮中豐路852號',
                notes: '地方特色食材',
                status: 'pending',
                createdAt: new Date('2024-07-12'),
                lastContact: new Date('2024-07-12')
            }
        ];
    }

    // 綁定事件
    bindEvents() {
        // 搜尋功能
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterSuppliers(e.target.value);
        });

        // 類別篩選
        document.getElementById('filter-category').addEventListener('change', (e) => {
            this.filterByCategory(e.target.value);
        });

        // 新增供應商按鈕
        document.getElementById('add-supplier-btn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal 相關事件
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('supplier-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSupplier();
        });

        // 點擊 Modal 外部關閉
        document.getElementById('supplier-modal').addEventListener('click', (e) => {
            if (e.target.id === 'supplier-modal') {
                this.closeModal();
            }
        });
    }

    // 渲染供應商列表
    renderSuppliers(suppliersToRender = this.suppliers) {
        const container = document.getElementById('suppliers-container');
        
        if (suppliersToRender.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-400 mb-2">沒有找到供應商</h3>
                    <p class="text-gray-500">請調整搜尋條件或新增供應商</p>
                </div>
            `;
            return;
        }

        container.innerHTML = suppliersToRender.map(supplier => this.createSupplierCard(supplier)).join('');
    }

    // 建立供應商卡片
    createSupplierCard(supplier) {
        const statusColors = {
            active: 'text-green-400',
            inactive: 'text-red-400',
            pending: 'text-yellow-400'
        };

        const statusText = {
            active: '活躍',
            inactive: '停用',
            pending: '待審核'
        };

        return `
            <div class="supplier-card bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <span class="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">${supplier.id}</span>
                            <span class="status-${supplier.status} ${statusColors[supplier.status]} text-sm font-medium">
                                ${statusText[supplier.status]}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-white">${supplier.name}</h3>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="supplierManager.editSupplier('${supplier.id}')" 
                                class="action-btn text-indigo-400 hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-900/30">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="supplierManager.deleteSupplier('${supplier.id}')" 
                                class="action-btn text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/30">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center text-gray-300">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>${supplier.contactPerson || '未設定'}</span>
                    </div>

                    <div class="flex items-center text-gray-300">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span>${supplier.contactPhone || '未設定'}</span>
                    </div>

                    <div class="flex items-center text-gray-300">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        <span class="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-sm">${supplier.mainCategory}</span>
                    </div>

                    ${supplier.address ? `
                    <div class="flex items-start text-gray-300">
                        <svg class="w-4 h-4 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span class="text-sm">${supplier.address}</span>
                    </div>
                    ` : ''}

                    ${supplier.notes ? `
                    <div class="bg-gray-700/50 rounded-lg p-3 mt-4">
                        <p class="text-sm text-gray-300">${supplier.notes}</p>
                    </div>
                    ` : ''}

                    <div class="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-700">
                        <span>建立: ${supplier.createdAt.toLocaleDateString('zh-TW')}</span>
                        <span>最後聯絡: ${supplier.lastContact.toLocaleDateString('zh-TW')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 搜尋功能
    filterSuppliers(searchTerm) {
        const filtered = this.suppliers.filter(supplier => 
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.mainCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderSuppliers(filtered);
    }

    // 類別篩選
    filterByCategory(category) {
        if (!category) {
            this.renderSuppliers();
            return;
        }
        
        const filtered = this.suppliers.filter(supplier => supplier.mainCategory === category);
        this.renderSuppliers(filtered);
    }

    // 開啟 Modal
    openModal(supplier = null) {
        this.currentEditingId = supplier ? supplier.id : null;
        const modal = document.getElementById('supplier-modal');
        const title = document.getElementById('modal-title');
        
        title.textContent = supplier ? '編輯供應商' : '新增供應商';
        
        if (supplier) {
            this.fillForm(supplier);
        } else {
            this.clearForm();
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // 關閉 Modal
    closeModal() {
        const modal = document.getElementById('supplier-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.clearForm();
        this.currentEditingId = null;
    }

    // 填入表單
    fillForm(supplier) {
        document.getElementById('supplier-id').value = supplier.id;
        document.getElementById('supplier-name').value = supplier.name;
        document.getElementById('contact-person').value = supplier.contactPerson || '';
        document.getElementById('contact-phone').value = supplier.contactPhone || '';
        document.getElementById('main-category').value = supplier.mainCategory || '';
        document.getElementById('supplier-address').value = supplier.address || '';
        document.getElementById('supplier-notes').value = supplier.notes || '';
    }

    // 清空表單
    clearForm() {
        document.getElementById('supplier-form').reset();
    }

    // 儲存供應商
    saveSupplier() {
        const formData = {
            id: document.getElementById('supplier-id').value.trim(),
            name: document.getElementById('supplier-name').value.trim(),
            contactPerson: document.getElementById('contact-person').value.trim(),
            contactPhone: document.getElementById('contact-phone').value.trim(),
            mainCategory: document.getElementById('main-category').value,
            address: document.getElementById('supplier-address').value.trim(),
            notes: document.getElementById('supplier-notes').value.trim()
        };

        // 驗證必填欄位
        if (!formData.id || !formData.name) {
            alert('請填入供應商ID和名稱');
            return;
        }

        // 檢查ID是否重複
        if (!this.currentEditingId && this.suppliers.find(s => s.id === formData.id)) {
            alert('供應商ID已存在，請使用其他ID');
            return;
        }

        if (this.currentEditingId) {
            // 編輯現有供應商
            const index = this.suppliers.findIndex(s => s.id === this.currentEditingId);
            if (index !== -1) {
                this.suppliers[index] = {
                    ...this.suppliers[index],
                    ...formData,
                    lastContact: new Date()
                };
            }
        } else {
            // 新增供應商
            const newSupplier = {
                ...formData,
                status: 'pending',
                createdAt: new Date(),
                lastContact: new Date()
            };
            this.suppliers.push(newSupplier);
        }

        this.saveToStorage();
        this.renderSuppliers();
        this.updateStats();
        this.closeModal();
        
        // 顯示成功訊息
        this.showNotification(this.currentEditingId ? '供應商資訊已更新' : '新供應商已新增', 'success');
    }

    // 編輯供應商
    editSupplier(id) {
        const supplier = this.suppliers.find(s => s.id === id);
        if (supplier) {
            this.openModal(supplier);
        }
    }

    // 刪除供應商
    deleteSupplier(id) {
        if (confirm('確定要刪除這個供應商嗎？此操作無法復原。')) {
            this.suppliers = this.suppliers.filter(s => s.id !== id);
            this.saveToStorage();
            this.renderSuppliers();
            this.updateStats();
            this.showNotification('供應商已刪除', 'success');
        }
    }

    // 更新統計資料
    updateStats() {
        const total = this.suppliers.length;
        const active = this.suppliers.filter(s => s.status === 'active').length;
        const pending = this.suppliers.filter(s => s.status === 'pending').length;
        const categories = new Set(this.suppliers.map(s => s.mainCategory)).size;

        document.getElementById('total-suppliers').textContent = total;
        document.getElementById('active-suppliers').textContent = active;
        document.getElementById('pending-suppliers').textContent = pending;
        document.getElementById('total-categories').textContent = categories;
    }

    // 儲存到 localStorage
    saveToStorage() {
        localStorage.setItem('suppliersData', JSON.stringify(this.suppliers));
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg text-white font-semibold transform transition-all duration-300 translate-x-full`;
        
        const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
        notification.classList.add(bgColor);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 匯出供應商資料
    exportData() {
        const dataStr = JSON.stringify(this.suppliers, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `suppliers_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    }

    // 匯入供應商資料
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.suppliers = importedData.map(supplier => ({
                        ...supplier,
                        createdAt: new Date(supplier.createdAt),
                        lastContact: new Date(supplier.lastContact)
                    }));
                    this.saveToStorage();
                    this.renderSuppliers();
                    this.updateStats();
                    this.showNotification('資料匯入成功', 'success');
                }
            } catch (error) {
                this.showNotification('匯入失敗：檔案格式錯誤', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// 初始化供應商管理系統
let supplierManager;

document.addEventListener('DOMContentLoaded', () => {
    supplierManager = new SupplierManager();
    
    // 添加鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            supplierManager.openModal();
        }
        if (e.key === 'Escape') {
            supplierManager.closeModal();
        }
    });
});

// 使功能可在全域存取
window.supplierManager = supplierManager;
