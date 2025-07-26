// 測試 F4 桌現有訂單載入功能
async function testF4OrderLoading() {
    console.log('🧪 測試 F4 桌現有訂單載入功能...');
    
    try {
        console.log('\n📋 1. 載入進行中的訂單...');
        const response = await fetch('http://localhost:3000/api/notion/databases/23afd5adc30b80c39e71d1a640ccfb5d/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_size: 100,
                sorts: [
                    {
                        property: '建立時間',
                        direction: 'descending'
                    }
                ],
                filter: {
                    and: [
                        {
                            property: '狀態',
                            select: {
                                does_not_equal: '已完成'
                            }
                        },
                        {
                            property: '狀態',
                            select: {
                                does_not_equal: '已取消'
                            }
                        }
                    ]
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP錯誤: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ 找到 ${data.results?.length || 0} 個進行中的訂單`);
        
        if (!data.results || data.results.length === 0) {
            console.log('❌ 沒有找到任何進行中的訂單');
            return;
        }
        
        console.log('\n📋 2. 檢查 F4 桌的訂單...');
        const tableNumber = '4'; // 測試桌號 4 和 F4
        
        const tableOrders = data.results.filter(orderRecord => {
            const orderTableNumber = orderRecord.properties?.['桌號']?.number;
            const orderTableText = orderRecord.properties?.['桌號']?.rich_text?.[0]?.text?.content;
            
            console.log(`   檢查訂單: 桌號數字=${orderTableNumber}, 桌號文字=${orderTableText}`);
            
            // 智慧比對桌號
            if (orderTableNumber && orderTableNumber.toString() === tableNumber.toString()) {
                console.log(`   ✅ 數字桌號匹配: ${orderTableNumber} === ${tableNumber}`);
                return true;
            }
            if (orderTableText && (
                orderTableText === tableNumber ||
                orderTableText.includes(tableNumber) ||
                tableNumber.includes(orderTableText)
            )) {
                console.log(`   ✅ 文字桌號匹配: ${orderTableText} 與 ${tableNumber}`);
                return true;
            }
            return false;
        });
        
        console.log(`🎯 找到 ${tableOrders.length} 個屬於桌號 ${tableNumber} 的訂單`);
        
        if (tableOrders.length === 0) {
            console.log('❌ F4 桌沒有找到任何訂單');
            return;
        }
        
        console.log('\n📋 3. 解析訂單項目...');
        let existingItems = [];
        
        tableOrders.forEach((orderRecord, index) => {
            const orderNumber = orderRecord.properties['訂單編號']?.title?.[0]?.text?.content || '未知';
            const itemsText = orderRecord.properties['訂單項目']?.rich_text?.[0]?.text?.content;
            
            console.log(`\n   訂單 ${index + 1}: ${orderNumber}`);
            console.log(`   項目內容: ${itemsText}`);
            
            if (itemsText) {
                try {
                    // 嘗試解析 JSON 格式
                    if (itemsText.startsWith('{') || itemsText.startsWith('[')) {
                        console.log('   📝 嘗試解析 JSON 格式...');
                        const itemsData = JSON.parse(itemsText);
                        if (itemsData.items && Array.isArray(itemsData.items)) {
                            console.log(`   ✅ JSON 格式解析成功，找到 ${itemsData.items.length} 個項目`);
                            existingItems.push(...itemsData.items);
                        }
                    } else {
                        console.log('   📝 嘗試解析文字格式...');
                        // 解析文字格式的項目 (例如: "酸辣炸魚片 x1 - NT$120\n打拋風味脆薯 x1 - NT$100")
                        const lines = itemsText.split('\n').filter(line => line.trim());
                        console.log(`   📄 找到 ${lines.length} 行項目`);
                        
                        lines.forEach(line => {
                            console.log(`   處理行: "${line}"`);
                            const match = line.match(/^(.+?)\s+x(\d+)\s+-\s+NT\$(\d+)/);
                            if (match) {
                                const [, name, qty, price] = match;
                                const item = {
                                    name: name.trim(),
                                    quantity: parseInt(qty),
                                    price: parseInt(price)
                                };
                                console.log(`   ✅ 解析成功:`, item);
                                existingItems.push(item);
                            } else {
                                console.log(`   ⚠️ 無法解析行: ${line}`);
                            }
                        });
                    }
                } catch (e) {
                    console.warn('   ❌ 解析失敗:', e.message);
                }
            } else {
                console.log('   ⚠️ 訂單項目為空');
            }
        });
        
        console.log(`\n📊 4. 解析結果:`);
        console.log(`   總項目數: ${existingItems.length}`);
        existingItems.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.name} x${item.quantity} - NT$${item.price}`);
        });
        
        if (existingItems.length > 0) {
            console.log('\n✅ 測試成功！F4 桌的現有訂單可以正確載入');
            
            // 計算總金額
            const totalAmount = existingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            console.log(`💰 總金額: NT$${totalAmount}`);
            
        } else {
            console.log('\n❌ 測試失敗！無法解析到任何訂單項目');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

// 執行測試
testF4OrderLoading();
