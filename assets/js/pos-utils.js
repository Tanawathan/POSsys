/**
 * POS 系統通用 JavaScript 工具庫
 * 提供常用功能和組件
 */

// POS 系統全局對象
window.POS = window.POS || {};

/**
 * 工具函數集合
 */
POS.Utils = {
  /**
   * 防抖函數
   * @param {Function} func - 要防抖的函數
   * @param {number} wait - 等待時間（毫秒）
   * @param {boolean} immediate - 是否立即執行
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * 節流函數
   * @param {Function} func - 要節流的函數
   * @param {number} limit - 限制時間間隔（毫秒）
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 格式化價格
   * @param {number} price - 價格數字
   * @param {string} currency - 貨幣符號
   */
  formatPrice(price, currency = 'NT$') {
    return `${currency} ${Number(price).toLocaleString('zh-TW')}`;
  },

  /**
   * 格式化時間
   * @param {Date|string} date - 日期對象或字符串
   * @param {string} format - 格式類型
   */
  formatTime(date = new Date(), format = 'datetime') {
    const d = new Date(date);
    const options = {
      'time': { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      'date': { year: 'numeric', month: '2-digit', day: '2-digit' },
      'datetime': { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
      }
    };
    return d.toLocaleString('zh-TW', options[format] || options.datetime);
  },

  /**
   * 深拷貝對象
   * @param {any} obj - 要拷貝的對象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  /**
   * 生成唯一 ID
   * @param {string} prefix - ID 前綴
   */
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 檢查是否為手機設備
   */
  isMobile() {
    return window.innerWidth < 768;
  },

  /**
   * 平滑滾動到元素
   * @param {string|Element} target - 目標元素或選擇器
   * @param {number} offset - 偏移量
   */
  scrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
};

/**
 * 通知系統
 */
POS.Notification = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    }
  },

  /**
   * 顯示通知
   * @param {string} message - 通知訊息
   * @param {string} type - 通知類型 (success, error, warning, info)
   * @param {number} duration - 持續時間（毫秒）
   */
  show(message, type = 'info', duration = 3000) {
    this.init();

    const notification = document.createElement('div');
    const id = POS.Utils.generateId('notification');
    
    const icons = {
      success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>`,
      error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>`,
      warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>`,
      info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>`
    };

    const colors = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
      info: 'bg-blue-600 text-white'
    };

    notification.id = id;
    notification.className = `${colors[type]} p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 transform transition-all duration-300 translate-x-full opacity-0`;
    notification.innerHTML = `
      ${icons[type]}
      <span class="flex-1 font-medium">${message}</span>
      <button onclick="POS.Notification.remove('${id}')" class="text-white/80 hover:text-white transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    this.container.appendChild(notification);

    // 觸發動畫
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // 自動移除
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  },

  /**
   * 移除通知
   * @param {string} id - 通知 ID
   */
  remove(id) {
    const notification = document.getElementById(id);
    if (notification) {
      notification.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  },

  // 便捷方法
  success(message, duration) { return this.show(message, 'success', duration); },
  error(message, duration) { return this.show(message, 'error', duration); },
  warning(message, duration) { return this.show(message, 'warning', duration); },
  info(message, duration) { return this.show(message, 'info', duration); }
};

/**
 * 載入指示器
 */
POS.Loading = {
  overlay: null,

  /**
   * 顯示載入指示器
   * @param {string} message - 載入訊息
   */
  show(message = '載入中...') {
    this.hide(); // 先隱藏已存在的

    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50';
    this.overlay.innerHTML = `
      <div class="bg-gray-800 rounded-2xl p-8 text-center max-w-sm mx-4 border border-gray-700">
        <div class="spinner mx-auto mb-4"></div>
        <h3 class="text-xl font-semibold text-white mb-2">${message}</h3>
        <p class="text-gray-400">請稍候...</p>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // 防止背景滾動
    document.body.style.overflow = 'hidden';
  },

  /**
   * 隱藏載入指示器
   */
  hide() {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          this.overlay = null;
        }
        // 恢復背景滾動
        document.body.style.overflow = '';
      }, 300);
    }
  }
};

/**
 * 確認對話框
 */
POS.Confirm = {
  /**
   * 顯示確認對話框
   * @param {Object} options - 配置選項
   */
  show(options = {}) {
    const defaults = {
      title: '確認操作',
      message: '您確定要執行此操作嗎？',
      confirmText: '確認',
      cancelText: '取消',
      type: 'warning', // success, error, warning, info
      onConfirm: () => {},
      onCancel: () => {}
    };

    const config = { ...defaults, ...options };
    
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50';
    
    const colors = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    };

    overlay.innerHTML = `
      <div class="bg-gray-800 rounded-2xl p-6 max-w-md mx-4 border border-gray-700 transform transition-all duration-300 scale-95 opacity-0">
        <div class="text-center mb-6">
          <div class="w-16 h-16 ${colors[config.type]} mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">${config.title}</h3>
          <p class="text-gray-400">${config.message}</p>
        </div>
        <div class="flex space-x-3">
          <button id="confirm-cancel" class="flex-1 btn btn-secondary">${config.cancelText}</button>
          <button id="confirm-ok" class="flex-1 btn btn-primary">${config.confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 觸發動畫
    setTimeout(() => {
      const modal = overlay.querySelector('div');
      modal.classList.remove('scale-95', 'opacity-0');
    }, 10);

    // 事件處理
    const cleanup = () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        document.body.style.overflow = '';
      }, 300);
    };

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
      cleanup();
      config.onCancel();
    });

    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
      cleanup();
      config.onConfirm();
    });

    // ESC 鍵取消
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        config.onCancel();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
};

/**
 * 數據持久化
 */
POS.Storage = {
  /**
   * 設置數據
   * @param {string} key - 鍵名
   * @param {any} value - 值
   * @param {boolean} session - 是否使用 sessionStorage
   */
  set(key, value, session = false) {
    try {
      const storage = session ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  /**
   * 獲取數據
   * @param {string} key - 鍵名
   * @param {any} defaultValue - 默認值
   * @param {boolean} session - 是否使用 sessionStorage
   */
  get(key, defaultValue = null, session = false) {
    try {
      const storage = session ? sessionStorage : localStorage;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  /**
   * 移除數據
   * @param {string} key - 鍵名
   * @param {boolean} session - 是否使用 sessionStorage
   */
  remove(key, session = false) {
    try {
      const storage = session ? sessionStorage : localStorage;
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  /**
   * 清空存儲
   * @param {boolean} session - 是否使用 sessionStorage
   */
  clear(session = false) {
    try {
      const storage = session ? sessionStorage : localStorage;
      storage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

/**
 * API 請求封裝
 */
POS.API = {
  /**
   * 基礎請求方法
   * @param {string} url - 請求 URL
   * @param {Object} options - 請求選項
   */
  async request(url, options = {}) {
    const defaults = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const config = { ...defaults, ...options };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * GET 請求
   */
  async get(url, params = {}) {
    const urlObj = new URL(url);
    Object.keys(params).forEach(key => 
      urlObj.searchParams.append(key, params[key])
    );
    return this.request(urlObj.toString());
  },

  /**
   * POST 請求
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT 請求
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE 請求
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }
};

/**
 * 事件總線
 */
POS.EventBus = {
  events: {},

  /**
   * 監聽事件
   * @param {string} event - 事件名稱
   * @param {Function} callback - 回調函數
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },

  /**
   * 移除事件監聽
   * @param {string} event - 事件名稱
   * @param {Function} callback - 回調函數
   */
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },

  /**
   * 觸發事件
   * @param {string} event - 事件名稱
   * @param {any} data - 傳遞的數據
   */
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
};

// 初始化全局事件處理
document.addEventListener('DOMContentLoaded', () => {
  // 全局錯誤處理
  window.addEventListener('error', (e) => {
    console.error('全局錯誤:', e.error);
    POS.Notification.error('系統發生錯誤，請稍後再試');
  });

  // 網絡狀態監控
  window.addEventListener('online', () => {
    POS.Notification.success('網絡連接已恢復');
  });

  window.addEventListener('offline', () => {
    POS.Notification.warning('網絡連接已斷開');
  });
});

// 導出到全局
window.POS = POS;
