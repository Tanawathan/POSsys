#!/bin/bash

echo "🔧 庫存管理系統修復部署腳本"
echo "================================"

# 檢查必要文件
echo "📋 檢查必要文件..."
if [ ! -f "netlify/functions/notion-api.js" ]; then
    echo "❌ 錯誤: netlify/functions/notion-api.js 不存在"
    exit 1
fi

if [ ! -f "inventory-force-reload.html" ]; then
    echo "❌ 錯誤: inventory-force-reload.html 不存在"
    exit 1
fi

if [ ! -f "inventory-debug.html" ]; then
    echo "❌ 錯誤: inventory-debug.html 不存在"
    exit 1
fi

echo "✅ 所有必要文件存在"

# 執行構建腳本
echo "🔨 執行構建腳本..."
node build-for-netlify.js

if [ $? -ne 0 ]; then
    echo "❌ 構建失敗"
    exit 1
fi

echo "✅ 構建完成"

# 檢查生成的文件
echo "📄 檢查生成的配置文件..."
if [ -f "public/env-config.js" ]; then
    echo "✅ public/env-config.js 已生成"
else
    echo "❌ public/env-config.js 未生成"
fi

if [ -f "public/api-config.js" ]; then
    echo "✅ public/api-config.js 已生成"
else
    echo "❌ public/api-config.js 未生成"
fi

# 顯示部署資訊
echo ""
echo "🚀 部署準備完成！"
echo "================================"
echo "📋 部署檢查清單:"
echo "  • Netlify Functions 已修復 (fetch 相容性問題)"
echo "  • 庫存管理系統錯誤處理已改善"
echo "  • 診斷工具已創建 (inventory-debug.html)"
echo "  • 環境配置文件已生成"
echo ""
echo "⚠️  重要提醒:"
echo "  1. 確保在 Netlify 後台設定 NOTION_API_KEY 環境變數"
echo "  2. 部署後測試: https://your-site.netlify.app/.netlify/functions/notion-api/health"
echo "  3. 使用診斷工具: https://your-site.netlify.app/inventory-debug.html"
echo ""
echo "📚 詳細修復指南請參考: INVENTORY-SYSTEM-FIX.md"
echo ""
echo "✨ 現在可以部署到 Netlify 了！"