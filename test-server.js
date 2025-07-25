const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// 中間件設定
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/public', express.static('public'));
app.use('/assets', express.static('assets'));
app.use('/pages', express.static('pages'));

// 基本測試路由
app.get('/api/test', (req, res) => {
    res.json({ message: '伺服器運行正常', timestamp: new Date() });
});

// 模擬桌況資料
app.get('/api/tables', (req, res) => {
    console.log('📋 收到桌況資料請求');
    
    const mockTables = [
        {
            id: 'notion-1',
            tableNumber: 'A1',
            status: '空閒中',
            maxCapacity: 4,
            currentCapacity: 0,
            shape: '方形',
            location: '前區',
            position: '靠窗',
            isMainTable: false,
            mergeNote: '',
            currentOrder: null,
            currentTotal: 0,
            lastCleaned: new Date().toISOString(),
            isAvailable: true,
            features: ['靠窗', '安靜'],
            priority: 1
        },
        {
            id: 'notion-2',
            tableNumber: 'A2',
            status: '使用中',
            maxCapacity: 2,
            currentCapacity: 2,
            shape: '圓形',
            location: '中區',
            position: '中央',
            isMainTable: false,
            mergeNote: '',
            currentOrder: 'ORD001',
            currentTotal: 450,
            lastCleaned: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isAvailable: false,
            features: ['情侶座'],
            priority: 2,
            occupiedSince: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
    ];
    
    res.json(mockTables);
});

// 桌況狀態更新
app.post('/api/tables/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, customerCount } = req.body;
    
    console.log(`📝 更新桌位 ${id} 狀態: ${status}, 人數: ${customerCount}`);
    
    res.json({
        success: true,
        message: '桌況狀態已更新',
        tableId: id,
        newStatus: status,
        customerCount: customerCount || 0,
        updatedAt: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 測試伺服器已啟動於 http://localhost:${PORT}`);
    console.log(`📋 桌況管理: http://localhost:${PORT}/pages/management/table-management.html`);
});
