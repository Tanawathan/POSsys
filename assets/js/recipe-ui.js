// recipe-ui.js - 配方管理UI控制器
class RecipeUI {
    constructor() {
        this.recipeManager = new RecipeManager();
        this.inventoryManager = new InventoryManager();
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filteredRecipes = [];
        this.allRecipes = [];
        
        this.init();
    }

    async init() {
        try {
            // 載入配方數據
            await this.loadRecipeData();
            
            // 初始化事件監聽器
            this.setupEventListeners();
            
            // 渲染初始頁面
            await this.renderDashboard();
            await this.renderRecipes();
            
            // 每30秒更新一次庫存狀態
            setInterval(() => {
                this.updateProductionStatus();
            }, 30000);
            
        } catch (error) {
            console.error('配方管理系統初始化失敗:', error);
            this.showNotification('系統初始化失敗', 'error');
        }
    }

    async loadRecipeData() {
        // 模擬載入半成品配方數據
        this.allRecipes = [
            {
                id: 'rf001',
                name: '舒肥海南雞',
                category: '主菜',
                weight: 100,
                unitCost: 12.91,
                totalCost: 12.91,
                currentStock: 25,
                ingredients: [
                    { name: '雞胸肉', quantity: 100, unit: 'g', cost: 8.5, available: 500 },
                    { name: '薑', quantity: 3, unit: 'g', cost: 0.15, available: 200 },
                    { name: '青蔥', quantity: 3, unit: 'g', cost: 0.21, available: 150 }
                ]
            },
            {
                id: 'rf002',
                name: '椒麻雞醬',
                category: '醬料',
                weight: 58,
                unitCost: 38.05,
                totalCost: 22.07,
                currentStock: 8,
                ingredients: [
                    { name: '花椒粉', quantity: 5, unit: 'g', cost: 2.5, available: 30 },
                    { name: '辣椒油', quantity: 10, unit: 'ml', cost: 3.2, available: 200 },
                    { name: '蒜泥', quantity: 8, unit: 'g', cost: 1.6, available: 100 }
                ]
            },
            {
                id: 'rf003',
                name: '泰式酸辣醬',
                category: '醬料',
                weight: 85,
                unitCost: 28.50,
                totalCost: 24.23,
                currentStock: 12,
                ingredients: [
                    { name: '檸檬汁', quantity: 15, unit: 'ml', cost: 4.5, available: 80 },
                    { name: '魚露', quantity: 10, unit: 'ml', cost: 3.8, available: 150 },
                    { name: '辣椒醬', quantity: 12, unit: 'g', cost: 5.2, available: 120 }
                ]
            },
            {
                id: 'rf004',
                name: '韓式炸雞粉',
                category: '調料',
                weight: 120,
                unitCost: 15.20,
                totalCost: 18.24,
                currentStock: 0,
                ingredients: [
                    { name: '麵粉', quantity: 80, unit: 'g', cost: 3.2, available: 5 },
                    { name: '玉米粉', quantity: 20, unit: 'g', cost: 2.8, available: 10 },
                    { name: '韓式香料', quantity: 10, unit: 'g', cost: 8.5, available: 0 }
                ]
            },
            {
                id: 'rf005',
                name: '紅燒肉湯底',
                category: '湯品',
                weight: 200,
                unitCost: 25.80,
                totalCost: 51.60,
                currentStock: 15,
                ingredients: [
                    { name: '豬骨高湯', quantity: 150, unit: 'ml', cost: 18.0, available: 300 },
                    { name: '醬油', quantity: 20, unit: 'ml', cost: 4.6, available: 250 },
                    { name: '冰糖', quantity: 10, unit: 'g', cost: 1.2, available: 180 }
                ]
            },
            {
                id: 'rf006',
                name: '蒜蓉白肉',
                category: '主菜',
                weight: 150,
                unitCost: 22.40,
                totalCost: 33.60,
                currentStock: 10,
                ingredients: [
                    { name: '五花肉', quantity: 120, unit: 'g', cost: 24.0, available: 200 },
                    { name: '蒜頭', quantity: 15, unit: 'g', cost: 3.8, available: 90 },
                    { name: '白醬油', quantity: 8, unit: 'ml', cost: 2.4, available: 150 }
                ]
            }
        ];

        this.filteredRecipes = [...this.allRecipes];
    }

    setupEventListeners() {
        // 搜尋功能
        document.getElementById('recipe-search').addEventListener('input', (e) => {
            this.filterRecipes();
        });

        // 分類篩選
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterRecipes();
        });

        // 生產狀態篩選
        document.getElementById('production-filter').addEventListener('change', (e) => {
            this.filterRecipes();
        });

        // 功能按鈕
        document.getElementById('shortage-alert-btn').addEventListener('click', () => {
            this.showShortageAlert();
        });

        document.getElementById('purchase-suggest-btn').addEventListener('click', () => {
            this.showPurchaseSuggestions();
        });

        document.getElementById('add-recipe-btn').addEventListener('click', () => {
            this.showAddRecipeDialog();
        });

        // 分頁控制
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderRecipes();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredRecipes.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderRecipes();
            }
        });

        // Modal 控制
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal('recipe-modal');
        });

        document.getElementById('close-shortage-modal').addEventListener('click', () => {
            this.hideModal('shortage-modal');
        });

        document.getElementById('close-purchase-modal').addEventListener('click', () => {
            this.hideModal('purchase-modal');
        });

        // 生產計算器
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateProduction();
        });

        // 生產功能
        document.getElementById('check-availability-btn').addEventListener('click', () => {
            this.checkIngredientAvailability();
        });

        document.getElementById('start-production-btn').addEventListener('click', () => {
            this.startProduction();
        });

        // 點擊背景關閉 Modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fixed') && e.target.classList.contains('bg-black')) {
                this.hideAllModals();
            }
        });
    }

    async renderDashboard() {
        const stats = this.calculateRecipeStats();
        
        document.getElementById('total-recipes').textContent = stats.total;
        document.getElementById('producible-recipes').textContent = stats.producible;
        document.getElementById('shortage-recipes').textContent = stats.shortage;
        document.getElementById('avg-cost').textContent = `$${stats.avgCost}`;
    }

    calculateRecipeStats() {
        const total = this.allRecipes.length;
        let producible = 0;
        let shortage = 0;
        let totalCost = 0;

        this.allRecipes.forEach(recipe => {
            const canProduce = this.canProduceRecipe(recipe);
            if (canProduce) {
                producible++;
            } else {
                shortage++;
            }
            totalCost += recipe.unitCost;
        });

        return {
            total,
            producible,
            shortage,
            avgCost: (totalCost / total).toFixed(2)
        };
    }

    canProduceRecipe(recipe) {
        return recipe.ingredients.every(ingredient => ingredient.available >= ingredient.quantity);
    }

    filterRecipes() {
        const searchTerm = document.getElementById('recipe-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const productionFilter = document.getElementById('production-filter').value;

        this.filteredRecipes = this.allRecipes.filter(recipe => {
            // 搜尋過濾
            const matchesSearch = recipe.name.toLowerCase().includes(searchTerm);
            
            // 分類過濾
            const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
            
            // 生產狀態過濾
            let matchesProduction = true;
            if (productionFilter === '可生產') {
                matchesProduction = this.canProduceRecipe(recipe);
            } else if (productionFilter === '缺料') {
                matchesProduction = !this.canProduceRecipe(recipe);
            } else if (productionFilter === '低庫存') {
                matchesProduction = recipe.currentStock < 10;
            }

            return matchesSearch && matchesCategory && matchesProduction;
        });

        this.currentPage = 1;
        this.renderRecipes();
    }

    async renderRecipes() {
        const container = document.getElementById('recipes-container');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const recipesToShow = this.filteredRecipes.slice(startIndex, endIndex);

        container.innerHTML = '';

        recipesToShow.forEach(recipe => {
            const canProduce = this.canProduceRecipe(recipe);
            const maxProduction = this.calculateMaxProduction(recipe);
            
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all';
            recipeCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-1">${recipe.name}</h3>
                        <span class="ingredient-tag text-white text-xs px-2 py-1 rounded-full">${recipe.category}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">重量</div>
                        <div class="font-semibold">${recipe.weight}g</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">單位成本</div>
                        <div class="font-bold text-blue-600">$${recipe.unitCost}/100g</div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">總成本</div>
                        <div class="font-bold text-green-600">$${recipe.totalCost.toFixed(2)}</div>
                    </div>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <div>
                        <div class="text-xs text-gray-500">當前庫存</div>
                        <div class="font-semibold ${recipe.currentStock < 10 ? 'text-red-600' : 'text-gray-800'}">${recipe.currentStock} 份</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-500">可製作</div>
                        <div class="font-semibold ${canProduce ? 'text-green-600' : 'text-red-600'}">${canProduce ? maxProduction : 0} 份</div>
                    </div>
                </div>

                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        ${canProduce ? 
                            '<i class="fas fa-check-circle text-green-500 mr-2"></i><span class="text-green-600 text-sm font-medium">可生產</span>' :
                            '<i class="fas fa-exclamation-triangle text-red-500 mr-2"></i><span class="text-red-600 text-sm font-medium">缺料</span>'
                        }
                    </div>
                    <div class="text-sm text-gray-500">${recipe.ingredients.length} 種食材</div>
                </div>
            `;

            recipeCard.addEventListener('click', () => {
                this.showRecipeDetail(recipe);
            });

            container.appendChild(recipeCard);
        });

        this.updatePagination();
    }

    calculateMaxProduction(recipe) {
        let maxProduction = Infinity;
        
        recipe.ingredients.forEach(ingredient => {
            const possible = Math.floor(ingredient.available / ingredient.quantity);
            maxProduction = Math.min(maxProduction, possible);
        });

        return maxProduction === Infinity ? 0 : maxProduction;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredRecipes.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredRecipes.length);

        document.getElementById('showing-start').textContent = startIndex + 1;
        document.getElementById('showing-end').textContent = endIndex;
        document.getElementById('total-count').textContent = this.filteredRecipes.length;
        document.getElementById('page-info').textContent = `第 ${this.currentPage} 頁，共 ${totalPages} 頁`;

        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages;
    }

    showRecipeDetail(recipe) {
        document.getElementById('modal-recipe-title').textContent = recipe.name;
        document.getElementById('modal-category').textContent = recipe.category;
        document.getElementById('modal-weight').textContent = recipe.weight;
        document.getElementById('modal-unit-cost').textContent = recipe.unitCost;
        document.getElementById('modal-total-cost').textContent = recipe.totalCost.toFixed(2);
        document.getElementById('modal-current-stock').textContent = recipe.currentStock;
        document.getElementById('modal-max-production').textContent = this.calculateMaxProduction(recipe);

        // 渲染食材清單
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = '';

        recipe.ingredients.forEach(ingredient => {
            const available = ingredient.available >= ingredient.quantity;
            const ingredientDiv = document.createElement('div');
            ingredientDiv.className = `flex justify-between items-center p-3 rounded-lg border ${available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;
            ingredientDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${available ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'} mr-3"></i>
                    <div>
                        <div class="font-medium">${ingredient.name}</div>
                        <div class="text-sm text-gray-500">需要: ${ingredient.quantity} ${ingredient.unit}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-medium ${available ? 'text-green-600' : 'text-red-600'}">庫存: ${ingredient.available} ${ingredient.unit}</div>
                    <div class="text-sm text-gray-500">成本: $${ingredient.cost.toFixed(2)}</div>
                </div>
            `;
            ingredientsList.appendChild(ingredientDiv);
        });

        // 設置當前配方
        this.currentRecipe = recipe;
        
        this.showModal('recipe-modal');
    }

    calculateProduction() {
        if (!this.currentRecipe) return;

        const quantity = parseInt(document.getElementById('production-quantity').value) || 1;
        const resultDiv = document.getElementById('production-result');
        
        let canProduce = true;
        let totalCost = 0;
        const requiredIngredients = [];

        this.currentRecipe.ingredients.forEach(ingredient => {
            const required = ingredient.quantity * quantity;
            const cost = ingredient.cost * quantity;
            totalCost += cost;

            requiredIngredients.push({
                ...ingredient,
                requiredQuantity: required,
                totalCost: cost,
                sufficient: ingredient.available >= required
            });

            if (ingredient.available < required) {
                canProduce = false;
            }
        });

        let resultHTML = `
            <div class="bg-white p-4 rounded-lg border">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-medium">製作 ${quantity} 份 ${this.currentRecipe.name}</span>
                    <span class="font-bold text-lg ${canProduce ? 'text-green-600' : 'text-red-600'}">
                        ${canProduce ? '✅ 可生產' : '❌ 缺料'}
                    </span>
                </div>
                <div class="text-sm text-gray-600 mb-2">總成本: $${totalCost.toFixed(2)}</div>
        `;

        if (!canProduce) {
            resultHTML += '<div class="text-sm text-red-600 mb-2">缺少以下食材:</div>';
            requiredIngredients.filter(ing => !ing.sufficient).forEach(ingredient => {
                const shortage = ingredient.requiredQuantity - ingredient.available;
                resultHTML += `<div class="text-xs text-red-600">• ${ingredient.name}: 缺少 ${shortage} ${ingredient.unit}</div>`;
            });
        }

        resultHTML += '</div>';
        resultDiv.innerHTML = resultHTML;
    }

    checkIngredientAvailability() {
        if (!this.currentRecipe) return;

        const quantity = parseInt(document.getElementById('production-quantity').value) || 1;
        this.calculateProduction();
        this.showNotification('已檢查食材庫存狀況', 'info');
    }

    startProduction() {
        if (!this.currentRecipe) return;

        const quantity = parseInt(document.getElementById('production-quantity').value) || 1;
        const canProduce = this.canProduceRecipe(this.currentRecipe);

        if (!canProduce) {
            this.showNotification('食材不足，無法開始生產', 'error');
            return;
        }

        // 模擬開始生產
        this.showNotification(`開始生產 ${quantity} 份 ${this.currentRecipe.name}`, 'success');
        
        // 更新庫存（模擬）
        this.currentRecipe.ingredients.forEach(ingredient => {
            ingredient.available -= ingredient.quantity * quantity;
        });

        this.currentRecipe.currentStock += quantity;

        // 更新顯示
        this.calculateProduction();
        this.renderDashboard();
        this.renderRecipes();
    }

    showShortageAlert() {
        const shortageRecipes = this.allRecipes.filter(recipe => !this.canProduceRecipe(recipe));
        const content = document.getElementById('shortage-alerts-content');

        if (shortageRecipes.length === 0) {
            content.innerHTML = '<div class="text-center py-8 text-gray-500">目前沒有缺料的配方！</div>';
        } else {
            content.innerHTML = shortageRecipes.map(recipe => {
                const missingIngredients = recipe.ingredients.filter(ing => ing.available < ing.quantity);
                return `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold text-yellow-800">${recipe.name}</h4>
                            <span class="text-sm text-yellow-600">${recipe.category}</span>
                        </div>
                        <div class="text-sm text-yellow-700 mb-2">缺少食材:</div>
                        ${missingIngredients.map(ing => 
                            `<div class="text-xs text-yellow-600 ml-4">• ${ing.name}: 需要 ${ing.quantity} ${ing.unit}，庫存 ${ing.available} ${ing.unit}</div>`
                        ).join('')}
                    </div>
                `;
            }).join('');
        }

        this.showModal('shortage-modal');
    }

    showPurchaseSuggestions() {
        const suggestions = this.generatePurchaseSuggestions();
        const content = document.getElementById('purchase-suggestions-content');

        if (suggestions.length === 0) {
            content.innerHTML = '<div class="text-center py-8 text-gray-500">目前沒有採購建議！</div>';
        } else {
            content.innerHTML = `
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2">建議採購清單</h4>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        ${suggestions.map(suggestion => `
                            <div class="flex justify-between items-center py-2 border-b border-blue-200 last:border-b-0">
                                <div>
                                    <span class="font-medium">${suggestion.ingredient}</span>
                                    <span class="text-sm text-gray-600 ml-2">(當前庫存: ${suggestion.currentStock} ${suggestion.unit})</span>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-blue-600">建議採購: ${suggestion.suggestedQuantity} ${suggestion.unit}</div>
                                    <div class="text-sm text-gray-500">預估成本: $${suggestion.estimatedCost.toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                        <div class="mt-4 pt-3 border-t border-blue-200">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">總計:</span>
                                <span class="font-bold text-lg text-blue-600">$${suggestions.reduce((sum, s) => sum + s.estimatedCost, 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        this.showModal('purchase-modal');
    }

    generatePurchaseSuggestions() {
        const ingredientNeeds = new Map();

        // 分析所有配方的食材需求
        this.allRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => {
                if (ingredient.available < ingredient.quantity * 5) { // 假設安全庫存是5份
                    const key = ingredient.name;
                    if (!ingredientNeeds.has(key)) {
                        ingredientNeeds.set(key, {
                            ingredient: ingredient.name,
                            unit: ingredient.unit,
                            currentStock: ingredient.available,
                            totalNeeded: 0,
                            avgCost: 0,
                            count: 0
                        });
                    }
                    
                    const need = ingredientNeeds.get(key);
                    need.totalNeeded += ingredient.quantity * 10; // 建議採購10份的量
                    need.avgCost += ingredient.cost / ingredient.quantity;
                    need.count++;
                }
            });
        });

        return Array.from(ingredientNeeds.values()).map(need => ({
            ...need,
            suggestedQuantity: Math.max(need.totalNeeded - need.currentStock, 0),
            avgCost: need.avgCost / need.count,
            estimatedCost: (need.totalNeeded - need.currentStock) * (need.avgCost / need.count)
        })).filter(need => need.suggestedQuantity > 0);
    }

    showAddRecipeDialog() {
        this.showNotification('新增配方功能開發中...', 'info');
    }

    updateProductionStatus() {
        this.renderDashboard();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    hideAllModals() {
        const modals = ['recipe-modal', 'shortage-modal', 'purchase-modal'];
        modals.forEach(modalId => this.hideModal(modalId));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 動畫顯示
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 100);
        
        // 自動移除
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 當頁面載入完成時初始化配方管理系統
document.addEventListener('DOMContentLoaded', () => {
    new RecipeUI();
});
