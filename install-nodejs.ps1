# Node.js 自動安裝腳本
# 此腳本會自動下載並安裝最新的 Node.js LTS 版本

param(
    [switch]$Force = $false
)

Write-Host "🚀 Node.js 自動安裝腳本" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

# 檢查是否已安裝 Node.js
$nodeInstalled = $false
$currentVersion = ""

try {
    $nodeCommand = Get-Command node -ErrorAction Stop
    $currentVersion = & node --version 2>$null
    if ($currentVersion) {
        $nodeInstalled = $true
        Write-Host "✅ 已安裝 Node.js 版本: $currentVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "📦 Node.js 尚未安裝" -ForegroundColor Yellow
}

if ($nodeInstalled -and -not $Force) {
    $choice = Read-Host "Node.js 已安裝，是否要重新安裝？ (y/N)"
    if ($choice -ne 'y' -and $choice -ne 'Y') {
        Write-Host "取消安裝。" -ForegroundColor Gray
        exit 0
    }
}

Write-Host ""
Write-Host "🔍 偵測系統架構..." -ForegroundColor Yellow

# 偵測系統架構
$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
Write-Host "系統架構: $arch" -ForegroundColor Cyan

# Node.js 下載 URL
$baseUrl = "https://nodejs.org/dist/latest-v20.x/"
$fileName = "node-v20.12.2-$arch.msi"
$downloadUrl = "$baseUrl$fileName"
$downloadPath = "$env:TEMP\$fileName"

Write-Host ""
Write-Host "📥 開始下載 Node.js..." -ForegroundColor Yellow
Write-Host "下載地址: $downloadUrl" -ForegroundColor Cyan
Write-Host "儲存位置: $downloadPath" -ForegroundColor Cyan

try {
    # 顯示進度的下載
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadProgressChanged += {
        param($sender, $e)
        $percent = [math]::Round(($e.BytesReceived / $e.TotalBytesToReceive) * 100, 1)
        Write-Progress -Activity "下載 Node.js" -Status "$percent% 完成" -PercentComplete $percent
    }
    
    $webClient.DownloadFileCompleted += {
        param($sender, $e)
        Write-Progress -Activity "下載 Node.js" -Completed
        if ($e.Error) {
            throw $e.Error
        }
    }
    
    $webClient.DownloadFileAsync((New-Object System.Uri($downloadUrl)), $downloadPath)
    
    # 等待下載完成
    while ($webClient.IsBusy) {
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "✅ 下載完成！" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 下載失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔗 請手動前往官網下載:" -ForegroundColor Yellow
    Write-Host "   https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "🔧 開始安裝 Node.js..." -ForegroundColor Yellow
Write-Host "⚠️  安裝過程中請點選 'Next' 並確保勾選 'Add to PATH'" -ForegroundColor Red

try {
    # 安靜安裝模式
    $installArgs = @(
        "/i",
        "`"$downloadPath`"",
        "/quiet",
        "/norestart",
        "ADDLOCAL=ALL"
    )
    
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Node.js 安裝成功！" -ForegroundColor Green
    } else {
        throw "安裝程序返回錯誤代碼: $($process.ExitCode)"
    }
    
} catch {
    Write-Host "❌ 安裝失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 請嘗試手動安裝:" -ForegroundColor Yellow
    Write-Host "   1. 前往 $downloadPath" -ForegroundColor Cyan
    Write-Host "   2. 雙擊執行安裝檔" -ForegroundColor Cyan
    Write-Host "   3. 依照安裝精靈完成安裝" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

# 清理下載檔案
try {
    Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
    Write-Host "🧹 清理暫存檔案完成" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  無法清理暫存檔案: $downloadPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 重新載入環境變數..." -ForegroundColor Yellow

# 重新載入環境變數
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "✅ 安裝完成！" -ForegroundColor Green
Write-Host ""

# 驗證安裝
Write-Host "🔍 驗證安裝..." -ForegroundColor Yellow

try {
    # 嘗試執行 node
    $nodeVersion = & node --version 2>$null
    $npmVersion = & npm --version 2>$null
    
    if ($nodeVersion -and $npmVersion) {
        Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm 版本: v$npmVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Node.js 安裝成功！現在可以執行 CSV 同步功能了。" -ForegroundColor Green
    } else {
        Write-Host "⚠️  驗證失敗，可能需要重新啟動終端機" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "⚠️  驗證失敗，可能需要重新啟動終端機" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "請嘗試以下步驟:" -ForegroundColor Cyan
    Write-Host "1. 關閉目前的 PowerShell 視窗" -ForegroundColor White
    Write-Host "2. 重新開啟 PowerShell" -ForegroundColor White
    Write-Host "3. 執行: node --version" -ForegroundColor White
    Write-Host "4. 如果仍有問題，請重新啟動電腦" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 接下來的步驟:" -ForegroundColor Cyan
Write-Host "1. 重新啟動 PowerShell 視窗" -ForegroundColor White
Write-Host "2. 執行: .\start-csv-sync.bat" -ForegroundColor White
Write-Host "3. 開始 CSV 到 Notion 同步" -ForegroundColor White
Write-Host ""
Write-Host "按任意鍵結束..." -ForegroundColor Gray
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
