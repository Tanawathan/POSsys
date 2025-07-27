/**
 * 🧪 Uber Eats API 測試腳本
 * 測試 API 連接、認證和基本功能
 */

// 引入必要的模組
const { UberEatsAPI, UberEatsWebhookHandler } = require('./uber-eats-integration');
require('dotenv').config({ path: '.env.local' });

// 測試配置
const TEST_CONFIG = {
    sandbox: {
        baseURL: 'https://api.uber.com/v2/eats',
        clientId: process.env.UBER_EATS_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
        clientSecret: process.env.UBER_EATS_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE'
    },
    storeId: process.env.UBER_EATS_STORE_ID || 'YOUR_STORE_ID_HERE'
};

class UberEatsAPITester {
    constructor() {
        this.api = new UberEatsAPI({
            sandbox: true,
            clientId: TEST_CONFIG.sandbox.clientId,
            clientSecret: TEST_CONFIG.sandbox.clientSecret,
            sandbox: {
                baseURL: 'https://api.uber.com/v2/eats'
            }
        });
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    /**
     * 執行所有測試
     */
    async runAllTests() {
        console.log('🧪 開始 Uber Eats API 測試...\n');
        
        try {
            await this.testAuthentication();
            await this.testStoreInfo();
            await this.testWebhookProcessing();
            await this.testOrderMapping();
            
            this.printResults();
        } catch (error) {
            console.error('❌ 測試執行失敗:', error);
        }
    }

    /**
     * 測試 OAuth 認證
     */
    async testAuthentication() {
        console.log('🔐 測試 1: OAuth 認證');
        
        try {
            const token = await this.api.authenticate();
            
            if (token) {
                this.recordTest('OAuth 認證', true, '成功取得 access token');
                console.log('✅ 認證成功');
            } else {
                this.recordTest('OAuth 認證', false, '無法取得 access token');
                console.log('❌ 認證失敗');
            }
        } catch (error) {
            this.recordTest('OAuth 認證', false, error.message);
            console.log('❌ 認證失敗:', error.message);
        }
        
        console.log('');
    }

    /**
     * 測試獲取餐廳資訊
     */
    async testStoreInfo() {
        console.log('🏪 測試 2: 獲取餐廳資訊');
        
        try {
            // 如果沒有 Store ID，跳過此測試
            if (!TEST_CONFIG.storeId || 
                TEST_CONFIG.storeId === 'YOUR_STORE_ID_HERE' || 
                TEST_CONFIG.storeId.includes('等待審核')) {
                this.recordTest('餐廳資訊', 'skipped', '尚未設定 Store ID');
                console.log('⏭️ 跳過 - 尚未設定 Store ID');
                console.log('');
                return;
            }

            const storeInfo = await this.api.getStoreInfo(TEST_CONFIG.storeId);
            
            if (storeInfo && storeInfo.id) {
                this.recordTest('餐廳資訊', true, `取得餐廳資訊: ${storeInfo.name}`);
                console.log('✅ 成功取得餐廳資訊');
                console.log(`   餐廳名稱: ${storeInfo.name}`);
                console.log(`   餐廳 ID: ${storeInfo.id}`);
            } else {
                this.recordTest('餐廳資訊', false, '無法取得餐廳資訊');
                console.log('❌ 無法取得餐廳資訊');
            }
        } catch (error) {
            this.recordTest('餐廳資訊', false, error.message);
            console.log('❌ 取得餐廳資訊失敗:', error.message);
        }
        
        console.log('');
    }

    /**
     * 測試 Webhook 處理
     */
    async testWebhookProcessing() {
        console.log('📨 測試 3: Webhook 處理');
        
        try {
            // 模擬 Webhook 資料
            const mockWebhookData = {
                event_type: 'orders.notification',
                data: {
                    id: 'test_order_123',
                    status: 'created',
                    total_amount: 2500, // 25.00 USD in cents
                    created_at: new Date().toISOString(),
                    customer: {
                        name: '測試客戶',
                        phone: '+886912345678'
                    },
                    items: [
                        {
                            name: '測試餐點',
                            quantity: 2,
                            price: 1000, // 10.00 USD in cents
                            special_instructions: '不要香菜'
                        },
                        {
                            name: '測試飲料',
                            quantity: 1,
                            price: 500 // 5.00 USD in cents
                        }
                    ],
                    special_instructions: '請快一點',
                    delivery_address: {
                        street1: '測試街道 123 號',
                        city: '台北市',
                        state: '台北市',
                        postal_code: '10001'
                    }
                }
            };

            // 測試訂單轉換
            const localOrder = this.api.convertUberOrderToLocal(mockWebhookData.data);
            
            if (localOrder && localOrder.id && localOrder.items.length > 0) {
                this.recordTest('Webhook 處理', true, '成功轉換 Uber 訂單為本地格式');
                console.log('✅ Webhook 處理成功');
                console.log(`   轉換後訂單 ID: ${localOrder.id}`);
                console.log(`   項目數量: ${localOrder.items.length}`);
                console.log(`   總金額: NT$${localOrder.properties['總金額'].number}`);
            } else {
                this.recordTest('Webhook 處理', false, '訂單轉換失敗');
                console.log('❌ Webhook 處理失敗');
            }
        } catch (error) {
            this.recordTest('Webhook 處理', false, error.message);
            console.log('❌ Webhook 處理失敗:', error.message);
        }
        
        console.log('');
    }

    /**
     * 測試狀態映射
     */
    async testOrderMapping() {
        console.log('🔄 測試 4: 訂單狀態映射');
        
        try {
            const statusMappings = [
                { uber: 'created', local: '待處理' },
                { uber: 'accepted', local: '製作中' },
                { uber: 'ready_for_pickup', local: '等待甜點' },
                { uber: 'picked_up', local: '等待結帳' },
                { uber: 'delivered', local: '結帳完成' },
                { uber: 'cancelled', local: '已取消' }
            ];

            let allMappingsCorrect = true;
            
            for (const mapping of statusMappings) {
                const mappedStatus = this.api.mapUberStatusToLocal(mapping.uber);
                if (mappedStatus !== mapping.local) {
                    allMappingsCorrect = false;
                    console.log(`❌ 狀態映射錯誤: ${mapping.uber} -> ${mappedStatus} (預期: ${mapping.local})`);
                }
            }

            if (allMappingsCorrect) {
                this.recordTest('狀態映射', true, '所有狀態映射正確');
                console.log('✅ 所有狀態映射正確');
                statusMappings.forEach(mapping => {
                    console.log(`   ${mapping.uber} -> ${mapping.local}`);
                });
            } else {
                this.recordTest('狀態映射', false, '部分狀態映射錯誤');
            }
        } catch (error) {
            this.recordTest('狀態映射', false, error.message);
            console.log('❌ 狀態映射測試失敗:', error.message);
        }
        
        console.log('');
    }

    /**
     * 記錄測試結果
     */
    recordTest(testName, passed, message) {
        this.results.tests.push({
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });

        if (passed === true) {
            this.results.passed++;
        } else if (passed === false) {
            this.results.failed++;
        }
        // skipped 測試不計入通過或失敗
    }

    /**
     * 列印測試結果
     */
    printResults() {
        console.log('📊 測試結果摘要');
        console.log('='.repeat(50));
        console.log(`✅ 通過: ${this.results.passed}`);
        console.log(`❌ 失敗: ${this.results.failed}`);
        console.log(`⏭️ 跳過: ${this.results.tests.filter(t => t.passed === 'skipped').length}`);
        console.log(`📝 總計: ${this.results.tests.length}`);
        console.log('');

        if (this.results.failed > 0) {
            console.log('❌ 失敗的測試:');
            this.results.tests
                .filter(test => test.passed === false)
                .forEach(test => {
                    console.log(`   - ${test.name}: ${test.message}`);
                });
            console.log('');
        }

        if (this.results.passed === this.results.tests.filter(t => t.passed !== 'skipped').length) {
            console.log('🎉 所有測試通過！API 整合準備就緒。');
        } else {
            console.log('⚠️ 部分測試失敗，請檢查設定和網路連線。');
        }
    }
}

/**
 * 網路連線測試
 */
async function testNetworkConnectivity() {
    console.log('🌐 測試網路連線...');
    
    try {
        const response = await fetch('https://api.uber.com/v2/eats', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            console.log('✅ 網路連線正常 (API 端點可達，返回認證錯誤是正常的)');
            return true;
        } else {
            console.log(`✅ 網路連線正常 (狀態碼: ${response.status})`);
            return true;
        }
    } catch (error) {
        console.log('❌ 網路連線失敗:', error.message);
        return false;
    }
}

/**
 * 主測試函數
 */
async function runTests() {
    console.log('🚀 Uber Eats API 整合測試');
    console.log('='.repeat(50));
    console.log(`測試時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log('');

    // 網路連線測試
    const networkOk = await testNetworkConnectivity();
    console.log('');

    if (!networkOk) {
        console.log('❌ 網路連線失敗，無法進行 API 測試');
        return;
    }

    // API 功能測試
    const tester = new UberEatsAPITester();
    await tester.runAllTests();
}

// 如果直接執行此文件，運行測試
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    UberEatsAPITester,
    runTests,
    testNetworkConnectivity
};
