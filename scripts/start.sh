#!/bin/bash
# Tanawat Restaurant 系統快速啟動腳本

echo "🚀 啟動 Tanawat Restaurant 管理系統"
echo "=================================="

# 檢查設定
echo "📋 檢查系統設定..."
npm run check-setup

echo ""
echo "🌐 啟動伺服器..."
echo "主控台: http://localhost:3000"
echo "管理功能: http://localhost:3000/management/"
echo "測試工具: http://localhost:3000/tools/"
echo ""

# 啟動伺服器
npm start
