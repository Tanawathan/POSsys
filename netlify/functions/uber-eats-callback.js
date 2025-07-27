/**
 * 🔐 Uber Eats OAuth 回調處理函數
 * 處理 OAuth 認證流程的回調
 */

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 處理 CORS 預檢請求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS OK' })
        };
    }

    try {
        console.log('🔐 OAuth 回調請求:', event.queryStringParameters);

        const { code, state, error } = event.queryStringParameters || {};

        // 檢查是否有錯誤
        if (error) {
            console.error('❌ OAuth 錯誤:', error);
            return {
                statusCode: 400,
                headers: {
                    ...headers,
                    'Content-Type': 'text/html'
                },
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>認證失敗</title>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #dc3545; }
                        </style>
                    </head>
                    <body>
                        <h1 class="error">認證失敗</h1>
                        <p>OAuth 認證過程中發生錯誤：${error}</p>
                        <p><a href="/">返回首頁</a></p>
                    </body>
                    </html>
                `
            };
        }

        // 檢查是否有授權碼
        if (!code) {
            console.error('❌ 缺少授權碼');
            return {
                statusCode: 400,
                headers: {
                    ...headers,
                    'Content-Type': 'text/html'
                },
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>認證失敗</title>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #dc3545; }
                        </style>
                    </head>
                    <body>
                        <h1 class="error">認證失敗</h1>
                        <p>缺少必要的授權碼</p>
                        <p><a href="/">返回首頁</a></p>
                    </body>
                    </html>
                `
            };
        }

        // 交換授權碼為存取權杖
        const tokenResponse = await exchangeCodeForToken(code);
        
        if (tokenResponse.access_token) {
            console.log('✅ 成功取得存取權杖');
            
            // 儲存權杖到安全的地方（這裡只是示範）
            // 在實際應用中，您應該將權杖儲存到安全的資料庫中
            
            return {
                statusCode: 200,
                headers: {
                    ...headers,
                    'Content-Type': 'text/html'
                },
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>認證成功</title>
                        <meta charset="UTF-8">
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                padding: 50px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                            }
                            .success { 
                                background: white; 
                                color: #28a745; 
                                padding: 30px; 
                                border-radius: 10px; 
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                                max-width: 500px;
                                margin: 0 auto;
                            }
                            .btn {
                                background: #007bff;
                                color: white;
                                padding: 10px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                                display: inline-block;
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="success">
                            <h1>🎉 認證成功！</h1>
                            <p>Uber Eats API 已成功連接到您的 POS 系統</p>
                            <p>現在可以開始接收 Uber Eats 訂單了</p>
                            <a href="/" class="btn">返回系統首頁</a>
                            <a href="/admin" class="btn">前往管理面板</a>
                        </div>
                        <script>
                            // 3 秒後自動跳轉
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 3000);
                        </script>
                    </body>
                    </html>
                `
            };
        } else {
            throw new Error('無法取得存取權杖');
        }

    } catch (error) {
        console.error('❌ OAuth 回調處理失敗:', error);
        
        return {
            statusCode: 500,
            headers: {
                ...headers,
                'Content-Type': 'text/html'
            },
            body: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>系統錯誤</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #dc3545; }
                    </style>
                </head>
                <body>
                    <h1 class="error">系統錯誤</h1>
                    <p>處理認證回調時發生錯誤：${error.message}</p>
                    <p><a href="/">返回首頁</a></p>
                </body>
                </html>
            `
        };
    }
};

/**
 * 交換授權碼為存取權杖
 */
async function exchangeCodeForToken(code) {
    const tokenUrl = 'https://login.uber.com/oauth/v2/token';
    
    const params = new URLSearchParams({
        client_id: process.env.UBER_EATS_CLIENT_ID,
        client_secret: process.env.UBER_EATS_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NETLIFY_SITE_URL}/.netlify/functions/uber-eats-callback`
    });

    console.log('🔄 交換授權碼為存取權杖...');

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('權杖交換失敗:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const tokenData = await response.json();
        console.log('✅ 成功取得權杖');
        
        // 在實際應用中，您應該安全地儲存這些權杖
        // 例如儲存到加密的資料庫或安全的金鑰管理服務
        console.log('存取權杖類型:', tokenData.token_type);
        console.log('權杖有效期:', tokenData.expires_in, '秒');
        
        return tokenData;
        
    } catch (error) {
        console.error('❌ 權杖交換失敗:', error);
        throw error;
    }
}

/**
 * 儲存權杖到安全位置
 */
async function storeTokenSecurely(tokenData) {
    // 這裡應該實作安全的權杖儲存邏輯
    // 例如：
    // 1. 加密權杖
    // 2. 儲存到資料庫
    // 3. 設定過期時間
    // 4. 記錄存取日誌
    
    console.log('📝 儲存權杖到安全位置...');
    
    // 示範：儲存到環境變數或資料庫
    const tokenInfo = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        token_type: tokenData.token_type,
        scope: tokenData.scope
    };
    
    // 實際實作中，這裡應該呼叫安全的儲存服務
    console.log('權杖資訊已準備儲存 (實際應用中應使用安全儲存)');
    
    return tokenInfo;
}

/**
 * 測試函數
 */
async function testCallback() {
    const mockEvent = {
        httpMethod: 'GET',
        queryStringParameters: {
            code: 'test_authorization_code',
            state: 'test_state'
        }
    };

    const result = await exports.handler(mockEvent, {});
    console.log('測試結果:', result);
}

// 如果直接執行此文件，運行測試
if (require.main === module) {
    testCallback();
}
