/**
 * 配方管理 Notion API 整合系統
 * 處理半成品配方和組成項目的完整資料載入
 */

class RecipeNotionManager {
    constructor() {
        this.baseUrl = "/.netlify/functions/notion-api/databases';
        this.recipesDbId = '237fd5adc30b80c09b59c03cd67c6432'; // 半成品資料庫
        this.ingredientsDbId = '237fd5adc30b80f7aedfe94804d80218'; // 半成品組成項目資料庫
        
        this.recipesData = [];
        this.ingredientsData = [];
        this.isDataLoaded = false;
        this.loadingProgress = {
            recipes: 0,
            ingredients: 0,
            total: 0
        };
    }

    /**
     * 載入指定資料庫的所有資料（支援分頁）
     */
    async loadDatabaseData(databaseId, databaseName = '') {
        console.log(`🔄 開始載入 ${databaseName} 資料庫...`);
        
        let allResults = [];
        let hasMore = true;
        let startCursor = null;
        let pageCount = 0;
        
        try {
            while (hasMore) {
                pageCount++;
                console.log(`📄 載入 ${databaseName} 第 ${pageCount} 頁...`);
                
                const requestBody = {
                    page_size: 100
                };
                
                // 只有當 startCursor 不為空時才添加到請求中
                if (startCursor) {
                    requestBody.start_cursor = startCursor;
                }
                
                const response = await fetch(`${this.baseUrl}/${databaseId}/query?t=${Date.now()}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const pageData = await response.json();
                allResults = allResults.concat(pageData.results);
                hasMore = pageData.has_more;
                startCursor = pageData.next_cursor;
                
                console.log(`✅ ${databaseName} 第 ${pageCount} 頁載入完成，累計 ${allResults.length} 項`);
                
                // 更新載入進度
                if (databaseName.includes('半成品')) {
                    this.loadingProgress.recipes = allResults.length;
                } else if (databaseName.includes('組成')) {
                    this.loadingProgress.ingredients = allResults.length;
                }
                this.loadingProgress.total = this.loadingProgress.recipes + this.loadingProgress.ingredients;
                
                // 觸發進度更新事件
                this.onProgressUpdate?.(this.loadingProgress);
            }
            
            console.log(`🎉 ${databaseName} 資料載入完成，總計 ${allResults.length} 項`);
            return allResults;
            
        } catch (error) {
            console.error(`❌ 載入 ${databaseName} 失敗:`, error);
            throw error;
        }
    }

    /**
     * 載入半成品配方資料
     */
    async loadRecipes() {
        const rawData = await this.loadDatabaseData(this.recipesDbId, '半成品配方資料庫');
        
        this.recipesData = rawData.map((item, index) => {
            const properties = item.properties;
            
            return {
                id: item.id,
                name: properties['名稱']?.title?.[0]?.plain_text || `配方-${index + 1}`,
                weight: properties['重量']?.rollup?.number || 0,
                totalCost: properties['總物料成本']?.rollup?.number || 0,
                unitCost: properties['元/100g']?.formula?.number || 0,
                currentStock: properties['實際庫存量']?.number || 0,
                dynamicStock: properties['動態庫存量']?.formula?.number || 0,
                safetyStock: properties['安全庫存量']?.number || 0,
                maxProduction: properties['總可製作份數']?.rollup?.number || 0,
                maxProductionWeight: properties['可製作半成品重量']?.formula?.number || 0,
                ingredientCost: properties['食材單位成本']?.formula?.number || 0,
                recipeComponents: properties['食譜組成']?.relation || [],
                category: this.extractCategoryFromName(properties['名稱']?.title?.[0]?.plain_text || ''),
                status: this.calculateRecipeStatus(
                    properties['總可製作份數']?.rollup?.number || 0,
                    properties['實際庫存量']?.number || 0
                ),
                lastUpdated: item.last_edited_time
            };
        });
        
        console.log(`✅ 半成品配方處理完成: ${this.recipesData.length} 項配方`);
        return this.recipesData;
    }

    /**
     * 載入半成品組成項目資料
     */
    async loadIngredients() {
        const rawData = await this.loadDatabaseData(this.ingredientsDbId, '半成品組成項目資料庫');
        
        this.ingredientsData = rawData.map((item, index) => {
            const properties = item.properties;
            
            return {
                id: item.id,
                name: properties['項目名稱']?.title?.[0]?.plain_text || `組成項目-${index + 1}`,
                recipeRelation: properties['食譜/菜單資料庫']?.relation || [],
                ingredientRelation: properties['食材資料庫管理 (Ingredient Database)']?.relation || [],
                usageAmount: properties['使用數量(克)']?.number || 0,
                itemCost: properties['項目成本']?.formula?.number || 0,
                ingredientUnitCost: properties['食材單位成本']?.rollup?.number || 0,
                ingredientStock: properties['食材庫存量']?.rollup?.number || 0,
                maxProduciblePieces: properties['單項可製作份數']?.formula?.number || 0,
                lastUpdated: item.last_edited_time
            };
        });
        
        console.log(`✅ 半成品組成項目處理完成: ${this.ingredientsData.length} 項組成項目`);
        return this.ingredientsData;
    }

    /**
     * 載入所有配方相關資料
     */
    async loadAllData() {
        try {
            console.log('🚀 開始載入配方管理系統資料...');
            this.isDataLoaded = false;
            
            // 並行載入兩個資料庫
            const [recipes, ingredients] = await Promise.all([
                this.loadRecipes(),
                this.loadIngredients()
            ]);
            
            // 建立配方與組成項目的關聯
            this.linkRecipesWithIngredients();
            
            this.isDataLoaded = true;
            console.log('🎉 配方管理系統資料載入完成！');
            console.log(`📊 統計: ${recipes.length} 項配方, ${ingredients.length} 項組成項目`);
            
            return {
                recipes: this.recipesData,
                ingredients: this.ingredientsData,
                summary: {
                    totalRecipes: recipes.length,
                    totalIngredients: ingredients.length,
                    producibleRecipes: this.getProducibleRecipes().length,
                    shortageRecipes: this.getShortageRecipes().length,
                    averageCost: this.calculateAverageCost()
                }
            };
            
        } catch (error) {
            console.error('❌ 配方資料載入失敗:', error);
            this.isDataLoaded = false;
            throw error;
        }
    }

    /**
     * 建立配方與組成項目的關聯
     */
    linkRecipesWithIngredients() {
        console.log('🔗 建立配方與組成項目關聯...');
        
        this.recipesData.forEach(recipe => {
            // 根據關聯ID找到對應的組成項目
            recipe.ingredients = this.ingredientsData.filter(ingredient => 
                ingredient.recipeRelation.some(relation => relation.id === recipe.id)
            );
            
            // 計算總重量（如果沒有的話）
            if (!recipe.weight && recipe.ingredients.length > 0) {
                recipe.weight = recipe.ingredients.reduce((sum, ing) => sum + (ing.usageAmount || 0), 0);
            }
        });
        
        console.log('✅ 配方關聯建立完成');
    }

    /**
     * 從配方名稱提取分類
     */
    extractCategoryFromName(name) {
        if (!name) return '其他';
        
        const categoryMap = {
            '醬': '醬料',
            '湯': '湯品', 
            '飯': '主菜',
            '麵': '主菜',
            '粉': '主菜',
            '炒': '主菜',
            '煮': '主菜',
            '燉': '主菜',
            '烤': '主菜',
            '炸': '主菜',
            '蒸': '主菜',
            '沙拉': '配菜',
            '涼拌': '配菜',
            '小菜': '配菜',
            '調料': '調料',
            '香料': '調料'
        };
        
        for (const [keyword, category] of Object.entries(categoryMap)) {
            if (name.includes(keyword)) {
                return category;
            }
        }
        
        return '其他';
    }

    /**
     * 計算配方狀態
     */
    calculateRecipeStatus(maxProduction, currentStock) {
        if (maxProduction === 0) return 'unavailable';
        if (currentStock === 0) return 'out-of-stock';
        if (maxProduction < 5) return 'low-stock';
        return 'available';
    }

    /**
     * 獲取可生產的配方
     */
    getProducibleRecipes() {
        return this.recipesData.filter(recipe => 
            recipe.status === 'available' && recipe.maxProduction > 0
        );
    }

    /**
     * 獲取缺料的配方
     */
    getShortageRecipes() {
        return this.recipesData.filter(recipe => 
            recipe.status === 'unavailable' || recipe.maxProduction === 0
        );
    }

    /**
     * 計算平均成本
     */
    calculateAverageCost() {
        if (this.recipesData.length === 0) return 0;
        
        const totalCost = this.recipesData.reduce((sum, recipe) => sum + (recipe.unitCost || 0), 0);
        return (totalCost / this.recipesData.length).toFixed(2);
    }

    /**
     * 搜尋配方
     */
    searchRecipes(query, category = '', status = '') {
        let filtered = this.recipesData;
        
        if (query) {
            filtered = filtered.filter(recipe => 
                recipe.name.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        if (category) {
            filtered = filtered.filter(recipe => recipe.category === category);
        }
        
        if (status) {
            const statusMap = {
                '可生產': 'available',
                '缺料': 'unavailable',
                '低庫存': 'low-stock'
            };
            filtered = filtered.filter(recipe => recipe.status === statusMap[status]);
        }
        
        return filtered;
    }

    /**
     * 生產能力計算
     */
    calculateProductionCapacity(recipeId, desiredQuantity) {
        const recipe = this.recipesData.find(r => r.id === recipeId);
        if (!recipe) return null;
        
        const results = {
            recipe: recipe,
            desiredQuantity: desiredQuantity,
            maxPossible: recipe.maxProduction,
            isPossible: desiredQuantity <= recipe.maxProduction,
            shortageItems: [],
            totalCost: (recipe.unitCost * desiredQuantity * recipe.weight / 100).toFixed(2)
        };
        
        // 檢查每個組成項目的庫存
        recipe.ingredients?.forEach(ingredient => {
            const neededAmount = ingredient.usageAmount * desiredQuantity;
            const availableAmount = ingredient.ingredientStock || 0;
            
            if (neededAmount > availableAmount) {
                results.shortageItems.push({
                    name: ingredient.name,
                    needed: neededAmount,
                    available: availableAmount,
                    shortage: neededAmount - availableAmount
                });
            }
        });
        
        return results;
    }

    /**
     * 生成採購建議
     */
    generatePurchaseSuggestions() {
        const suggestions = [];
        
        // 分析所有缺料配方
        const shortageRecipes = this.getShortageRecipes();
        const ingredientNeeds = new Map();
        
        shortageRecipes.forEach(recipe => {
            recipe.ingredients?.forEach(ingredient => {
                const neededAmount = ingredient.usageAmount;
                const currentAmount = ingredient.ingredientStock || 0;
                const shortage = Math.max(0, neededAmount - currentAmount);
                
                if (shortage > 0) {
                    const existing = ingredientNeeds.get(ingredient.name) || 0;
                    ingredientNeeds.set(ingredient.name, existing + shortage);
                }
            });
        });
        
        // 轉換為採購建議
        ingredientNeeds.forEach((amount, name) => {
            suggestions.push({
                ingredient: name,
                recommendedAmount: Math.ceil(amount * 1.2), // 多買20%作為安全庫存
                urgency: amount > 100 ? 'high' : amount > 50 ? 'medium' : 'low',
                affectedRecipes: shortageRecipes.filter(recipe => 
                    recipe.ingredients?.some(ing => ing.name === name)
                ).length
            });
        });
        
        return suggestions.sort((a, b) => {
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        });
    }

    /**
     * 重新整理資料
     */
    async refreshData() {
        console.log('🔄 重新整理配方資料...');
        return await this.loadAllData();
    }

    /**
     * 設定進度更新回調
     */
    setProgressCallback(callback) {
        this.onProgressUpdate = callback;
    }
}

// 全域實例
window.RecipeNotionManager = RecipeNotionManager;
