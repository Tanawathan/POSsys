// menu-manager.js - 菜單管理系統
class MenuManager {
    constructor() {
        this.menuItems = [];
        this.menuComponents = [];
        this.categories = ['主餐', '小點', '前菜', '飲品', '甜點', '加點', '套餐升級', '兒童餐', '素食套餐', '寵物餐'];
        this.spiceLevels = ['不辣', '微辣', '小辣', '中辣', '大辣', '無辣度'];
        this.preparationMethods = ['炸', '炒', '煮', '烤', '冷盤', '甜點', '飲料', '套餐'];
        this.locations = ['廚房', '吧台'];
        
        // 初始化 Notion 管理器
        this.notionManager = new NotionDataManager();
        
        this.initializeMenuData();
        this.initializeMenuComponents();
    }

    // 從 Notion 載入菜單資料
    async loadMenuFromNotion() {
        try {
            console.log('從 Notion 載入菜單資料...');
            const menuData = await this.notionManager.queryDatabase('menu');
            
            this.menuItems = menuData.results.map(item => {
                const properties = item.properties;
                return {
                    id: item.id,
                    name: properties['名稱']?.title?.[0]?.text?.content || '未命名',
                    price: properties['價格']?.number || 0,
                    cost: properties['成本']?.number || 0,
                    category: properties['分類']?.select?.name || '其他',
                    description: properties['描述']?.rich_text?.[0]?.text?.content || '',
                    available: properties['供應狀態']?.checkbox !== false, // 預設為 true
                    spiceLevel: properties['辣度']?.select?.name || '不辣',
                    allergens: properties['過敏原']?.rich_text?.[0]?.text?.content || '',
                    preparationMethod: properties['製作方法']?.select?.name || '',
                    location: properties['製作地點']?.select?.name || '廚房',
                    stock: properties['庫存']?.number || 0,
                    recommended: properties['推薦']?.checkbox || false
                };
            });
            
            console.log('菜單資料載入完成:', this.menuItems);
            return this.menuItems;
        } catch (error) {
            console.error('從 Notion 載入菜單失敗:', error);
            // 如果 Notion 載入失敗，使用本地資料
            this.initializeMenuData();
            return this.menuItems;
        }
    }

    // 初始化菜單數據（備用/本地資料）
    initializeMenuData() {
        this.menuItems = [
            // 主餐類
            {
                id: 'M001',
                name: '秘傳炸翅',
                cost: 15.035332346439999,
                price: 100,
                stock: 16,
                category: '小點',
                available: true,
                allergens: '',
                recommended: true,
                description: '秘製醃料炸製雞翅，人氣不敗。',
                spiceLevel: '不辣',
                spiceOptions: ['不辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炸',
                location: '廚房',
                components: ['秘傳炸翅-雞翅', '秘傳炸翅-炸粉']
            },
            {
                id: 'M002',
                name: '椰奶仙草',
                cost: 5.05287625422,
                price: 30,
                stock: 0,
                category: '甜點',
                available: false,
                allergens: '',
                recommended: false,
                description: '椰奶仙草冰',
                spiceLevel: '',
                spiceOptions: [],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '甜點',
                location: '吧台',
                components: ['椰奶仙草-仙草凍', '椰奶仙草-椰奶糖漿', '椰奶仙草-煉乳', '椰奶仙草-奶水']
            },
            {
                id: 'M003',
                name: '冰淇淋',
                cost: 0,
                price: 30,
                stock: 2,
                category: '甜點',
                available: true,
                allergens: '',
                recommended: false,
                description: '巧克力冰淇淋',
                spiceLevel: '',
                spiceOptions: [],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '甜點',
                location: '吧台',
                components: ['冰淇淋-巧克力', '冰淇淋-餅乾']
            },
            {
                id: 'M004',
                name: '鮮蝦帕泰',
                cost: 97.22525044561499,
                price: 250,
                stock: 13,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: true,
                description: '新鮮白蝦與經典帕泰結合，口感鮮明。',
                spiceLevel: '不辣',
                spiceOptions: ['中辣', '大辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炒',
                location: '廚房',
                components: ['鮮蝦帕泰-蝦子', '鮮蝦帕泰-帕泰料', '鮮蝦帕泰-帕泰醬', '鮮蝦帕泰-配菜', '鮮蝦帕泰-花生粉', '鮮蝦帕泰-檸檬角']
            },
            {
                id: 'M005',
                name: '魚露炸腿飯',
                cost: 80.36970525137001,
                price: 250,
                stock: 21,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: true,
                description: '外酥內嫩的雞腿排，搭配魚露香氣與茉莉香米飯。',
                spiceLevel: '不辣',
                spiceOptions: ['小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炸',
                location: '廚房',
                components: ['魚露炸腿飯-去骨腿排', '魚露炸腿飯-炸粉', '魚露炸腿飯-生菜', '魚露炸腿飯-配菜', '魚露炸腿飯-米', '魚露炸腿飯-蛋', '魚露炸腿飯-醬']
            },
            {
                id: 'M006',
                name: '雞肉帕泰',
                cost: 57.745250445615,
                price: 190,
                stock: 13,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: false,
                description: '經典帕泰加入嫩雞肉，鹹甜爽口。',
                spiceLevel: '不辣',
                spiceOptions: ['中辣', '大辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炒',
                location: '廚房',
                components: ['雞肉帕泰-料', '雞肉帕泰-醬', '雞肉帕泰-雞肉', '雞肉帕泰-配菜', '雞肉帕泰-花生粉', '雞肉帕泰-檸檬角']
            },
            {
                id: 'M007',
                name: '綠咖哩雞飯',
                cost: 45.651296296245,
                price: 230,
                stock: 10,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: false,
                description: '椰奶綠咖哩與雞肉交織成溫潤辛香。',
                spiceLevel: '中辣',
                spiceOptions: ['中辣', '大辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '煮',
                location: '廚房',
                components: ['綠咖哩雞飯-醬', '綠咖哩雞飯-肉', '綠咖哩雞飯-配菜', '綠咖哩雞飯-米', '綠咖哩雞飯-蛋']
            },
            {
                id: 'M008',
                name: '紅咖哩牛飯',
                cost: 58.294281437145,
                price: 230,
                stock: 10,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: false,
                description: '濃郁紅咖哩配嫩牛肉，香辣濃厚。',
                spiceLevel: '小辣',
                spiceOptions: ['中辣', '大辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '煮',
                location: '廚房',
                components: ['紅咖哩牛飯-醬', '紅咖哩牛飯-肉', '紅咖哩牛飯-配菜', '紅咖哩牛飯-米', '紅咖哩牛飯-蛋']
            },
            {
                id: 'M009',
                name: '打拋雞飯',
                cost: 23.995516605154997,
                price: 220,
                stock: 20,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: false,
                description: '以雞肉製作的打拋風味，香辣開胃。',
                spiceLevel: '小辣',
                spiceOptions: ['中辣', '大辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炒',
                location: '廚房',
                components: ['打拋雞飯-醬', '打拋雞飯-米', '打拋雞飯-蛋', '打拋雞飯-配菜', '打拋雞飯-料']
            },
            {
                id: 'M010',
                name: '打拋豬飯',
                cost: 23.995516605154997,
                price: 220,
                stock: 20,
                category: '主餐',
                available: true,
                allergens: '',
                recommended: true,
                description: '經典打拋豬搭配泰式炸蛋與香米，鹹香夠味。',
                spiceLevel: '小辣',
                spiceOptions: ['中辣', '大辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炒',
                location: '廚房',
                components: ['打拋豬飯-醬', '打拋豬飯-米', '打拋豬飯-蛋', '打拋豬飯-配菜', '打拋豬飯-料', '打拋豬飯-肉']
            },
            // 新增飲品
            {
                id: 'M011',
                name: '椰香玉米沙拉',
                cost: 0,
                price: 120,
                stock: 0,
                category: '前菜',
                available: false,
                allergens: '',
                recommended: false,
                description: '以椰奶與香料拌合玉米粒，清爽香甜。',
                spiceLevel: '不辣',
                spiceOptions: [],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '冷盤',
                location: '廚房',
                components: []
            },
            {
                id: 'M012',
                name: 'Laab 肉末萵苣包',
                cost: 14.013478260880001,
                price: 120,
                stock: 6,
                category: '前菜',
                available: true,
                allergens: '',
                recommended: false,
                description: '以香料煮製的羊肉末，搭配生菜包裹食用。',
                spiceLevel: '微辣',
                spiceOptions: ['中辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '冷盤',
                location: '廚房',
                components: ['Laab羊-生菜', 'Laab羊-小番茄', 'Laab羊-料', 'Laab羊-粉']
            },
            {
                id: 'M013',
                name: '香茅翅小腿',
                cost: 12.69700693912,
                price: 100,
                stock: 40,
                category: '小點',
                available: true,
                allergens: '',
                recommended: false,
                description: '魚露醃製雞腿小翅，風味濃郁。',
                spiceLevel: '不辣',
                spiceOptions: ['不辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炸',
                location: '廚房',
                components: ['香茅翅小腿-翅小腿', '香茅翅小腿-炸粉']
            },
            {
                id: 'M014',
                name: '酸辣炸魚片',
                cost: 65.6897142857,
                price: 120,
                stock: 8,
                category: '小點',
                available: true,
                allergens: '',
                recommended: false,
                description: '炸白身魚搭配酸辣醬汁，外酥內嫩。',
                spiceLevel: '微辣',
                spiceOptions: ['中辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炸',
                location: '廚房',
                components: ['酸辣炸魚片-炸粉', '酸辣炸魚片-魚片', '酸辣炸魚片-生菜', '酸辣炸魚片-醬', '酸辣炸魚片-粉']
            },
            {
                id: 'M015',
                name: '打拋風味脆薯',
                cost: 28.729999999999997,
                price: 100,
                stock: 11,
                category: '小點',
                available: true,
                allergens: '',
                recommended: false,
                description: '厚切薯條拌打拋香料與辣粉，鹹香涮嘴。',
                spiceLevel: '不辣',
                spiceOptions: ['不辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炸',
                location: '廚房',
                components: ['打拋風味脆薯-薯條', '打拋風味脆薯-九層塔', '打拋風味脆薯-粉']
            },
            {
                id: 'M016',
                name: '蝦醬高麗菜',
                cost: 23.69827586205,
                price: 120,
                stock: 3,
                category: '小點',
                available: true,
                allergens: '',
                recommended: false,
                description: '蝦醬與時蔬大火快炒，鹹香下飯。今日提供：高麗菜、空心菜',
                spiceLevel: '小辣',
                spiceOptions: ['不辣', '中辣', '大辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炒',
                location: '廚房',
                components: ['蝦醬高麗菜-醬', '蝦醬高麗菜-菜']
            },
            {
                id: 'M017',
                name: '蝦醬空心菜',
                cost: 27.94827586205,
                price: 120,
                stock: 4,
                category: '小點',
                available: true,
                allergens: '',
                recommended: false,
                description: '蝦醬與時蔬大火快炒，鹹香下飯。今日提供：高麗菜、空心菜',
                spiceLevel: '小辣',
                spiceOptions: ['不辣', '中辣', '大辣', '小辣'],
                iceOptions: [],
                sweetnessOptions: [],
                preparationMethod: '炒',
                location: '廚房',
                components: ['蝦醬空心菜-醬', '蝦醬空心菜-菜']
            }
        ];
    }

    // 初始化菜單組成項目
    initializeMenuComponents() {
        this.menuComponents = [
            // 秘傳炸翅組件
            {
                id: 'MC001',
                menuItem: '秘傳炸翅',
                componentName: '秘傳炸翅-炸粉',
                recipe: '經典炸粉',
                recipeQuantity: 20,
                recipeStock: 3000,
                recipeUnitPrice: 0.0377,
                ingredient: '',
                ingredientQuantity: 0,
                ingredientStock: 0,
                ingredientUnitPrice: 0,
                totalPrice: 0.754,
                maxServings: 150
            },
            {
                id: 'MC002',
                menuItem: '秘傳炸翅',
                componentName: '秘傳炸翅-雞翅',
                recipe: '秘傳炸翅',
                recipeQuantity: 120,
                recipeStock: 2000,
                recipeUnitPrice: 0.119011102887,
                ingredient: '',
                ingredientQuantity: 0,
                ingredientStock: 0,
                ingredientUnitPrice: 0,
                totalPrice: 14.28133234644,
                maxServings: 16
            },
            // 椰奶仙草組件
            {
                id: 'MC003',
                menuItem: '椰奶仙草',
                componentName: '椰奶仙草-仙草凍',
                recipe: '仙草凍',
                recipeQuantity: 80,
                recipeStock: 1980,
                recipeUnitPrice: 0.00247826087,
                ingredient: '',
                ingredientQuantity: 0,
                ingredientStock: 0,
                ingredientUnitPrice: 0,
                totalPrice: 0.1982608696,
                maxServings: 24
            },
            {
                id: 'MC004',
                menuItem: '椰奶仙草',
                componentName: '椰奶仙草-椰奶糖漿',
                recipe: '椰奶糖漿',
                recipeQuantity: 20,
                recipeStock: 0,
                recipeUnitPrice: 0.151230769231,
                ingredient: '',
                ingredientQuantity: 0,
                ingredientStock: 0,
                ingredientUnitPrice: 0,
                totalPrice: 3.02461538462,
                maxServings: 0
            },
            {
                id: 'MC005',
                menuItem: '椰奶仙草',
                componentName: '椰奶仙草-煉乳',
                recipe: '',
                recipeQuantity: 0,
                recipeStock: 0,
                recipeUnitPrice: 0,
                ingredient: '煉乳',
                ingredientQuantity: 10,
                ingredientStock: 2000,
                ingredientUnitPrice: 0.09,
                totalPrice: 0.9,
                maxServings: 200
            },
            {
                id: 'MC006',
                menuItem: '椰奶仙草',
                componentName: '椰奶仙草-奶水',
                recipe: '',
                recipeQuantity: 0,
                recipeStock: 0,
                recipeUnitPrice: 0,
                ingredient: '奶水',
                ingredientQuantity: 10,
                ingredientStock: 2000,
                ingredientUnitPrice: 0.093,
                totalPrice: 0.93,
                maxServings: 200
            }
        ];
    }

    // 計算菜單項目的最大可製作份數
    calculateMaxServings(menuItemName) {
        const components = this.menuComponents.filter(component => 
            component.menuItem === menuItemName
        );

        if (components.length === 0) return 0;

        let minServings = Infinity;

        components.forEach(component => {
            let availableServings = 0;

            if (component.recipe && component.recipeStock > 0) {
                // 基於配方庫存計算
                availableServings = Math.floor(component.recipeStock / component.recipeQuantity);
            } else if (component.ingredient && component.ingredientStock > 0) {
                // 基於食材庫存計算
                availableServings = Math.floor(component.ingredientStock / component.ingredientQuantity);
            }

            minServings = Math.min(minServings, availableServings);
        });

        return minServings === Infinity ? 0 : minServings;
    }

    // 檢查菜單項目是否可供應
    checkAvailability(menuItemName) {
        const maxServings = this.calculateMaxServings(menuItemName);
        return maxServings > 0;
    }

    // 獲取不可供應的菜單項目
    getUnavailableItems() {
        return this.menuItems.filter(item => {
            const maxServings = this.calculateMaxServings(item.name);
            return maxServings === 0 || !item.available;
        });
    }

    // 獲取低庫存菜單項目（可製作份數少於5份）
    getLowStockItems() {
        return this.menuItems.filter(item => {
            const maxServings = this.calculateMaxServings(item.name);
            return maxServings > 0 && maxServings < 5;
        });
    }

    // 更新菜單項目庫存
    updateMenuStock(menuItemName, quantity) {
        const components = this.menuComponents.filter(component => 
            component.menuItem === menuItemName
        );

        components.forEach(component => {
            if (component.recipe && component.recipeStock > 0) {
                const requiredQuantity = component.recipeQuantity * quantity;
                component.recipeStock = Math.max(0, component.recipeStock - requiredQuantity);
            } else if (component.ingredient && component.ingredientStock > 0) {
                const requiredQuantity = component.ingredientQuantity * quantity;
                component.ingredientStock = Math.max(0, component.ingredientStock - requiredQuantity);
            }
        });

        // 更新菜單項目的庫存顯示
        const menuItem = this.menuItems.find(item => item.name === menuItemName);
        if (menuItem) {
            menuItem.stock = this.calculateMaxServings(menuItemName);
        }
    }

    // 計算菜單項目成本
    calculateMenuCost(menuItemName) {
        const components = this.menuComponents.filter(component => 
            component.menuItem === menuItemName
        );

        return components.reduce((total, component) => {
            return total + component.totalPrice;
        }, 0);
    }

    // 計算利潤率
    calculateProfitMargin(menuItemName) {
        const menuItem = this.menuItems.find(item => item.name === menuItemName);
        if (!menuItem) return 0;

        const cost = this.calculateMenuCost(menuItemName);
        const profit = menuItem.price - cost;
        return (profit / menuItem.price * 100).toFixed(2);
    }

    // 獲取按分類分組的菜單
    getMenuByCategory() {
        const grouped = {};
        this.categories.forEach(category => {
            grouped[category] = this.menuItems.filter(item => item.category === category);
        });
        return grouped;
    }

    // 獲取熱門推薦菜單
    getRecommendedItems() {
        return this.menuItems.filter(item => item.recommended);
    }

    // 搜尋菜單項目
    searchMenuItems(searchTerm) {
        if (!searchTerm) return this.menuItems;

        const term = searchTerm.toLowerCase();
        return this.menuItems.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
        );
    }

    // 獲取菜單統計
    getMenuStatistics() {
        const totalItems = this.menuItems.length;
        const availableItems = this.menuItems.filter(item => this.checkAvailability(item.name)).length;
        const unavailableItems = totalItems - availableItems;
        const lowStockItems = this.getLowStockItems().length;

        const totalRevenue = this.menuItems.reduce((sum, item) => sum + item.price, 0);
        const totalCost = this.menuItems.reduce((sum, item) => sum + this.calculateMenuCost(item.name), 0);
        const averagePrice = (totalRevenue / totalItems).toFixed(2);
        const averageCost = (totalCost / totalItems).toFixed(2);
        const averageMargin = ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2);

        return {
            totalItems,
            availableItems,
            unavailableItems,
            lowStockItems,
            averagePrice,
            averageCost,
            averageMargin,
            categoryBreakdown: this.getCategoryBreakdown()
        };
    }

    // 獲取分類統計
    getCategoryBreakdown() {
        const breakdown = {};
        this.categories.forEach(category => {
            const categoryItems = this.menuItems.filter(item => item.category === category);
            breakdown[category] = {
                count: categoryItems.length,
                available: categoryItems.filter(item => this.checkAvailability(item.name)).length,
                averagePrice: categoryItems.length > 0 ? 
                    (categoryItems.reduce((sum, item) => sum + item.price, 0) / categoryItems.length).toFixed(2) : 0
            };
        });
        return breakdown;
    }

    // 生成菜單缺料警報
    generateShortageAlerts() {
        const alerts = [];
        const unavailableItems = this.getUnavailableItems();
        const lowStockItems = this.getLowStockItems();

        unavailableItems.forEach(item => {
            alerts.push({
                type: 'unavailable',
                severity: 'high',
                menuItem: item.name,
                category: item.category,
                message: `${item.name} 無法供應`,
                maxServings: 0
            });
        });

        lowStockItems.forEach(item => {
            const maxServings = this.calculateMaxServings(item.name);
            alerts.push({
                type: 'low_stock',
                severity: 'medium',
                menuItem: item.name,
                category: item.category,
                message: `${item.name} 庫存不足，僅剩 ${maxServings} 份`,
                maxServings
            });
        });

        return alerts.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    // 獲取採購建議
    generatePurchaseSuggestions() {
        const suggestions = [];
        const unavailableItems = this.getUnavailableItems();
        const lowStockItems = this.getLowStockItems();

        [...unavailableItems, ...lowStockItems].forEach(item => {
            const components = this.menuComponents.filter(component => 
                component.menuItem === item.name
            );

            components.forEach(component => {
                if (component.recipeStock === 0 || component.ingredientStock === 0) {
                    suggestions.push({
                        menuItem: item.name,
                        component: component.componentName,
                        type: component.recipe ? 'recipe' : 'ingredient',
                        name: component.recipe || component.ingredient,
                        currentStock: component.recipeStock || component.ingredientStock,
                        suggestedQuantity: component.recipe ? 
                            Math.max(100, component.recipeQuantity * 10) : 
                            Math.max(100, component.ingredientQuantity * 10),
                        unitPrice: component.recipeUnitPrice || component.ingredientUnitPrice,
                        estimatedCost: (component.recipeUnitPrice || component.ingredientUnitPrice) * 
                            (component.recipe ? 
                                Math.max(100, component.recipeQuantity * 10) : 
                                Math.max(100, component.ingredientQuantity * 10))
                    });
                }
            });
        });

        // 去重複並合併相同項目
        const uniqueSuggestions = suggestions.reduce((acc, current) => {
            const existing = acc.find(item => item.name === current.name);
            if (existing) {
                existing.suggestedQuantity += current.suggestedQuantity;
                existing.estimatedCost += current.estimatedCost;
            } else {
                acc.push(current);
            }
            return acc;
        }, []);

        return uniqueSuggestions;
    }
}

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuManager;
}
