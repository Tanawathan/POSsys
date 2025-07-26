const fetch = require('node-fetch');

async function createProductionRecordsDatabase() {
    const databaseSchema = {
        "parent": {
            "type": "page_id",
            "page_id": "23bfd5adc30b80da8316d42e0348cb2b"
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": "製作記錄"
                }
            }
        ],
        "properties": {
            "製作記錄ID": {
                "title": {}
            },
            "製作日期": {
                "date": {}
            },
            "半成品名稱": {
                "relation": {
                    "database_id": "237fd5adc30b80c09b59c03cd67c6432",
                    "single_property": {}
                }
            },
            "製作數量": {
                "number": {
                    "format": "number"
                }
            },
            "製作狀態": {
                "select": {
                    "options": [
                        {
                            "name": "準備中",
                            "color": "blue"
                        },
                        {
                            "name": "製作中",
                            "color": "orange"
                        },
                        {
                            "name": "已完成",
                            "color": "green"
                        },
                        {
                            "name": "已取消",
                            "color": "red"
                        }
                    ]
                }
            },
            "操作人員": {
                "people": {}
            },
            "完成時間": {
                "date": {}
            },
            "製作備註": {
                "rich_text": {}
            }
        }
    };

    try {
        console.log('🚀 開始創建製作記錄資料庫...');
        
        const response = await fetch('http://localhost:3000/api/notion/databases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(databaseSchema)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ 製作記錄資料庫創建成功！');
            console.log('📄 資料庫ID:', result.id);
            console.log('🔗 資料庫URL:', result.url);
            
            // 保存配置
            const fs = require('fs');
            const config = {
                productionRecordsDbId: result.id,
                createdAt: new Date().toISOString(),
                url: result.url
            };
            fs.writeFileSync('production-records-db-config.json', JSON.stringify(config, null, 2));
            console.log('💾 配置已保存到 production-records-db-config.json');
            
            return result;
        } else {
            console.error('❌ 創建失敗:', result);
            return null;
        }
        
    } catch (error) {
        console.error('❌ 請求失敗:', error.message);
        return null;
    }
}

// 執行創建
createProductionRecordsDatabase();
