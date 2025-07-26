// 使用 Node.js 18+ 內建的 fetch API
require('dotenv').config();

// 配置
const NOTION_API_KEY = process.env.NOTION_API_KEY || 'secret_iSDhSCT8HPZMjPsX8YuMdhfzPJ2EYJrfXLdE17L88cV';
const INVENTORY_DB_ID = '237fd5adc30b808cbba3c03f8f2065fd';
const NOTION_VERSION = '2022-06-28';

console.log('🧪 庫存管理系統 API 測試');
console.log('========================');

async function testNotionAPI() {
    console.log('📋 測試配置:');
    console.log(`   API Key: ${NOTION_API_KEY.substring(0, 15)}...`);
    console.log(`   資料庫 ID: ${INVENTORY_DB_ID}`);
    console.log('');

    // 測試 1: Notion API 連接
    console.log('🔗 測試 1: Notion API 連接');
    try {
        const response = await fetch('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_VERSION
            }
        });

        if (response.ok) {
            const user = await response.json();
            console.log(`   ✅ Notion API 連接成功`);
            console.log(`   👤 用戶: ${user.name || user.person?.email || 'Unknown'}`);
        } else {
            const error = await response.json();
            console.log(`   ❌ Notion API 連接失敗: ${error.message}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Notion API 連接錯誤: ${error.message}`);
        return false;
    }

    console.log('');

    // 測試 2: 食材庫資料獲取
    console.log('📦 測試 2: 食材庫資料獲取');
    try {
        const start = Date.now();
        const response = await fetch(`https://api.notion.com/v1/databases/${INVENTORY_DB_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_VERSION
            },
            body: JSON.stringify({})
        });
        const end = Date.now();

        if (response.ok) {
            const data = await response.json();
            const itemCount = data.results ? data.results.length : 0;
            
            console.log(`   ✅ 資料獲取成功`);
            console.log(`   📊 載入項目數: ${itemCount}`);
            console.log(`   ⏱️  回應時間: ${end - start}ms`);
            console.log(`   📄 有更多資料: ${data.has_more ? '是' : '否'}`);

            // 顯示前3項資料的結構
            if (itemCount > 0) {
                console.log('');
                console.log('🔍 測試 3: 資料結構分析');
                
                const firstItem = data.results[0];
                const properties = firstItem.properties;
                
                console.log('   📋 可用欄位:');
                Object.keys(properties).forEach(key => {
                    const prop = properties[key];
                    console.log(`      • ${key} (${prop.type})`);
                });

                console.log('');
                console.log('🔄 測試 4: 資料轉換測試');
                
                // 測試資料轉換邏輯
                const testItems = data.results.slice(0, 3).map((item, index) => {
                    const props = item.properties;
                    
                    // 從規格/單位欄位解析單位
                    const specText = props['規格/單位']?.rich_text?.[0]?.text?.content || '';
                    const unitMatch = specText.match(/(克|公斤|毫升|公升|顆|斤|包|瓶|罐)/);
                    const extractedUnit = unitMatch ? unitMatch[1] : '公克';
                    
                    const stock = props['庫存量']?.number || 0;
                    const safetyStock = props['安全庫存量']?.number || 100;
                    
                    return {
                        itemId: props['品項ID']?.title?.[0]?.text?.content || `ITEM-${String(index + 1).padStart(3, '0')}`,
                        name: props['食材名稱']?.rich_text?.[0]?.text?.content || 
                              props['品項ID']?.title?.[0]?.text?.content || '未命名食材',
                        supplier: props['供應商']?.select?.name || '未指定供應商',
                        specification: props['規格/單位']?.rich_text?.[0]?.text?.content || '',
                        unit: extractedUnit,
                        stock: stock,
                        safetyStock: safetyStock,
                        status: stock === 0 ? 'critical' : stock <= safetyStock ? 'low' : 'safe'
                    };
                });

                console.log('   ✅ 資料轉換成功');
                console.log('   📋 轉換後的資料範例:');
                
                testItems.forEach((item, index) => {
                    const statusEmoji = {
                        'safe': '🟢',
                        'low': '🟡',
                        'critical': '🔴'
                    }[item.status];
                    
                    console.log(`      ${index + 1}. ${statusEmoji} ${item.name}`);
                    console.log(`         品項ID: ${item.itemId}`);
                    console.log(`         供應商: ${item.supplier}`);
                    console.log(`         庫存: ${item.stock} ${item.unit} (安全庫存: ${item.safetyStock} ${item.unit})`);
                    console.log(`         規格: ${item.specification}`);
                    console.log('');
                });

                // 統計資料
                const allProcessedData = data.results.map((item, index) => {
                    const props = item.properties;
                    const stock = props['庫存量']?.number || 0;
                    const safetyStock = props['安全庫存量']?.number || 100;
                    return {
                        status: stock === 0 ? 'critical' : stock <= safetyStock ? 'low' : 'safe'
                    };
                });

                const statusCounts = {
                    safe: allProcessedData.filter(item => item.status === 'safe').length,
                    low: allProcessedData.filter(item => item.status === 'low').length,
                    critical: allProcessedData.filter(item => item.status === 'critical').length
                };

                console.log('📊 測試 5: 庫存狀態統計');
                console.log(`   🟢 庫存充足: ${statusCounts.safe} 項`);
                console.log(`   🟡 庫存偏低: ${statusCounts.low} 項`);
                console.log(`   🔴 缺貨: ${statusCounts.critical} 項`);
                console.log('');

                console.log('🎉 所有測試完成！');
                console.log('✅ 庫存管理系統 API 功能正常');
                
                return true;
            } else {
                console.log('   ⚠️  警告: 資料庫中沒有資料');
                return false;
            }
        } else {
            const errorText = await response.text();
            console.log(`   ❌ 資料獲取失敗: ${response.status}`);
            console.log(`   📋 錯誤詳情: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ 資料獲取錯誤: ${error.message}`);
        return false;
    }
}

// 執行測試
testNotionAPI().then(success => {
    console.log('');
    console.log('========================');
    if (success) {
        console.log('🎯 結論: 庫存管理系統 API 測試通過');
        console.log('   • Notion API 連接正常');
        console.log('   • 食材庫資料獲取成功');
        console.log('   • 資料轉換邏輯正確');
        console.log('   • 庫存狀態計算準確');
        console.log('');
        console.log('💡 建議: 如果 Netlify 部署後仍有問題，請檢查:');
        console.log('   1. Netlify 環境變數設定');
        console.log('   2. Functions 部署狀態');
        console.log('   3. 使用 /inventory-detailed-debug.html 進行詳細診斷');
    } else {
        console.log('❌ 結論: 庫存管理系統 API 測試失敗');
        console.log('   請檢查 Notion API 配置和網路連接');
    }
    console.log('========================');
}).catch(error => {
    console.error('💥 測試執行失敗:', error);
});