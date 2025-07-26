// 監控 Notion 訂單資料庫的即時更新
async function monitorOrders() {
    console.log('👀 開始監控 Notion 訂單資料庫...');
    console.log('⏰ 每 3 秒檢查一次新訂單');
    
    let lastOrderCount = 0;
    let lastCheckTime = new Date();
    
    async function checkOrders() {
        try {
            const response = await fetch('/.netlify/functions/notion-api/databases/23afd5adc30b80c39e71d1a640ccfb5d/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sorts: [
                        {
                            property: '建立時間',
                            direction: 'descending'
                        }
                    ],
                    page_size: 10
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const currentTime = new Date();
                const orders = data.results || [];
                
                console.log(`\n📊 [${currentTime.toLocaleTimeString()}] 訂單檢查:`);
                console.log(`📋 總訂單數: ${orders.length}`);
                
                // 檢查是否有新訂單
                if (orders.length > lastOrderCount) {
                    const newOrders = orders.slice(0, orders.length - lastOrderCount);
                    console.log(`🆕 發現 ${newOrders.length} 個新訂單！`);
                    
                    newOrders.forEach((order, index) => {
                        const orderNumber = order.properties['訂單編號']?.title?.[0]?.text?.content || '未知';
                        const tableNumber = order.properties['桌號']?.number || '未知';
                        const tableNumber1 = order.properties['桌號']?.rich_text?.[0]?.text?.content || '';
                        const status = order.properties['狀態']?.select?.name || '未知';
                        const amount = order.properties['總金額']?.number || 0;
                        const items = order.properties['訂單項目']?.rich_text?.[0]?.text?.content || '無項目';
                        const createTime = order.properties['建立時間']?.date?.start || '未知';
                        const notes = order.properties['備註']?.rich_text?.[0]?.text?.content || '';
                        
                        console.log(`\n✨ 新訂單 ${index + 1}:`);
                        console.log(`   📝 訂單編號: ${orderNumber}`);
                        console.log(`   🏪 桌號: ${tableNumber}${tableNumber1 ? ` (${tableNumber1})` : ''}`);
                        console.log(`   📊 狀態: ${status}`);
                        console.log(`   💰 金額: NT$${amount}`);
                        console.log(`   🍽️ 項目: ${items}`);
                        console.log(`   ⏰ 建立時間: ${createTime}`);
                        if (notes) console.log(`   📝 備註: ${notes}`);
                        console.log(`   🔗 URL: ${order.url}`);
                    });
                } else if (orders.length === lastOrderCount) {
                    console.log('🔄 無新訂單');
                } else {
                    console.log(`📉 訂單數量減少了 ${lastOrderCount - orders.length} 個`);
                }
                
                // 顯示最近的 3 個訂單
                if (orders.length > 0) {
                    console.log('\n📋 最近 3 個訂單:');
                    orders.slice(0, 3).forEach((order, index) => {
                        const orderNumber = order.properties['訂單編號']?.title?.[0]?.text?.content || '未知';
                        const tableNumber = order.properties['桌號']?.number || '未知';
                        const status = order.properties['狀態']?.select?.name || '未知';
                        const amount = order.properties['總金額']?.number || 0;
                        const createTime = order.properties['建立時間']?.date?.start || '未知';
                        
                        console.log(`   ${index + 1}. ${orderNumber} | 桌號:${tableNumber} | ${status} | NT$${amount} | ${new Date(createTime).toLocaleString()}`);
                    });
                }
                
                lastOrderCount = orders.length;
                lastCheckTime = currentTime;
                
            } else {
                console.error('❌ 查詢失敗:', response.status, response.statusText);
            }
            
        } catch (error) {
            console.error('💥 監控錯誤:', error.message);
        }
    }
    
    // 立即執行一次
    await checkOrders();
    
    // 每 3 秒檢查一次
    const interval = setInterval(checkOrders, 3000);
    
    // 30 秒後停止監控
    setTimeout(() => {
        clearInterval(interval);
        console.log('\n⏹️ 監控已停止');
        process.exit(0);
    }, 30000);
    
    console.log('\n💡 提示: 現在可以在瀏覽器中測試點餐功能');
    console.log('📱 請前往: http://localhost:3000/customer/customer-view.html');
    console.log('⏰ 監控將在 30 秒後自動停止');
}

// 開始監控
monitorOrders().catch(console.error);
