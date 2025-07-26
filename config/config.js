// 配置文件 - 可以根據環境動態載入
const CONFIG = {
  production: {
    // Make.com Webhooks (備用方案)
    makeWebhooks: {
      menuWebhookUrl: 'https://hook.us2.make.com/7x1uvc1swnt7oyijv35fuwl253esfl95',
      orderWebhookUrl: 'https://hook.us2.make.com/rxk02bzg5yp5pqergrmyeh1mxid8gwcb',
      tableWebhookUrl: 'https://hook.us2.make.com/5h275y5bqajl3x4eecvg9ve4im9bo4nd',
      fetchOrdersWebhookUrl: 'https://hook.us2.make.com/x38sw9p1gpwgv8lg4ysg6swywvdtjheh',
      completeOrderWebhookUrl: 'https://hook.us2.make.com/pphblun9ny4h8dysflo1npk8qim8rsis',
      checkoutWebhookUrl: 'https://hook.us2.make.com/4q80ozgqm3eg8x848z0zvf11m79o9k6e'
    },
    
    // Notion API 設定 (主要資料同步方案)
    notion: {
        apiKey: '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', // 您的 Notion API Key
        apiVersion: '2022-06-28',
        databaseIds: {
            menu: '23afd5adc30b80c58355fd93d05c66d6',
            orders: '23afd5adc30b80c39e71d1a640ccfb5d', 
            tables: '23afd5adc30b80fe86c9e086a54a0d61',
            reservations: '23afd5adc30b802fbe36d69085c495b7',
            staff: '23afd5adc30b80b7a8e7dec998bf5aad'
        }
    },    // 同步設定
    syncMethod: 'notion', // 'notion' 或 'make' 或 'both'
    offlineQueueSize: 100,
    syncInterval: 30000 // 30秒同步一次
  },
  development: {
    // 開發環境的設定
    makeWebhooks: {
      menuWebhookUrl: 'https://hook.us2.make.com/dev-menu',
      orderWebhookUrl: 'https://hook.us2.make.com/dev-order',
    },
    notion: {
      apiKey: 'your-dev-notion-api-key',
      apiVersion: '2022-06-28',
      databaseIds: {
        menu: 'your-dev-menu-database-id',
        orders: 'your-dev-orders-database-id',
        // ... 其他開發資料庫 IDs
      }
    },
    syncMethod: 'notion',
    offlineQueueSize: 50,
    syncInterval: 10000 // 開發環境 10秒同步一次
  }
};

// 根據環境選擇配置
const getConfig = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return CONFIG.development;
  }
  return CONFIG.production;
};

// 導出配置供其他文件使用
window.APP_CONFIG = getConfig();
