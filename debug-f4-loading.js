// 詳細除錯 F4 桌載入錯誤
async function debugF4Loading() {
    console.log('🔍 詳細除錯 F4 桌載入問題...');
    
    try {
        console.log('\n1️⃣ 檢查菜單 API');
        const menuResponse = await fetch('http://localhost:3000/api/notion/databases/23afd5adc30b80c58355fd93d05c66d6/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_size: 100
            })
        });
        
        if (!menuResponse.ok) {
            console.error('❌ 菜單 API 失敗:', menuResponse.status);
        } else {
            const menuData = await menuResponse.json();
            console.log('✅ 菜單 API 成功，項目數:', menuData.results?.length || 0);
            
            if (menuData.results && menuData.results.length > 0) {
                console.log('📋 前 3 個菜單項目:');
                menuData.results.slice(0, 3).forEach((item, index) => {
                    const name = item.properties?.['餐點名稱']?.title?.[0]?.text?.content || '未知';
                    const price = item.properties?.['價格']?.number || 0;
                    console.log(`   ${index + 1}. ${name} - NT$${price}`);
                });
            }
        }
        
        console.log('\n2️⃣ 檢查訂單 API');
        const orderResponse = await fetch('http://localhost:3000/api/notion/databases/23afd5adc30b80c39e71d1a640ccfb5d/query', {
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
        
        if (!orderResponse.ok) {
            console.error('❌ 訂單 API 失敗:', orderResponse.status);
        } else {
            const orderData = await orderResponse.json();
            console.log('✅ 訂單 API 成功，進行中訂單數:', orderData.results?.length || 0);
            
            if (orderData.results && orderData.results.length > 0) {
                console.log('📋 進行中訂單:');
                orderData.results.forEach((order, index) => {
                    const orderNumber = order.properties?.['訂單編號']?.title?.[0]?.text?.content || '未知';
                    const tableNumber = order.properties?.['桌號']?.number;
                    const tableText = order.properties?.['桌號']?.rich_text?.[0]?.text?.content;
                    const status = order.properties?.['狀態']?.select?.name || '未知';
                    console.log(`   ${index + 1}. ${orderNumber} | 桌號:${tableNumber}(${tableText}) | ${status}`);
                });
            }
        }
        
        console.log('\n3️⃣ 模擬訂單載入流程');
        
        // 模擬菜單數據結構
        const mockMenu = [
            { id: '1', name: '酸辣炸魚片', price: 120, category: '主食', itemType: 'dish' },
            { id: '2', name: '打拋風味脆薯', price: 100, category: '小菜', itemType: 'dish' }
        ];
        
        // 模擬現有訂單項目
        const mockExistingItems = [
            { name: '酸辣炸魚片', quantity: 1, price: 120 },
            { name: '打拋風味脆薯', quantity: 1, price: 100 }
        ];
        
        console.log('🔄 模擬訂單轉換...');
        
        try {
            const convertedOrder = mockExistingItems.map(item => {
                console.log(`   處理項目: ${JSON.stringify(item)}`);
                
                // 安全檢查
                if (!item || typeof item !== 'object') {
                    console.warn('   ⚠️ 項目無效');
                    return null;
                }
                
                const safeName = item.name || '未知餐點';
                const safeQuantity = parseInt(item.quantity) || 1;
                const safePrice = parseInt(item.price) || 0;
                
                console.log(`   安全值: name=${safeName}, quantity=${safeQuantity}, price=${safePrice}`);
                
                // 尋找菜單項目
                let menuItem = null;
                try {
                    if (Array.isArray(mockMenu) && mockMenu.length > 0) {
                        menuItem = mockMenu.find(m => m && m.name === safeName);
                        console.log(`   找到菜單項目: ${menuItem ? 'Yes' : 'No'}`);
                    }
                } catch (e) {
                    console.warn('   ⚠️ 菜單搜尋錯誤:', e);
                }
                
                const finalPrice = safePrice || (menuItem && menuItem.price ? menuItem.price : 0);
                
                const result = {
                    lineItemId: 'mock-' + Math.random().toString(36).substr(2, 9),
                    menuItemId: menuItem && menuItem.id ? menuItem.id : 'unknown',
                    name: safeName,
                    price: finalPrice,
                    category: menuItem && menuItem.category ? menuItem.category : '未分類',
                    itemType: menuItem && menuItem.itemType ? menuItem.itemType : 'dish',
                    quantity: safeQuantity,
                    customNote: item.customNote || '',
                    totalPrice: finalPrice * safeQuantity
                };
                
                console.log(`   ✅ 轉換結果: ${JSON.stringify(result)}`);
                return result;
            }).filter(item => item !== null);
            
            console.log(`✅ 模擬轉換成功，${convertedOrder.length} 個項目`);
            
            // 計算總金額
            const totalAmount = convertedOrder.reduce((sum, item) => {
                const itemTotal = (item && item.totalPrice) ? item.totalPrice : 0;
                return sum + itemTotal;
            }, 0);
            
            console.log(`💰 總金額: NT$${totalAmount}`);
            
        } catch (error) {
            console.error('❌ 模擬轉換失敗:', error);
            console.error('錯誤詳情:', error.stack);
        }
        
    } catch (error) {
        console.error('❌ 除錯失敗:', error);
    }
}

// 執行除錯
debugF4Loading();
