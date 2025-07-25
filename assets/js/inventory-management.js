// 庫存管理系統
class InventoryManager {
    constructor() {
        this.inventoryData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentEditingId = null;
        this.recipeManager = null; // 配方管理器引用
        
        this.initializeData();
        this.bindEvents();
        this.renderTable();
        this.updateStatistics();
        this.populateFilters();
    }

    // 設置配方管理器引用
    setRecipeManager(recipeManager) {
        this.recipeManager = recipeManager;
    }

    // 獲取特定食材的庫存
    getIngredientStock(ingredientName) {
        const item = this.inventoryData.find(item => item.name === ingredientName);
        return item ? item.stock : 0;
    }

    // 更新食材庫存
    updateIngredientStock(ingredientName, quantity) {
        const item = this.inventoryData.find(item => item.name === ingredientName);
        if (item) {
            item.stock = Math.max(0, item.stock - quantity);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // 檢查庫存是否充足
    checkStockAvailability(ingredientName, requiredQuantity) {
        const item = this.inventoryData.find(item => item.name === ingredientName);
        return item ? item.stock >= requiredQuantity : false;
    }

    // 獲取低庫存警報
    getLowStockAlerts() {
        return this.inventoryData.filter(item => 
            item.stock <= item.safetyStock
        );
    }

    // 獲取缺貨項目
    getOutOfStockItems() {
        return this.inventoryData.filter(item => item.stock === 0);
    }

    // 初始化真實食材資料
    initializeData() {
        // 從CSV資料轉換為庫存物件
        this.inventoryData = [
            // 全聯供應商
            { id: 'QL001', name: '雞蛋', supplier: '全聯', supplierCode: 'QL', spec: '30 顆', stock: 1000, safetyStock: 90, purchasePrice: 0.2, unitCost: 0.2, category: '蛋類', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: [] },
            { id: 'QL002', name: '豬絞肉', supplier: '全聯', supplierCode: 'QL', spec: '1 斤', stock: 3000, safetyStock: 200, purchasePrice: 0.333, unitCost: 0.333, category: '肉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: [] },
            { id: 'QL003', name: '牛柳', supplier: '全聯', supplierCode: 'QL', spec: '300 克', stock: 2000, safetyStock: 220, purchasePrice: 0.733, unitCost: 0.733, category: '肉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: [] },
            
            // 洋基供應商
            { id: 'YJ001', name: '魚露', supplier: '洋基', supplierCode: 'YJ', spec: '700 毫升', stock: 1000, safetyStock: 120, purchasePrice: 0.171, unitCost: 0.171, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['魚露炸腿', '青木瓜醬', '帕泰醬'] },
            { id: 'YJ002', name: '椰糖', supplier: '洋基', supplierCode: 'YJ', spec: '450 克', stock: 300, safetyStock: 130, purchasePrice: 0.289, unitCost: 0.289, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:25', recipeLinks: ['青木瓜醬', '帕泰醬'] },
            { id: 'YJ003', name: '萊姆汁', supplier: '洋基', supplierCode: 'YJ', spec: '946 毫升', stock: 400, safetyStock: 90, purchasePrice: 0.095, unitCost: 0.095, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['青木瓜醬', '帕泰醬'] },
            
            // 泓潔供應商
            { id: 'HJ001', name: '南薑', supplier: '泓潔', supplierCode: 'HJ', spec: '1 斤', stock: 0, safetyStock: 300, purchasePrice: 0.5, unitCost: 0.5, category: '香料', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: ['經典紅咖哩醬', '經典綠咖哩醬'] },
            { id: 'HJ002', name: '檸檬葉', supplier: '泓潔', supplierCode: 'HJ', spec: '1 斤', stock: 0, safetyStock: 300, purchasePrice: 0.5, unitCost: 0.5, category: '香料', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: ['經典紅咖哩醬', '經典綠咖哩醬'] },
            { id: 'HJ003', name: '牛肉粉', supplier: '泓潔', supplierCode: 'HJ', spec: '', stock: 0, safetyStock: 0, purchasePrice: 0, unitCost: 0, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: ['經典紅咖哩醬-牛肉粉'] },
            { id: 'HJ004', name: '香茅乾', supplier: '泓潔', supplierCode: 'HJ', spec: '100 克', stock: 100, safetyStock: 40, purchasePrice: 0.4, unitCost: 0.4, category: '香料', status: '未開始', lastPurchase: '2025年7月22日 下午9:31', recipeLinks: ['酸辣湯底', '鹽味翅小腿', '魚露炸腿'] },
            { id: 'HJ005', name: '檸檬葉乾', supplier: '泓潔', supplierCode: 'HJ', spec: '50 克', stock: 50, safetyStock: 45, purchasePrice: 0.9, unitCost: 0.9, category: '香料', status: '未開始', lastPurchase: '2025年7月24日 上午9:30', recipeLinks: ['酸辣湯底', '經典綠咖哩醬', '經典紅咖哩醬'] },
            
            // 好事多供應商
            { id: 'HSD001', name: '羊肉片', supplier: '好事多', supplierCode: 'HSD', spec: '1 斤', stock: 2000, safetyStock: 300, purchasePrice: 0.5, unitCost: 0.5, category: '肉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:25', recipeLinks: ['Laab羊'] },
            { id: 'HSD002', name: '小米辣', supplier: '好事多', supplierCode: 'HSD', spec: '1 斤', stock: 300, safetyStock: 150, purchasePrice: 0.25, unitCost: 0.25, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['青木瓜醬', '經典打拋醬', '經典紅咖哩醬'] },
            
            // 坎仔頂供應商
            { id: 'KZD001', name: '透抽', supplier: '坎仔頂', supplierCode: 'KZD', spec: '1 斤', stock: 0, safetyStock: 300, purchasePrice: 0.5, unitCost: 0.5, category: '海鮮', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: [] },
            { id: 'KZD002', name: '白蝦', supplier: '坎仔頂', supplierCode: 'KZD', spec: '800 克', stock: 2000, safetyStock: 320, purchasePrice: 0.4, unitCost: 0.4, category: '海鮮', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['剝殼白蝦'] },
            { id: 'CSS001', name: '鱸魚片', supplier: '坎仔頂', supplierCode: 'CSS', spec: '220 克', stock: 1650, safetyStock: 90, purchasePrice: 0.409, unitCost: 0.409, category: '海鮮', status: '未開始', lastPurchase: '2025年7月22日 下午7:25', recipeLinks: [] },
            
            // 佳良行供應商
            { id: 'JL001', name: '薑黃粉', supplier: '佳良行', supplierCode: 'JL', spec: '1 斤', stock: 0, safetyStock: 300, purchasePrice: 0.5, unitCost: 0.5, category: '香料', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: ['舒肥薑黃咖喱雞'] },
            { id: 'JL002', name: '椰漿粉', supplier: '佳良行', supplierCode: 'JL', spec: '1 公斤', stock: 0, safetyStock: 370, purchasePrice: 0.37, unitCost: 0.37, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午9:41', recipeLinks: ['經典紅咖哩醬', '舒肥薑黃咖喱雞', '椰奶糖漿'] },
            { id: 'JL003', name: '白砂糖', supplier: '佳良行', supplierCode: 'JL', spec: '1 斤', stock: 3000, safetyStock: 22, purchasePrice: 0.037, unitCost: 0.037, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:25', recipeLinks: ['經典打拋醬', '秘傳炸翅', '經典蝦醬'] },
            { id: 'JL004', name: '在來米粉', supplier: '佳良行', supplierCode: 'JL', spec: '600 克', stock: 600, safetyStock: 52, purchasePrice: 0.087, unitCost: 0.087, category: '粉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['經典炸粉'] },
            { id: 'JL005', name: '地瓜粉', supplier: '佳良行', supplierCode: 'JL', spec: '1 斤', stock: 1800, safetyStock: 35, purchasePrice: 0.058, unitCost: 0.058, category: '粉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['經典炸粉'] },
            { id: 'JL006', name: '白胡椒', supplier: '佳良行', supplierCode: 'JL', spec: '1 斤', stock: 50, safetyStock: 300, purchasePrice: 0.5, unitCost: 0.5, category: '香料', status: '未開始', lastPurchase: '2025年7月22日 下午9:43', recipeLinks: ['舒肥海南雞', '魚露炸腿', '秘傳炸翅'] },
            { id: 'JL007', name: '紅糖', supplier: '佳良行', supplierCode: 'JL', spec: '1 斤', stock: 1800, safetyStock: 20, purchasePrice: 0.033, unitCost: 0.033, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:25', recipeLinks: ['舒肥沙爹咖喱雞', '帕泰醬', '魚露炸腿'] },
            { id: 'JL008', name: '雞粉', supplier: '佳良行', supplierCode: 'JL', spec: '1 公斤', stock: 200, safetyStock: 250, purchasePrice: 0.25, unitCost: 0.25, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:26', recipeLinks: ['舒肥海南雞', '魚露炸腿', '秘傳炸翅'] },
            { id: 'JL009', name: '鹽', supplier: '佳良行', supplierCode: 'JL', spec: '30 公斤', stock: 0, safetyStock: 240, purchasePrice: 0.008, unitCost: 0.008, category: '調味料', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: ['舒肥海南雞', '茉莉豬頸肉', '炸春捲'] },
            { id: 'JL010', name: '耐炸油(大成)', supplier: '佳良行', supplierCode: 'JL', spec: '18 公斤', stock: 0, safetyStock: 765, purchasePrice: 0.043, unitCost: 0.043, category: '油類', status: '未開始', lastPurchase: '2025年7月22日 下午7:21', recipeLinks: [] },
            
            // 菜商
            { id: 'CS001', name: '空心菜', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 1000, safetyStock: 40, purchasePrice: 0.067, unitCost: 0.067, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: [], purchaseId: '空心菜', totalPurchase: 600 },
            { id: 'CS002', name: '豆干', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 800, safetyStock: 32, purchasePrice: 0.053, unitCost: 0.053, category: '豆製品', status: '未開始', lastPurchase: '2025年7月22日 下午7:24', recipeLinks: ['經典帕泰'] },
            { id: 'CS003', name: '花生仁', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 600, safetyStock: 130, purchasePrice: 0.217, unitCost: 0.217, category: '堅果', status: '未開始', lastPurchase: '2025年7月24日 上午10:55', recipeLinks: ['青木瓜醬', '花生粉'], purchaseId: '花生仁', totalPurchase: 600 },
            { id: 'CS004', name: '紅蔥頭', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 700, safetyStock: 100, purchasePrice: 0.167, unitCost: 0.167, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['舒肥沙爹咖喱雞', '魚露炸腿', '秘傳炸翅'], purchaseId: '紅蔥穗', totalPurchase: 600 },
            { id: 'CS005', name: '韭菜', supplier: '菜商', supplierCode: 'CS', spec: '0.5 斤', stock: 300, safetyStock: 20, purchasePrice: 0.067, unitCost: 0.067, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:55', recipeLinks: ['經典帕泰'], purchaseId: '韭菜', totalPurchase: 300 },
            { id: 'CS006', name: '大辣椒', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 600, safetyStock: 90, purchasePrice: 0.15, unitCost: 0.15, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:55', recipeLinks: ['青木瓜醬', '經典打拋醬', '酸辣湯底'], purchaseId: '大辣椒', totalPurchase: 600 },
            { id: 'CS007', name: '小黃瓜', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 675, safetyStock: 35, purchasePrice: 0.058, unitCost: 0.058, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['配菜組'], purchaseId: '小黃瓜', totalPurchase: 600 },
            { id: 'CS008', name: '蒜仁', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 600, safetyStock: 100, purchasePrice: 0.167, unitCost: 0.167, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月22日 下午7:25', recipeLinks: ['魚露炸腿', '青木瓜醬', '經典打拋醬'] },
            { id: 'CS009', name: '菜豆', supplier: '菜商', supplierCode: 'CS', spec: '2 斤', stock: 1200, safetyStock: 120, purchasePrice: 0.1, unitCost: 0.1, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:55', recipeLinks: ['青木瓜醬', '經典紅咖哩醬', '經典打拋醬'], purchaseId: '菜豆', totalPurchase: 1200 },
            { id: 'CS010', name: '高麗菜', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 900, safetyStock: 30, purchasePrice: 0.05, unitCost: 0.05, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: [], purchaseId: '高麗菜', totalPurchase: 700 },
            { id: 'CS011', name: '小番茄', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 800, safetyStock: 70, purchasePrice: 0.117, unitCost: 0.117, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['配菜組'], purchaseId: '小番茄', totalPurchase: 600 },
            { id: 'CS012', name: '豆芽菜', supplier: '菜商', supplierCode: 'CS', spec: '2 斤', stock: 1200, safetyStock: 24, purchasePrice: 0.02, unitCost: 0.02, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:55', recipeLinks: ['經典帕泰'], purchaseId: '豆芽菜', totalPurchase: 1200 },
            { id: 'CS013', name: '菜脯', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 600, safetyStock: 40, purchasePrice: 0.067, unitCost: 0.067, category: '醃製品', status: '未開始', lastPurchase: '2025年7月24日 上午10:55', recipeLinks: ['經典帕泰'], purchaseId: '菜脯', totalPurchase: 600 },
            { id: 'CS014', name: '洋蔥', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 1000, safetyStock: 30, purchasePrice: 0.05, unitCost: 0.05, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['經典紅咖哩醬', '酸辣湯底', '炸春捲'], purchaseId: '洋蔥', totalPurchase: 600 },
            { id: 'CS015', name: '檸檬', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 600, safetyStock: 65, purchasePrice: 0.108, unitCost: 0.108, category: '水果', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: [], purchaseId: '無子檸檬', totalPurchase: 600 },
            { id: 'CS016', name: '白花菜', supplier: '菜商', supplierCode: 'CS', spec: '2 斤', stock: 1200, safetyStock: 188, purchasePrice: 0.157, unitCost: 0.157, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['配菜組'], purchaseId: '白花菜', totalPurchase: 800 },
            { id: 'CS017', name: '青花菜', supplier: '菜商', supplierCode: 'CS', spec: '800 克', stock: 1200, safetyStock: 107, purchasePrice: 0.134, unitCost: 0.134, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['配菜組'], purchaseId: '青花菜', totalPurchase: 800 },
            { id: 'CS018', name: '糯米椒', supplier: '菜商', supplierCode: 'CS', spec: '1 斤', stock: 600, safetyStock: 0, purchasePrice: 0, unitCost: 0, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:56', recipeLinks: ['海鮮醬(綠)'], purchaseId: '糯米椒', totalPurchase: 600 },
            
            // 東莉供應商
            { id: 'DL001', name: '二節翅', supplier: '東莉', supplierCode: 'DL', spec: '6 公斤', stock: 6000, safetyStock: 650, purchasePrice: 0.108, unitCost: 0.108, category: '肉類', status: '未開始', lastPurchase: '2025年7月24日 上午10:46', recipeLinks: ['秘傳炸翅'], purchaseId: '二節翅', totalPurchase: 6000 },
            { id: 'DL002', name: '去骨腿排', supplier: '東莉', supplierCode: 'DL', spec: '12 公斤', stock: 0, safetyStock: 1770, purchasePrice: 0.148, unitCost: 0.148, category: '肉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:27', recipeLinks: ['魚露炸腿'] },
            { id: 'DL003', name: '翅小腿', supplier: '東莉', supplierCode: 'DL', spec: '6 公斤', stock: 0, safetyStock: 580, purchasePrice: 0.097, unitCost: 0.097, category: '肉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:26', recipeLinks: ['鹽味翅小腿'] },
            { id: 'DL004', name: '雞胸肉', supplier: '東莉', supplierCode: 'DL', spec: '6 公斤', stock: 6000, safetyStock: 850, purchasePrice: 0.142, unitCost: 0.142, category: '肉類', status: '未開始', lastPurchase: '2025年7月22日 下午7:26', recipeLinks: ['舒肥海南雞', '舒肥沙爹咖喱雞', '舒肥薑黃咖喱雞'] },
            { id: 'DL005', name: '玉米塊', supplier: '東莉', supplierCode: 'DL', spec: '3 公斤', stock: 6000, safetyStock: 230, purchasePrice: 0.077, unitCost: 0.077, category: '蔬菜', status: '未開始', lastPurchase: '2025年7月24日 上午10:54', recipeLinks: [], purchaseId: '玉米塊', totalPurchase: 3000 },
            { id: 'DL006', name: '雞塊', supplier: '東莉', supplierCode: 'DL', spec: '3 公斤', stock: 4500, safetyStock: 325, purchasePrice: 0.108, unitCost: 0.108, category: '肉類', status: '未開始', lastPurchase: '2025年7月24日 上午10:54', recipeLinks: [], purchaseId: '雞塊', totalPurchase: 3000 }
        ];

        // 保存到localStorage
        this.saveToStorage();
        this.filteredData = [...this.inventoryData];
    }

    // 綁定事件監聽器
    bindEvents() {
        // 搜尋功能
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterData();
        });

        // 篩選器
        document.getElementById('supplier-filter').addEventListener('change', () => this.filterData());
        document.getElementById('category-filter').addEventListener('change', () => this.filterData());
        document.getElementById('status-filter').addEventListener('change', () => this.filterData());

        // 分頁控制
        document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page').addEventListener('click', () => this.changePage(1));

        // Modal控制
        document.getElementById('add-item-btn').addEventListener('click', () => this.openModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('item-modal').addEventListener('click', (e) => {
            if (e.target.id === 'item-modal') this.closeModal();
        });

        // 表單提交
        document.getElementById('item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        // 全選功能
        document.getElementById('select-all').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });

        // 匯出功能
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
    }

    // 計算庫存狀態
    getStockStatus(item) {
        if (item.stock === 0 || item.stock < item.safetyStock * 0.5) {
            return 'critical';
        } else if (item.stock < item.safetyStock) {
            return 'low';
        } else {
            return 'safe';
        }
    }

    // 更新統計資料
    updateStatistics() {
        const stats = {
            total: this.inventoryData.length,
            safe: 0,
            low: 0,
            critical: 0
        };

        this.inventoryData.forEach(item => {
            const status = this.getStockStatus(item);
            stats[status]++;
        });

        document.getElementById('total-items').textContent = stats.total;
        document.getElementById('safe-stock').textContent = stats.safe;
        document.getElementById('low-stock').textContent = stats.low;
        document.getElementById('critical-stock').textContent = stats.critical;
    }

    // 填充篩選器選項
    populateFilters() {
        const suppliers = [...new Set(this.inventoryData.map(item => item.supplier))];
        const categories = [...new Set(this.inventoryData.map(item => item.category))];

        const supplierSelect = document.getElementById('supplier-filter');
        const categorySelect = document.getElementById('category-filter');

        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            supplierSelect.appendChild(option);
        });

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // 填充Modal中的供應商選項
        const modalSupplierSelect = document.getElementById('item-supplier');
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            modalSupplierSelect.appendChild(option);
        });
    }

    // 資料篩選
    filterData() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const supplierFilter = document.getElementById('supplier-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        this.filteredData = this.inventoryData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                                item.supplier.toLowerCase().includes(searchTerm) ||
                                item.spec.toLowerCase().includes(searchTerm);
            
            const matchesSupplier = !supplierFilter || item.supplier === supplierFilter;
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            
            let matchesStatus = true;
            if (statusFilter) {
                const status = this.getStockStatus(item);
                matchesStatus = status === statusFilter;
            }

            return matchesSearch && matchesSupplier && matchesCategory && matchesStatus;
        });

        this.currentPage = 1;
        this.renderTable();
    }

    // 渲染表格
    renderTable() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = '';

        pageData.forEach(item => {
            const status = this.getStockStatus(item);
            const statusConfig = {
                safe: { dot: 'status-safe', text: '安全庫存', class: 'text-green-600' },
                low: { dot: 'status-low', text: '庫存偏低', class: 'text-yellow-600' },
                critical: { dot: 'status-critical', text: '急需補貨', class: 'text-red-600' }
            };

            const stockValue = (item.stock * item.unitCost).toFixed(2);
            const recipeLinks = item.recipeLinks.slice(0, 2).join(', ') + 
                              (item.recipeLinks.length > 2 ? '...' : '');

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <input type="checkbox" class="rounded" data-id="${item.id}">
                </td>
                <td class="px-6 py-4">
                    <span class="status-dot ${statusConfig[status].dot}"></span>
                    <span class="${statusConfig[status].class} text-sm font-medium">
                        ${statusConfig[status].text}
                    </span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900">
                    ${item.name}
                    ${item.id ? `<br><span class="text-xs text-gray-500">${item.id}</span>` : ''}
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${item.supplier}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.spec}</td>
                <td class="px-6 py-4">
                    <span class="font-semibold ${status === 'critical' ? 'text-red-600' : status === 'low' ? 'text-yellow-600' : 'text-green-600'}">
                        ${item.stock.toLocaleString()}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.safetyStock.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-gray-900">$${item.unitCost.toFixed(3)}</td>
                <td class="px-6 py-4 font-medium text-gray-900">$${stockValue}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.lastPurchase}</td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="inventoryManager.editItem('${item.id}')" 
                                class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="inventoryManager.deleteItem('${item.id}')" 
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="inventoryManager.adjustStock('${item.id}')" 
                                class="text-green-600 hover:text-green-900" title="調整庫存">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updatePagination();
    }

    // 更新分頁資訊
    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length);

        document.getElementById('showing-start').textContent = startIndex + 1;
        document.getElementById('showing-end').textContent = endIndex;
        document.getElementById('total-count').textContent = this.filteredData.length;
        document.getElementById('page-info').textContent = `第 ${this.currentPage} 頁，共 ${totalPages} 頁`;

        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages;
    }

    // 切換頁面
    changePage(direction) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        this.currentPage = Math.max(1, Math.min(totalPages, this.currentPage + direction));
        this.renderTable();
    }

    // 開啟Modal
    openModal(item = null) {
        this.currentEditingId = item ? item.id : null;
        document.getElementById('modal-title').textContent = item ? '編輯品項' : '新增品項';
        
        if (item) {
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-supplier').value = item.supplier;
            document.getElementById('item-spec').value = item.spec;
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-stock').value = item.stock;
            document.getElementById('item-safety-stock').value = item.safetyStock;
            document.getElementById('item-purchase-price').value = item.purchasePrice;
            document.getElementById('item-unit-cost').value = item.unitCost;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-status').value = item.status;
        } else {
            document.getElementById('item-form').reset();
        }

        document.getElementById('item-modal').classList.remove('hidden');
    }

    // 關閉Modal
    closeModal() {
        document.getElementById('item-modal').classList.add('hidden');
        this.currentEditingId = null;
    }

    // 編輯品項
    editItem(id) {
        const item = this.inventoryData.find(item => item.id === id);
        if (item) {
            this.openModal(item);
        }
    }

    // 儲存品項
    saveItem() {
        const formData = {
            id: this.currentEditingId || 'NEW' + Date.now(),
            name: document.getElementById('item-name').value,
            supplier: document.getElementById('item-supplier').value,
            spec: document.getElementById('item-spec').value,
            stock: parseInt(document.getElementById('item-stock').value) || 0,
            safetyStock: parseInt(document.getElementById('item-safety-stock').value) || 0,
            purchasePrice: parseFloat(document.getElementById('item-purchase-price').value) || 0,
            unitCost: parseFloat(document.getElementById('item-unit-cost').value) || 0,
            category: document.getElementById('item-category').value,
            status: document.getElementById('item-status').value,
            lastPurchase: new Date().toLocaleDateString('zh-TW'),
            recipeLinks: []
        };

        // 從供應商名稱生成供應商代碼
        const supplierCodes = {
            '全聯': 'QL',
            '洋基': 'YJ',
            '泓潔': 'HJ',
            '好事多': 'HSD',
            '坎仔頂': 'KZD',
            '佳良行': 'JL',
            '菜商': 'CS',
            '東莉': 'DL',
            'Tanawat': 'TANA'
        };
        formData.supplierCode = supplierCodes[formData.supplier] || 'OTHER';

        if (this.currentEditingId) {
            // 更新現有品項
            const index = this.inventoryData.findIndex(item => item.id === this.currentEditingId);
            this.inventoryData[index] = formData;
        } else {
            // 新增品項
            this.inventoryData.push(formData);
        }

        this.saveToStorage();
        this.filterData();
        this.updateStatistics();
        this.closeModal();
        
        // 顯示成功訊息
        this.showNotification(this.currentEditingId ? '品項更新成功！' : '品項新增成功！', 'success');
    }

    // 刪除品項
    deleteItem(id) {
        if (confirm('確定要刪除這個品項嗎？')) {
            this.inventoryData = this.inventoryData.filter(item => item.id !== id);
            this.saveToStorage();
            this.filterData();
            this.updateStatistics();
            this.showNotification('品項刪除成功！', 'success');
        }
    }

    // 調整庫存
    adjustStock(id) {
        const item = this.inventoryData.find(item => item.id === id);
        if (item) {
            const newStock = prompt(`調整 ${item.name} 的庫存量：\n目前庫存：${item.stock}`, item.stock);
            if (newStock !== null && !isNaN(newStock)) {
                item.stock = parseInt(newStock);
                this.saveToStorage();
                this.renderTable();
                this.updateStatistics();
                this.showNotification(`${item.name} 庫存已調整為 ${newStock}`, 'success');
            }
        }
    }

    // 匯出資料
    exportData() {
        const selectedItems = document.querySelectorAll('tbody input[type="checkbox"]:checked');
        const dataToExport = selectedItems.length > 0 ? 
            Array.from(selectedItems).map(cb => this.inventoryData.find(item => item.id === cb.dataset.id)) :
            this.filteredData;

        const csv = this.convertToCSV(dataToExport);
        this.downloadCSV(csv, '庫存清單.csv');
    }

    // 轉換為CSV格式
    convertToCSV(data) {
        const headers = ['品項ID', '食材名稱', '供應商', '規格/單位', '庫存量', '安全庫存量', '進價', '單位成本', '品項類別', '狀態', '最後進貨日', '庫存狀態', '庫存價值'];
        const rows = data.map(item => [
            item.id,
            item.name,
            item.supplier,
            item.spec,
            item.stock,
            item.safetyStock,
            item.purchasePrice,
            item.unitCost,
            item.category,
            item.status,
            item.lastPurchase,
            this.getStockStatus(item),
            (item.stock * item.unitCost).toFixed(2)
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    // 下載CSV檔案
    downloadCSV(csv, filename) {
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // 儲存到localStorage
    saveToStorage() {
        localStorage.setItem('tanawat_inventory', JSON.stringify(this.inventoryData));
    }

    // 從localStorage載入
    loadFromStorage() {
        const stored = localStorage.getItem('tanawat_inventory');
        if (stored) {
            this.inventoryData = JSON.parse(stored);
            this.filteredData = [...this.inventoryData];
        }
    }
}

// 初始化庫存管理系統
let inventoryManager;
document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();
});
