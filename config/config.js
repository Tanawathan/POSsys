// 配置文件 - 可以根據環境動態載入
// 優先使用 window.ENV_CONFIG (Netlify 環境變數)，然後是 process.env (Node.js 環境)
const getEnvVar = (key, defaultValue = '') => {
    if (typeof window !== 'undefined' && window.ENV_CONFIG && window.ENV_CONFIG[key]) {
        return window.ENV_CONFIG[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return defaultValue;
};

const CONFIG = {
  production: {
    // Make.com Webhooks (備用方案)
    makeWebhooks: {
      menuWebhookUrl: getEnvVar('MAKE_MENU_WEBHOOK'),
      orderWebhookUrl: getEnvVar('MAKE_ORDER_WEBHOOK'),
      tableWebhookUrl: getEnvVar('MAKE_TABLE_WEBHOOK'),
      fetchOrdersWebhookUrl: getEnvVar('MAKE_FETCH_ORDERS_WEBHOOK'),
      completeOrderWebhookUrl: getEnvVar('MAKE_COMPLETE_ORDER_WEBHOOK'),
      checkoutWebhookUrl: getEnvVar('MAKE_CHECKOUT_WEBHOOK')
    },
    
    // Notion API 設定 (主要資料同步方案)
    notion: {
        apiKey: getEnvVar('NOTION_API_KEY'), // 從環境變數讀取
        apiVersion: '2022-06-28',
        databaseIds: {
            menu: getEnvVar('MENU_DATABASE_ID'),
            orders: getEnvVar('ORDERS_DB_ID'), 
            tables: getEnvVar('TABLES_DB_ID'),
            reservations: getEnvVar('RESERVATIONS_DB_ID'),
            staff: getEnvVar('STAFF_DB_ID')
        }
    },    // 同步設定
    syncMethod: getEnvVar('SYNC_METHOD', 'notion'), // 'notion' 或 'make' 或 'both'
    offlineQueueSize: parseInt(getEnvVar('OFFLINE_QUEUE_SIZE', '100')),
    syncInterval: parseInt(getEnvVar('SYNC_INTERVAL', '30000')) // 30秒同步一次
  },
  development: {
    // 開發環境的設定 - 也使用環境變數
    makeWebhooks: {
      menuWebhookUrl: getEnvVar('MAKE_MENU_WEBHOOK'),
      orderWebhookUrl: getEnvVar('MAKE_ORDER_WEBHOOK'),
      tableWebhookUrl: getEnvVar('MAKE_TABLE_WEBHOOK'),
      fetchOrdersWebhookUrl: getEnvVar('MAKE_FETCH_ORDERS_WEBHOOK'),
      completeOrderWebhookUrl: getEnvVar('MAKE_COMPLETE_ORDER_WEBHOOK'),
      checkoutWebhookUrl: getEnvVar('MAKE_CHECKOUT_WEBHOOK')
    },
    notion: {
      apiKey: getEnvVar('NOTION_API_KEY'),
      apiVersion: '2022-06-28',
      databaseIds: {
        menu: getEnvVar('MENU_DATABASE_ID'),
        orders: getEnvVar('ORDERS_DB_ID'),
        tables: getEnvVar('TABLES_DB_ID'),
        reservations: getEnvVar('RESERVATIONS_DB_ID'),
        staff: getEnvVar('STAFF_DB_ID')
      }
    },
    syncMethod: getEnvVar('SYNC_METHOD', 'notion'),
    offlineQueueSize: parseInt(getEnvVar('OFFLINE_QUEUE_SIZE', '50')),
    syncInterval: parseInt(getEnvVar('SYNC_INTERVAL', '10000')) // 開發環境預設 10秒同步一次
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
