/**
 * 🔧 快速 OAuth 測試腳本
 */

require('dotenv').config({ path: '.env.local' });

async function testOAuth() {
    console.log('🔐 測試 Uber Eats OAuth 認證...\n');
    
    const clientId = process.env.UBER_EATS_CLIENT_ID;
    const clientSecret = process.env.UBER_EATS_CLIENT_SECRET;
    
    console.log('📋 設定檢查:');
    console.log(`Client ID: ${clientId ? '✅ 已設定' : '❌ 未設定'}`);
    console.log(`Client Secret: ${clientSecret ? '✅ 已設定' : '❌ 未設定'}`);
    console.log('');
    
    if (!clientId || !clientSecret) {
        console.log('❌ 請確認環境變數設定正確');
        return;
    }
    
    try {
        console.log('🚀 發送 OAuth 請求...');
        
        const response = await fetch('https://login.uber.com/oauth/v2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            })
        });

        console.log(`📡 回應狀態: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log('📄 回應內容:', responseText);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            if (data.access_token) {
                console.log('✅ OAuth 認證成功!');
                console.log(`🔑 Access Token: ${data.access_token.substring(0, 20)}...`);
                console.log(`⏰ 過期時間: ${data.expires_in} 秒`);
            } else {
                console.log('❌ 回應中沒有 access_token');
            }
        } else {
            console.log('❌ OAuth 認證失敗');
            try {
                const errorData = JSON.parse(responseText);
                console.log('🐛 錯誤詳情:', errorData);
            } catch (parseError) {
                console.log('🐛 無法解析錯誤回應');
            }
        }
        
    } catch (error) {
        console.log('❌ 網路錯誤:', error.message);
    }
}

testOAuth();
