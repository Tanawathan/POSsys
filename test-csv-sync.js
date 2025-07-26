const fs = require('fs');
const path = require('path');

console.log('🍽️ Tanawat Restaurant CSV 同步測試');
console.log('=====================================\n');

// 檢查檔案
const csvFile = path.join(__dirname, 'data', '最終菜色.csv');
console.log('📄 檢查 CSV 檔案:', csvFile);

if (fs.existsSync(csvFile)) {
    console.log('✅ CSV 檔案存在');
    
    // 讀取並預覽前幾行
    const content = fs.readFileSync(csvFile, 'utf-8');
    const lines = content.split('\n').slice(0, 5);
    
    console.log('\n📋 CSV 預覽 (前5行):');
    lines.forEach((line, index) => {
        console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
    // 計算總行數
    const totalLines = content.split('\n').length - 1; // 減去標題行
    console.log(`\n📊 總計 ${totalLines} 筆菜單資料`);
    
} else {
    console.log('❌ CSV 檔案不存在');
}

// 檢查環境變數
console.log('\n🔑 檢查環境設定:');
require('dotenv').config();

const apiKey = process.env.NOTION_API_KEY;
const dbId = process.env.MENU_DB_ID;

console.log('- API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未設定');
console.log('- 資料庫 ID:', dbId || '未設定');

if (apiKey && dbId) {
    console.log('✅ 環境設定完整');
    console.log('\n🚀 準備開始同步！');
    console.log('💡 請開啟瀏覽器訪問: http://localhost:3000/pages/tools/csv-notion-sync.html');
} else {
    console.log('❌ 環境設定不完整');
}

console.log('\n完成檢查。');
