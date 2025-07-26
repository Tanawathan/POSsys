// 刪除 Notion 訂單資料庫中的測試訂單
async function deleteTestOrder() {
    console.log('🗑️ 開始刪除 Notion 中的測試訂單...');
    
    try {
        // 步驟 1: 查詢訂單資料庫，找到 TEST-001 訂單
        console.log('🔍 查詢 TEST-001 訂單...');
        const queryResponse = await fetch('/.netlify/functions/notion-api/databases/23afd5adc30b80c39e71d1a640ccfb5d/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filter: {
                    property: '訂單編號',
                    title: {
                        equals: 'TEST-001'
                    }
                }
            })
        });
        
        if (!queryResponse.ok) {
            throw new Error(`查詢失敗: ${queryResponse.status} ${queryResponse.statusText}`);
        }
        
        const queryResult = await queryResponse.json();
        console.log('📋 查詢結果:', queryResult);
        
        if (queryResult.results && queryResult.results.length > 0) {
            // 步驟 2: 刪除找到的訂單
            for (const order of queryResult.results) {
                console.log(`🎯 找到訂單 ID: ${order.id}`);
                console.log(`📝 訂單詳情:`, {
                    訂單編號: order.properties['訂單編號']?.title?.[0]?.text?.content,
                    桌號: order.properties['桌號']?.number,
                    狀態: order.properties['狀態']?.select?.name,
                    總金額: order.properties['總金額']?.number
                });
                
                // 刪除訂單（將頁面歸檔）
                console.log(`🗑️ 正在刪除訂單 ${order.id}...`);
                const deleteResponse = await fetch(`/.netlify/functions/notion-api/pages/${order.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        archived: true
                    })
                });
                
                if (deleteResponse.ok) {
                    const deleteResult = await deleteResponse.json();
                    console.log(`✅ 訂單已刪除: ${order.id}`);
                    console.log(`📋 刪除結果:`, deleteResult);
                } else {
                    const deleteError = await deleteResponse.json();
                    console.error(`❌ 刪除失敗: ${order.id}`, deleteError);
                }
            }
        } else {
            console.log('⚠️ 未找到 TEST-001 訂單');
        }
        
        // 步驟 3: 查找並刪除其他測試訂單（以 TEST- 開頭的）
        console.log('\n🔍 查詢其他測試訂單...');
        const allTestOrdersResponse = await fetch('/.netlify/functions/notion-api/databases/23afd5adc30b80c39e71d1a640ccfb5d/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filter: {
                    property: '訂單編號',
                    title: {
                        starts_with: 'TEST-'
                    }
                }
            })
        });
        
        if (allTestOrdersResponse.ok) {
            const allTestOrders = await allTestOrdersResponse.json();
            console.log(`📊 找到 ${allTestOrders.results?.length || 0} 個測試訂單`);
            
            if (allTestOrders.results && allTestOrders.results.length > 0) {
                for (const testOrder of allTestOrders.results) {
                    const orderNumber = testOrder.properties['訂單編號']?.title?.[0]?.text?.content;
                    console.log(`🗑️ 刪除測試訂單: ${orderNumber} (ID: ${testOrder.id})`);
                    
                    const deleteResponse = await fetch(`/.netlify/functions/notion-api/pages/${testOrder.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            archived: true
                        })
                    });
                    
                    if (deleteResponse.ok) {
                        console.log(`✅ 已刪除: ${orderNumber}`);
                    } else {
                        console.error(`❌ 刪除失敗: ${orderNumber}`);
                    }
                }
            }
        }
        
        console.log('\n🎉 清理完成！');
        
    } catch (error) {
        console.error('💥 刪除過程發生錯誤:', error);
        throw error;
    }
}

// 執行刪除
deleteTestOrder().then(() => {
    console.log('✅ 測試訂單清理完成！');
}).catch(error => {
    console.error('❌ 清理失敗:', error.message);
});
