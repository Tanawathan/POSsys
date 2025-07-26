const axios = require('axios');

// 使用方法：
// 1. 替換 YOUR_NOTION_TOKEN 為您的 Notion Integration Token
// 2. 替換 YOUR_PARENT_PAGE_ID 為您要在其下創建資料庫的頁面ID
// 3. 運行：node create-production-records-db.js

const NOTION_TOKEN = 'YOUR_NOTION_TOKEN';
const PARENT_PAGE_ID = 'YOUR_PARENT_PAGE_ID';

const databaseSchema = {
  "parent": {
    "type": "page_id",
    "page_id": PARENT_PAGE_ID
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
        "database_id": "237fd5adc30b80c09b59c03cd67c6432"
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
            "name": "🔄 準備中",
            "color": "blue"
          },
          {
            "name": "🚀 製作中",
            "color": "orange"
          },
          {
            "name": "⏳ 等待檢查",
            "color": "yellow"
          },
          {
            "name": "✅ 已完成",
            "color": "green"
          },
          {
            "name": "❌ 已取消",
            "color": "red"
          },
          {
            "name": "🔧 需重製",
            "color": "red"
          }
        ]
      }
    },
    "操作人員": {
      "people": {}
    },
    "預計完成時間": {
      "date": {}
    },
    "實際完成時間": {
      "date": {}
    },
    "使用食材清單": {
      "rich_text": {}
    },
    "製作備註": {
      "rich_text": {}
    },
    "成本計算": {
      "number": {
        "format": "taiwanese_dollar"
      }
    },
    "品質檢查": {
      "select": {
        "options": [
          {
            "name": "✅ 合格",
            "color": "green"
          },
          {
            "name": "❌ 不合格",
            "color": "red"
          },
          {
            "name": "⏳ 待檢查",
            "color": "yellow"
          }
        ]
      }
    },
    "批次編號": {
      "rich_text": {}
    },
    "保存期限": {
      "date": {}
    },
    "存放位置": {
      "select": {
        "options": [
          {
            "name": "🧊 冷藏區",
            "color": "blue"
          },
          {
            "name": "❄️ 冷凍區",
            "color": "purple"
          },
          {
            "name": "🌡️ 常溫區",
            "color": "green"
          },
          {
            "name": "🔥 保溫區",
            "color": "orange"
          },
          {
            "name": "📦 備品區",
            "color": "gray"
          }
        ]
      }
    },
    "製作時長": {
      "formula": {
        "expression": "if(and(prop(\"實際完成時間\"), prop(\"製作日期\")), formatDate(prop(\"實際完成時間\") - prop(\"製作日期\"), \"H [小時] m [分鐘]\"), \"未完成\")"
      }
    },
    "效率評分": {
      "number": {
        "format": "number"
      }
    },
    "單位成本": {
      "formula": {
        "expression": "if(prop(\"製作數量\") > 0, round(prop(\"成本計算\") / prop(\"製作數量\"), 2), 0)"
      }
    }
  }
};

async function createProductionRecordsDatabase() {
  try {
    console.log('🚀 開始創建製作記錄資料庫...');
    
    const response = await axios.post('https://api.notion.com/v1/databases', databaseSchema, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    });

    console.log('✅ 製作記錄資料庫創建成功！');
    console.log('📄 資料庫ID:', response.data.id);
    console.log('🔗 資料庫URL:', response.data.url);
    
    // 保存資料庫ID到配置文件
    const fs = require('fs');
    const config = {
      productionRecordsDbId: response.data.id,
      createdAt: new Date().toISOString(),
      url: response.data.url
    };
    
    fs.writeFileSync('production-records-db-config.json', JSON.stringify(config, null, 2));
    console.log('💾 資料庫配置已保存到 production-records-db-config.json');
    
  } catch (error) {
    console.error('❌ 創建資料庫失敗:', error.response?.data || error.message);
  }
}

// 執行創建
if (require.main === module) {
  if (NOTION_TOKEN === 'YOUR_NOTION_TOKEN' || PARENT_PAGE_ID === 'YOUR_PARENT_PAGE_ID') {
    console.log('❌ 請先設定 NOTION_TOKEN 和 PARENT_PAGE_ID');
    console.log('📝 請編輯此文件並替換相應的值');
  } else {
    createProductionRecordsDatabase();
  }
}

module.exports = { createProductionRecordsDatabase, databaseSchema };
