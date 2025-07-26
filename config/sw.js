// Service Worker for POS System
const CACHE_NAME = 'pos-system-v1.0.0';
const STATIC_CACHE = 'pos-static-v1.0.0';
const DYNAMIC_CACHE = 'pos-dynamic-v1.0.0';

// 需要緩存的核心文件
const CORE_FILES = [
  '/',
  '/index.html',
  '/customer-view.html',
  '/dashboard.html',
  '/kds.html',
  '/checkout.html',
  '/assets/css/pos-enhanced.css',
  '/assets/js/pos-utils.js',
  '/manifest.json'
];

// 需要緩存的外部資源
const EXTERNAL_RESOURCES = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap'
];

// 安裝事件 - 緩存核心文件
self.addEventListener('install', event => {
  console.log('Service Worker 安裝中...');
  
  event.waitUntil(
    Promise.all([
      // 緩存核心靜態文件
      caches.open(STATIC_CACHE).then(cache => {
        console.log('緩存核心文件...');
        return cache.addAll(CORE_FILES);
      }),
      // 緩存外部資源
      caches.open(STATIC_CACHE).then(cache => {
        console.log('緩存外部資源...');
        return cache.addAll(EXTERNAL_RESOURCES);
      })
    ]).then(() => {
      console.log('Service Worker 安裝完成');
      // 強制激活新的 Service Worker
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker 安裝失敗:', error);
    })
  );
});

// 激活事件 - 清理舊緩存
self.addEventListener('activate', event => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 刪除舊版本的緩存
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('刪除舊緩存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 激活完成');
      // 立即控制所有客戶端
      return self.clients.claim();
    })
  );
});

// 請求攔截 - 緩存策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳過非 GET 請求和非 HTTP(S) 協議
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 對不同類型的資源使用不同的緩存策略
  if (isStaticResource(request.url)) {
    // 靜態資源：緩存優先
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // API 請求：網絡優先
    event.respondWith(networkFirst(request));
  } else {
    // 其他資源：網絡優先，失敗時使用緩存
    event.respondWith(networkFirst(request));
  }
});

// 判斷是否為靜態資源
function isStaticResource(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  const staticDomains = ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
  
  return staticExtensions.some(ext => url.includes(ext)) || 
         staticDomains.some(domain => url.includes(domain));
}

// 判斷是否為 API 請求
function isAPIRequest(url) {
  return url.includes('hook.us2.make.com') || url.includes('/api/');
}

// 緩存優先策略
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('從緩存獲取:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    // 緩存成功的響應
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('緩存新資源:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('緩存優先策略失敗:', error);
    
    // 返回離線頁面或默認響應
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// 網絡優先策略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // 緩存成功的響應（非 API 請求）
    if (networkResponse.ok && !isAPIRequest(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('動態緩存:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('網絡請求失敗，嘗試緩存:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('從緩存獲取:', request.url);
      return cachedResponse;
    }
    
    // 對於 HTML 請求，返回離線頁面
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// 消息處理 - 與主線程通信
self.addEventListener('message', event => {
  const { data } = event;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    default:
      console.log('未知消息類型:', data.type);
  }
});

// 清理所有緩存
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('所有緩存已清理');
}

// 推送通知處理
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '您有新的通知',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: '查看'
      },
      {
        action: 'dismiss',
        title: '忽略'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'POS 系統通知', options)
  );
});

// 通知點擊處理
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    // 打開或聚焦到應用
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// 後台同步處理
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 執行後台同步
async function doBackgroundSync() {
  try {
    // 這裡可以執行需要同步的操作
    // 例如：上傳離線時保存的數據
    console.log('執行後台同步...');
    
    // 示例：同步離線訂單
    const offlineOrders = await getOfflineOrders();
    if (offlineOrders.length > 0) {
      await syncOfflineOrders(offlineOrders);
    }
  } catch (error) {
    console.error('後台同步失敗:', error);
  }
}

// 獲取離線訂單（示例）
async function getOfflineOrders() {
  // 從 IndexedDB 或其他存儲獲取離線數據
  return [];
}

// 同步離線訂單（示例）
async function syncOfflineOrders(orders) {
  // 將離線訂單發送到服務器
  for (const order of orders) {
    try {
      // await uploadOrder(order);
      console.log('同步訂單:', order.id);
    } catch (error) {
      console.error('同步訂單失敗:', order.id, error);
    }
  }
}
