// API 配置文件 - 用於前端 API 調用
window.API_CONFIG = {
    baseUrl: '/.netlify/functions/notion-api',
    endpoints: {
        health: '/.netlify/functions/notion-api/health',
        testNotion: '/.netlify/functions/notion-api/test-notion',
        databases: '/.netlify/functions/notion-api/databases',
        pages: '/.netlify/functions/notion-api/pages'
    },
    environment: 'netlify',
    version: '2.0.0'
};

// 向後相容性函數
window.getApiUrl = function(path) {
    if (path.startsWith('/')) {
        return '/.netlify/functions/notion-api' + path;
    }
    return '/.netlify/functions/notion-api/' + path;
};
