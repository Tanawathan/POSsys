#!/bin/bash

# 🚀 Netlify 環境變數設定腳本
# 使用 Netlify CLI 快速設定所有必要的環境變數

echo "🔧 設定 Netlify 環境變數..."

# 檢查是否已登入 Netlify
if ! npx netlify status > /dev/null 2>&1; then
    echo "⚠️  請先登入 Netlify:"
    echo "npx netlify login"
    exit 1
fi

# 設定 Uber Eats API 憑證
echo "📝 設定 Uber Eats API 憑證..."
npx netlify env:set UBER_EATS_CLIENT_ID "cIVLSsW2jTLPx06BSc7nifdp7JsB45Aj"
npx netlify env:set UBER_EATS_CLIENT_SECRET "J_aKsgthqon_xlARanvy2bKZz-A5otK-uz7YjCyY"

# 設定 Webhook 安全密鑰
echo "🔐 設定 Webhook 安全設定..."
npx netlify env:set UBER_EATS_WEBHOOK_SECRET "tanawat_uber_2025_69777b97632ba4af853cb105b4ca709788b9f227f4b275f41767f390b116c8d9"
npx netlify env:set WEBHOOK_USERNAME "tanawat_pos"
npx netlify env:set WEBHOOK_PASSWORD "secure_webhook_2025_access"

# 設定現有的 Notion API
echo "📊 設定 Notion API..."
npx netlify env:set NOTION_API_KEY "secret_iSDhSCT8HPZMjPsX8YuMdhfzPJ2EYJrfXLdE17L88cV"
npx netlify env:set NOTION_ORDERS_DB_ID "23afd5adc30b80c39e71d1a640ccfb5d"
npx netlify env:set NOTION_TABLES_DB_ID "23afd5adc30b80fe86c9e086a54a0d61"

# 設定系統環境
echo "⚙️  設定系統環境..."
npx netlify env:set NODE_ENV "production"
npx netlify env:set UBER_EATS_SANDBOX "false"

echo ""
echo "✅ 所有環境變數設定完成!"
echo ""
echo "📋 已設定的變數:"
npx netlify env:list
echo ""
echo "🚀 觸發重新部署..."
npx netlify deploy --prod

echo ""
echo "🎉 設定完成! 你的 Webhook URL 是:"
echo "https://tanawatthaipos.netlify.app/.netlify/functions/uber-eats-webhook"
echo ""
echo "請將此 URL 更新到 Uber 開發者後台的 Webhook 設定中"
