const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Tanawat Restaurant 系統設定檢查\n');

// 檢查 .env 檔案
console.log('1. 檢查環境變數檔案...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    console.log('   ✅ .env 檔案存在');
    
    // 檢查 Notion API Key
    if (process.env.NOTION_API_KEY && process.env.NOTION_API_KEY.startsWith('ntn_')) {
        console.log('   ✅ NOTION_API_KEY 已正確設定');
        console.log(`   🔑 API Key: ${process.env.NOTION_API_KEY.substring(0, 15)}...`);
    } else {
        console.log('   ❌ NOTION_API_KEY 未設定或格式錯誤');
    }
    
    // 檢查資料庫 ID
    const dbIds = ['MENU_DB_ID', 'ORDERS_DB_ID', 'TABLES_DB_ID', 'RESERVATIONS_DB_ID', 'STAFF_DB_ID'];
    let dbConfigured = 0;
    
    console.log('\n   📊 資料庫設定狀態:');
    dbIds.forEach(dbId => {
        if (process.env[dbId] && !process.env[dbId].includes('your-') && process.env[dbId].length === 32) {
            console.log(`   ✅ ${dbId} 已設定`);
            dbConfigured++;
        } else {
            console.log(`   ❌ ${dbId} 未設定或使用預設值`);
        }
    });
    
    console.log(`\n   📈 資料庫設定進度: ${dbConfigured}/${dbIds.length}`);
    
} else {
    console.log('   ❌ .env 檔案不存在');
    console.log('   📝 請使用設定助手建立 .env 檔案');
}

// 檢查相依套件
console.log('\n2. 檢查相依套件...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredPackages = ['dotenv', 'express', 'cors'];
    let missingPackages = [];
    
    requiredPackages.forEach(pkgName => {
        if (pkg.dependencies && pkg.dependencies[pkgName]) {
            console.log(`   ✅ ${pkgName} 已安裝`);
        } else {
            console.log(`   ❌ ${pkgName} 未安裝`);
            missingPackages.push(pkgName);
        }
    });
    
    if (missingPackages.length > 0) {
        console.log(`\n   📝 需要安裝套件: npm install ${missingPackages.join(' ')}`);
    }
}

// 檢查設定檔案
console.log('\n3. 檢查設定檔案...');
const configPath = path.join(__dirname, '..', 'config', 'config.js');
if (fs.existsSync(configPath)) {
    console.log('   ✅ config.js 檔案存在');
} else {
    console.log('   ❌ config.js 檔案不存在');
}

// 檢查關鍵頁面
console.log('\n4. 檢查關鍵頁面...');
const keyPages = [
    'pages/notion-database-setup.html',
    'pages/notion-setup.html',
    'main-dashboard.html',
    'proxy-server.js'
];

keyPages.forEach(pagePath => {
    const fullPath = path.join(__dirname, '..', pagePath);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${pagePath} 存在`);
    } else {
        console.log(`   ❌ ${pagePath} 不存在`);
    }
});

// 總結和建議
console.log('\n📋 設定狀態總結:');

const apiKeySet = process.env.NOTION_API_KEY && process.env.NOTION_API_KEY.startsWith('ntn_');
const envExists = fs.existsSync(envPath);
const dbConfigured = ['MENU_DB_ID', 'ORDERS_DB_ID', 'TABLES_DB_ID', 'RESERVATIONS_DB_ID', 'STAFF_DB_ID']
    .filter(id => process.env[id] && !process.env[id].includes('your-') && process.env[id].length === 32).length;

if (!envExists) {
    console.log('   🔴 需要建立 .env 檔案');
} else if (!apiKeySet) {
    console.log('   🟡 需要設定正確的 Notion API Key');
} else if (dbConfigured === 0) {
    console.log('   🟡 API Key 已設定，需要建立 Notion 資料庫');
} else if (dbConfigured < 5) {
    console.log(`   🟡 已完成 ${dbConfigured}/5 個資料庫設定`);
} else {
    console.log('   🟢 所有設定已完成！系統可以啟動');
}

console.log('\n🚀 下一步建議:');

if (!envExists || !apiKeySet) {
    console.log('   1. 開啟 pages/notion-database-setup.html');
    console.log('   2. 按照步驟建立 Notion Integration');
    console.log('   3. 使用設定助手完成所有資料庫設定');
} else if (dbConfigured < 5) {
    console.log('   1. 開啟 pages/notion-database-setup.html');
    console.log('   2. 完成剩餘的資料庫設定');
    console.log('   3. 使用助手產生新的 .env 檔案');
} else {
    console.log('   1. 啟動系統: npm start 或 node proxy-server.js');
    console.log('   2. 開啟 main-dashboard.html 使用系統');
    console.log('   3. 使用 pages/notion-setup.html 測試所有功能');
}

console.log('\n🔗 有用連結:');
console.log('   • 設定助手: pages/notion-database-setup.html');
console.log('   • 連線測試: pages/notion-setup.html');
console.log('   • Notion Integration: https://www.notion.so/my-integrations');
console.log('   • 主控台: main-dashboard.html');

console.log('\n💡 提示: 如果需要重新設定，可以刪除 .env 檔案後重新執行設定助手');
