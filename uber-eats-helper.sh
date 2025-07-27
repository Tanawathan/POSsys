#!/bin/bash

# 🍔 Uber Eats 合約資料準備助手
# 一鍵啟動資料收集和驗證流程

echo "🍔 Uber Eats 合約資料準備助手"
echo "=================================="
echo ""

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 找不到 Node.js，請先安裝 Node.js"
    echo "💡 可以執行: ./install-nodejs-quick.sh"
    exit 1
fi

echo "✅ Node.js 已安裝: $(node --version)"
echo ""

# 選單
echo "請選擇要執行的操作:"
echo "1. 📝 收集合約資料"
echo "2. 🔍 驗證資料完整性"
echo "3. 📄 查看資料摘要"
echo "4. 🧪 執行 API 測試"
echo "5. 🚀 設定 Netlify 環境變數"
echo "6. 📋 查看準備指南"
echo "0. 退出"
echo ""

read -p "請輸入選項 (0-6): " choice

case $choice in
    1)
        echo "📝 啟動資料收集工具..."
        node collect-contract-data.js
        ;;
    2)
        echo "🔍 開始驗證資料..."
        if [ -f "uber-eats-contract-data.json" ]; then
            node validate-contract-data.js
        else
            echo "❌ 找不到資料檔案，請先執行資料收集"
            echo "💡 選擇選項 1 來收集資料"
        fi
        ;;
    3)
        echo "📄 顯示資料摘要..."
        if [ -f "contract-data-summary.md" ]; then
            cat contract-data-summary.md
        else
            echo "❌ 找不到摘要檔案，請先收集資料"
        fi
        ;;
    4)
        echo "🧪 執行 API 測試..."
        node scripts/test-uber-eats-api.js
        ;;
    5)
        echo "🚀 設定 Netlify 環境變數..."
        if [ -f "setup-netlify-env.sh" ]; then
            ./setup-netlify-env.sh
        else
            echo "❌ 找不到 Netlify 設定腳本"
        fi
        ;;
    6)
        echo "📋 顯示準備指南..."
        if [ -f "docs/資料準備指南.md" ]; then
            cat "docs/資料準備指南.md"
        else
            echo "❌ 找不到準備指南"
        fi
        ;;
    0)
        echo "👋 再見！"
        exit 0
        ;;
    *)
        echo "❌ 無效的選項，請重新執行"
        ;;
esac

echo ""
echo "🎉 操作完成！"
echo "💡 你可以重新執行 ./uber-eats-helper.sh 來使用其他功能"
