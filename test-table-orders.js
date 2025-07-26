// 測試桌號訂單檢查功能
async function testTableOrdersFeature() {
    console.log('🧪 測試桌號訂單檢查功能...');
    
    try {
        // 測試載入所有現有訂單
        console.log('\n📋 1. 測試載入所有現有訂單...');
        const response = await fetch('/.netlify/functions/notion-api/databases/23afd5adc30b80c39e71d1a640ccfb5d/query', {
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
        console.log(`✅ 載入了 ${data.results?.length || 0} 個進行中的訂單`);
        
        // 分析每個訂單
        const ordersByTable = {};
        
        data.results?.forEach(order => {
            const orderNumber = order.properties['訂單編號']?.title?.[0]?.text?.content || '未知';
            const tableNumber = order.properties['桌號']?.number;
            const tableText = order.properties['桌號']?.rich_text?.[0]?.text?.content;
            const status = order.properties['狀態']?.select?.name || '未知';
            const amount = order.properties['總金額']?.number || 0;
            const items = order.properties['訂單項目']?.rich_text?.[0]?.text?.content || '無項目';
            
            console.log(`\n📄 訂單: ${orderNumber}`);
            console.log(`   🏪 桌號: ${tableNumber} ${tableText ? `(${tableText})` : ''}`);
            console.log(`   📊 狀態: ${status}`);
            console.log(`   💰 金額: NT$${amount}`);
            console.log(`   🍽️ 項目: ${items.length > 100 ? items.substring(0, 100) + '...' : items}`);
            
            // 統計每桌的訂單
            const tableKey = tableNumber ? tableNumber.toString() : (tableText || '未知');
            if (!ordersByTable[tableKey]) {
                ordersByTable[tableKey] = {
                    orders: 0,
                    totalAmount: 0,
                    items: []
                };
            }
            ordersByTable[tableKey].orders++;
            ordersByTable[tableKey].totalAmount += amount;
            
            // 解析項目
            if (items && items !== '無項目') {
                try {
                    if (items.startsWith('{') || items.startsWith('[')) {
                        const itemsData = JSON.parse(items);
                        if (itemsData.items && Array.isArray(itemsData.items)) {
                            itemsData.items.forEach(item => {
                                if (item.name) ordersByTable[tableKey].items.push(item.name);
                            });
                        }
                    } else {
                        // 解析文字格式
                        const lines = items.split('\n').filter(line => line.trim());
                        lines.forEach(line => {
                            const match = line.match(/^(.+?)\s+x\d+/);
                            if (match) {
                                ordersByTable[tableKey].items.push(match[1].trim());
                            }
                        });
                    }
                } catch (e) {
                    console.warn('⚠️ 無法解析項目:', items);
                }
            }
        });
        
        // 顯示每桌的訂單統計
        console.log('\n📊 2. 各桌訂單統計:');
        Object.keys(ordersByTable).forEach(tableKey => {
            const info = ordersByTable[tableKey];
            const uniqueItems = [...new Set(info.items)];
            
            console.log(`\n🏪 桌號 ${tableKey}:`);
            console.log(`   📋 訂單數: ${info.orders}`);
            console.log(`   💰 總金額: NT$${info.totalAmount}`);
            console.log(`   🍽️ 項目數: ${uniqueItems.length}`);
            if (uniqueItems.length > 0) {
                console.log(`   📝 項目: ${uniqueItems.slice(0, 3).join(', ')}${uniqueItems.length > 3 ? '...' : ''}`);
            }
        });
        
        // 測試特定桌號檢查
        console.log('\n🎯 3. 測試特定桌號檢查:');
        const testTables = ['4', 'F4', '5', '12', '1', '999'];
        
        testTables.forEach(testTable => {
            const matchingOrders = data.results?.filter(order => {
                const orderTableNumber = order.properties?.['桌號']?.number;
                const orderTableText = order.properties?.['桌號']?.rich_text?.[0]?.text?.content;
                
                // 智慧比對桌號
                if (orderTableNumber && orderTableNumber.toString() === testTable.toString()) {
                    return true;
                }
                if (orderTableText && (
                    orderTableText === testTable ||
                    orderTableText.includes(testTable) ||
                    testTable.includes(orderTableText)
                )) {
                    return true;
                }
                return false;
            }) || [];
            
            console.log(`\n   桌號 ${testTable}: ${matchingOrders.length > 0 ? `找到 ${matchingOrders.length} 個訂單` : '無訂單'}`);
            if (matchingOrders.length > 0) {
                matchingOrders.forEach(order => {
                    const orderNumber = order.properties['訂單編號']?.title?.[0]?.text?.content || '未知';
                    const amount = order.properties['總金額']?.number || 0;
                    const status = order.properties['狀態']?.select?.name || '未知';
                    console.log(`     - ${orderNumber} | ${status} | NT$${amount}`);
                });
            }
        });
        
        console.log('\n✅ 測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

// 執行測試
testTableOrdersFeature();
