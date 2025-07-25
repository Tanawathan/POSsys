// 半成品配方管理系統
class RecipeManager {
    constructor() {
        this.recipes = [];
        this.recipeIngredients = [];
        this.initializeData();
    }

    // 初始化半成品配方資料
    initializeData() {
        // 從CSV資料轉換為半成品配方
        this.recipes = [
            {
                id: 'R001',
                name: '舒肥海南雞',
                unitCost: 12.91, // 元/100g
                weight: 129.3, // 克
                totalMaterialCost: 16.70,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R002',
                name: '舒肥沙爹咖喱雞',
                unitCost: 14.13,
                weight: 145.5,
                totalMaterialCost: 20.57,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R003',
                name: '帕泰醬',
                unitCost: 8.26,
                weight: 1080,
                totalMaterialCost: 89.18,
                maxProduction: 6,
                currentStock: 600,
                dynamicStock: 7080,
                safetyStock: 0,
                category: '醬料',
                status: '未開始'
            },
            {
                id: 'R004',
                name: '魚露炸腿',
                unitCost: 15.19,
                weight: 13072,
                totalMaterialCost: 1986.28,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 10800,
                safetyStock: 10800,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R005',
                name: '青木瓜醬',
                unitCost: 14.40,
                weight: 185,
                totalMaterialCost: 26.64,
                maxProduction: 20,
                currentStock: 200,
                dynamicStock: 3900,
                safetyStock: 0,
                category: '醬料',
                status: '未開始'
            },
            {
                id: 'R006',
                name: '經典打拋醬-豬',
                unitCost: 17.80,
                weight: 1355,
                totalMaterialCost: 241.23,
                maxProduction: 3,
                currentStock: 960,
                dynamicStock: 5025,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R007',
                name: '經典打拋醬-雞',
                unitCost: 16.62,
                weight: 1355,
                totalMaterialCost: 225.23,
                maxProduction: 6,
                currentStock: 0,
                dynamicStock: 8130,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R008',
                name: '秘傳炸翅',
                unitCost: 11.90,
                weight: 6755,
                totalMaterialCost: 803.92,
                maxProduction: 0,
                currentStock: 2000,
                dynamicStock: 2000,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R009',
                name: '經典蝦醬',
                unitCost: 22.40,
                weight: 58,
                totalMaterialCost: 12.99,
                maxProduction: 10,
                currentStock: 0,
                dynamicStock: 580,
                safetyStock: 0,
                category: '醬料',
                status: '未開始'
            },
            {
                id: 'R010',
                name: '經典炸粉',
                unitCost: 3.77,
                weight: 2000,
                totalMaterialCost: 75.40,
                maxProduction: 1,
                currentStock: 1000,
                dynamicStock: 3000,
                safetyStock: 0,
                category: '調料',
                status: '未開始'
            },
            {
                id: 'R011',
                name: '經典紅咖哩醬',
                unitCost: 13.24,
                weight: 1670,
                totalMaterialCost: 221.10,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 1600,
                safetyStock: 1600,
                category: '醬料',
                status: '未開始'
            },
            {
                id: 'R012',
                name: '經典綠咖哩醬',
                unitCost: 11.13,
                weight: 1620,
                totalMaterialCost: 180.32,
                maxProduction: 1,
                currentStock: 0,
                dynamicStock: 1620,
                safetyStock: 0,
                category: '醬料',
                status: '未開始'
            },
            {
                id: 'R013',
                name: '舒肥薑黃咖喱雞',
                unitCost: 14.75,
                weight: 7720,
                totalMaterialCost: 1138.42,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R014',
                name: '泰南烤雞',
                unitCost: 14.07,
                weight: 6610,
                totalMaterialCost: 929.82,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R015',
                name: '茉莉豬頸肉',
                unitCost: 38.05,
                weight: 6870,
                totalMaterialCost: 2614.14,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R016',
                name: '鹽味翅小腿',
                unitCost: 9.95,
                weight: 6485,
                totalMaterialCost: 645.42,
                maxProduction: 0,
                currentStock: 4800,
                dynamicStock: 4800,
                safetyStock: 0,
                category: '主菜',
                status: '未開始'
            },
            {
                id: 'R017',
                name: '早餐豬肉丸',
                unitCost: 15.96,
                weight: 286,
                totalMaterialCost: 45.65,
                maxProduction: 12,
                currentStock: 0,
                dynamicStock: 3432,
                safetyStock: 0,
                category: '配菜',
                status: '未開始'
            },
            {
                id: 'R018',
                name: '酸辣湯底',
                unitCost: 3.56,
                weight: 6295,
                totalMaterialCost: 223.93,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '湯品',
                status: '未開始'
            },
            {
                id: 'R019',
                name: '泰式奶茶',
                unitCost: 3.74,
                weight: 295,
                totalMaterialCost: 11.04,
                maxProduction: 53,
                currentStock: 0,
                dynamicStock: 15635,
                safetyStock: 0,
                category: '飲料',
                status: '未開始'
            },
            {
                id: 'R020',
                name: '炸春捲',
                unitCost: 12.68,
                weight: 1488.8,
                totalMaterialCost: 188.82,
                maxProduction: 0,
                currentStock: 0,
                dynamicStock: 0,
                safetyStock: 0,
                category: '配菜',
                status: '未開始'
            }
        ];

        // 配方食材組成
        this.recipeIngredients = [
            // 舒肥海南雞配方
            { recipeId: 'R001', ingredientName: '雞胸肉', quantity: 100, unit: '克', unitCost: 0.142, cost: 14.2, maxServings: 60 },
            { recipeId: 'R001', ingredientName: '薑', quantity: 3, unit: '克', unitCost: 0.15, cost: 0.45, maxServings: 0 },
            { recipeId: 'R001', ingredientName: '青蔥', quantity: 3, unit: '克', unitCost: 0.25, cost: 0.75, maxServings: 0 },
            { recipeId: 'R001', ingredientName: '南薑', quantity: 2, unit: '克', unitCost: 0.3, cost: 0.6, maxServings: 0 },
            { recipeId: 'R001', ingredientName: '水', quantity: 10, unit: '毫升', unitCost: 0.001, cost: 0.01, maxServings: 20000 },
            { recipeId: 'R001', ingredientName: '橄欖油', quantity: 10, unit: '毫升', unitCost: 0.041, cost: 0.41, maxServings: 0 },
            { recipeId: 'R001', ingredientName: '鹽', quantity: 0.5, unit: '克', unitCost: 0.008, cost: 0.004, maxServings: 0 },
            { recipeId: 'R001', ingredientName: '雞粉', quantity: 0.5, unit: '克', unitCost: 0.25, cost: 0.125, maxServings: 400 },
            { recipeId: 'R001', ingredientName: '白胡椒', quantity: 0.3, unit: '克', unitCost: 0.5, cost: 0.15, maxServings: 166 },

            // 帕泰醬配方
            { recipeId: 'R003', ingredientName: '紅糖', quantity: 300, unit: '克', unitCost: 0.033, cost: 9.9, maxServings: 6 },
            { recipeId: 'R003', ingredientName: '醋', quantity: 260, unit: '毫升', unitCost: 0.05, cost: 13, maxServings: 7 },
            { recipeId: 'R003', ingredientName: '羅望子', quantity: 200, unit: '克', unitCost: 0.159, cost: 31.8, maxServings: 6 },
            { recipeId: 'R003', ingredientName: '魚露', quantity: 240, unit: '毫升', unitCost: 0.06, cost: 14.4, maxServings: 8 },
            { recipeId: 'R003', ingredientName: '紅蔥醬', quantity: 80, unit: '克', unitCost: 0.251, cost: 20.08, maxServings: 12 },

            // 青木瓜醬配方
            { recipeId: 'R005', ingredientName: '花生', quantity: 30, unit: '克', unitCost: 0.217, cost: 6.51, maxServings: 20 },
            { recipeId: 'R005', ingredientName: '菜豆', quantity: 20, unit: '克', unitCost: 0.1, cost: 2, maxServings: 60 },
            { recipeId: 'R005', ingredientName: '蝦米', quantity: 5, unit: '克', unitCost: 0.467, cost: 2.335, maxServings: 120 },
            { recipeId: 'R005', ingredientName: '蒜仁', quantity: 15, unit: '克', unitCost: 0.167, cost: 2.505, maxServings: 40 },
            { recipeId: 'R005', ingredientName: '大辣椒', quantity: 15, unit: '克', unitCost: 0.15, cost: 2.25, maxServings: 40 },
            { recipeId: 'R005', ingredientName: '紅糖', quantity: 30, unit: '克', unitCost: 0.033, cost: 0.99, maxServings: 60 },
            { recipeId: 'R005', ingredientName: '羅望子', quantity: 30, unit: '克', unitCost: 0.159, cost: 4.77, maxServings: 45 },
            { recipeId: 'R005', ingredientName: '魚露', quantity: 10, unit: '毫升', unitCost: 0.06, cost: 0.6, maxServings: 210 },
            { recipeId: 'R005', ingredientName: '檸檬汁', quantity: 30, unit: '毫升', unitCost: 0.156, cost: 4.68, maxServings: 53 },

            // 經典打拋醬-豬配方
            { recipeId: 'R006', ingredientName: '打拋醬', quantity: 200, unit: '克', unitCost: 0.235, cost: 47, maxServings: 6 },
            { recipeId: 'R006', ingredientName: '蒜仁', quantity: 40, unit: '克', unitCost: 0.167, cost: 6.68, maxServings: 15 },
            { recipeId: 'R006', ingredientName: '鬼椒', quantity: 5, unit: '克', unitCost: 0.267, cost: 1.335, maxServings: 20 },
            { recipeId: 'R006', ingredientName: '大辣椒', quantity: 30, unit: '克', unitCost: 0.15, cost: 4.5, maxServings: 20 },
            { recipeId: 'R006', ingredientName: '白砂糖', quantity: 30, unit: '克', unitCost: 0.037, cost: 1.11, maxServings: 100 },
            { recipeId: 'R006', ingredientName: '打拋粉', quantity: 20, unit: '克', unitCost: 0.98, cost: 19.6, maxServings: 342 },
            { recipeId: 'R006', ingredientName: '豬絞肉', quantity: 800, unit: '克', unitCost: 0.333, cost: 266.4, maxServings: 3 },
            { recipeId: 'R006', ingredientName: '菜豆', quantity: 100, unit: '克', unitCost: 0.1, cost: 10, maxServings: 12 },

            // 經典炸粉配方
            { recipeId: 'R010', ingredientName: '在來米粉', quantity: 600, unit: '克', unitCost: 0.087, cost: 52.2, maxServings: 1 },
            { recipeId: 'R010', ingredientName: '地瓜粉', quantity: 400, unit: '克', unitCost: 0.058, cost: 23.2, maxServings: 4 },
            { recipeId: 'R010', ingredientName: '脆酥粉', quantity: 1000, unit: '克', unitCost: 0, cost: 0, maxServings: 1 }
        ];

        this.saveToStorage();
    }

    // 計算可製作份數
    calculateMaxProduction(recipeId) {
        const ingredients = this.recipeIngredients.filter(item => item.recipeId === recipeId);
        let maxProduction = Infinity;

        ingredients.forEach(ingredient => {
            // 從庫存管理系統獲取當前庫存
            const inventoryItem = inventoryManager.inventoryData.find(item => 
                item.name === ingredient.ingredientName
            );
            
            if (inventoryItem && ingredient.quantity > 0) {
                const possibleProduction = Math.floor(inventoryItem.stock / ingredient.quantity);
                maxProduction = Math.min(maxProduction, possibleProduction);
            }
        });

        return maxProduction === Infinity ? 0 : maxProduction;
    }

    // 計算食材使用預測
    calculateIngredientUsage(recipeId, productionQuantity) {
        const ingredients = this.recipeIngredients.filter(item => item.recipeId === recipeId);
        const usage = [];

        ingredients.forEach(ingredient => {
            usage.push({
                ingredientName: ingredient.ingredientName,
                requiredQuantity: ingredient.quantity * productionQuantity,
                unit: ingredient.unit,
                estimatedCost: ingredient.cost * productionQuantity
            });
        });

        return usage;
    }

    // 檢查庫存是否足夠製作
    checkInventoryAvailability(recipeId, productionQuantity) {
        const ingredients = this.recipeIngredients.filter(item => item.recipeId === recipeId);
        const shortageList = [];

        ingredients.forEach(ingredient => {
            const inventoryItem = inventoryManager.inventoryData.find(item => 
                item.name === ingredient.ingredientName
            );
            
            const requiredQuantity = ingredient.quantity * productionQuantity;
            
            if (!inventoryItem || inventoryItem.stock < requiredQuantity) {
                shortageList.push({
                    ingredientName: ingredient.ingredientName,
                    required: requiredQuantity,
                    available: inventoryItem ? inventoryItem.stock : 0,
                    shortage: requiredQuantity - (inventoryItem ? inventoryItem.stock : 0)
                });
            }
        });

        return {
            canProduce: shortageList.length === 0,
            shortages: shortageList
        };
    }

    // 更新庫存（生產後扣除食材）
    updateInventoryAfterProduction(recipeId, productionQuantity) {
        const ingredients = this.recipeIngredients.filter(item => item.recipeId === recipeId);
        const updatedIngredients = [];

        ingredients.forEach(ingredient => {
            const inventoryItem = inventoryManager.inventoryData.find(item => 
                item.name === ingredient.ingredientName
            );
            
            if (inventoryItem) {
                const usedQuantity = ingredient.quantity * productionQuantity;
                inventoryItem.stock = Math.max(0, inventoryItem.stock - usedQuantity);
                updatedIngredients.push({
                    name: ingredient.ingredientName,
                    used: usedQuantity,
                    remaining: inventoryItem.stock
                });
            }
        });

        // 保存更新的庫存
        inventoryManager.saveToStorage();
        return updatedIngredients;
    }

    // 獲取配方詳情
    getRecipeDetails(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        const ingredients = this.recipeIngredients.filter(item => item.recipeId === recipeId);
        
        if (!recipe) return null;

        return {
            ...recipe,
            ingredients: ingredients,
            maxProduction: this.calculateMaxProduction(recipeId),
            profitMargin: ((recipe.unitCost - (recipe.totalMaterialCost / recipe.weight * 100)) / recipe.unitCost * 100).toFixed(2)
        };
    }

    // 獲取依賴特定食材的配方
    getRecipesByIngredient(ingredientName) {
        const relatedRecipeIds = [...new Set(
            this.recipeIngredients
                .filter(item => item.ingredientName === ingredientName)
                .map(item => item.recipeId)
        )];

        return relatedRecipeIds.map(id => this.recipes.find(r => r.id === id)).filter(Boolean);
    }

    // 獲取缺料風險警報
    getShortageAlerts() {
        const alerts = [];

        this.recipes.forEach(recipe => {
            const maxProduction = this.calculateMaxProduction(recipe.id);
            if (maxProduction === 0 && recipe.currentStock < recipe.safetyStock) {
                alerts.push({
                    recipeId: recipe.id,
                    recipeName: recipe.name,
                    alertType: 'production_impossible',
                    message: `${recipe.name} 無法生產 - 食材不足`
                });
            } else if (maxProduction < 5) {
                alerts.push({
                    recipeId: recipe.id,
                    recipeName: recipe.name,
                    alertType: 'low_production_capacity',
                    message: `${recipe.name} 生產能力不足 - 僅可製作 ${maxProduction} 份`
                });
            }
        });

        return alerts;
    }

    // 生成採購建議
    generatePurchaseSuggestions() {
        const suggestions = [];
        const ingredientUsage = new Map();

        // 計算各食材的總需求量
        this.recipes.forEach(recipe => {
            if (recipe.maxProduction < 10) { // 如果可製作份數少於10份，建議補貨
                const ingredients = this.recipeIngredients.filter(item => item.recipeId === recipe.id);
                ingredients.forEach(ingredient => {
                    const currentUsage = ingredientUsage.get(ingredient.ingredientName) || 0;
                    // 建議補足到可製作20份的量
                    const suggestedQuantity = ingredient.quantity * 20;
                    ingredientUsage.set(ingredient.ingredientName, Math.max(currentUsage, suggestedQuantity));
                });
            }
        });

        // 轉換為採購建議
        ingredientUsage.forEach((suggestedQuantity, ingredientName) => {
            const inventoryItem = inventoryManager.inventoryData.find(item => item.name === ingredientName);
            if (inventoryItem && inventoryItem.stock < suggestedQuantity) {
                suggestions.push({
                    ingredientName: ingredientName,
                    currentStock: inventoryItem.stock,
                    suggestedQuantity: suggestedQuantity - inventoryItem.stock,
                    supplier: inventoryItem.supplier,
                    estimatedCost: (suggestedQuantity - inventoryItem.stock) * inventoryItem.unitCost,
                    priority: inventoryItem.stock === 0 ? 'high' : 'medium'
                });
            }
        });

        return suggestions.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            return b.estimatedCost - a.estimatedCost;
        });
    }

    // 保存到localStorage
    saveToStorage() {
        localStorage.setItem('tanawat_recipes', JSON.stringify(this.recipes));
        localStorage.setItem('tanawat_recipe_ingredients', JSON.stringify(this.recipeIngredients));
    }

    // 從localStorage載入
    loadFromStorage() {
        const storedRecipes = localStorage.getItem('tanawat_recipes');
        const storedIngredients = localStorage.getItem('tanawat_recipe_ingredients');
        
        if (storedRecipes) {
            this.recipes = JSON.parse(storedRecipes);
        }
        if (storedIngredients) {
            this.recipeIngredients = JSON.parse(storedIngredients);
        }
    }
}

// 初始化配方管理系統
let recipeManager;
document.addEventListener('DOMContentLoaded', () => {
    // 確保在庫存管理系統初始化後才初始化配方管理
    setTimeout(() => {
        recipeManager = new RecipeManager();
    }, 1000);
});
