# Node.js 安裝指南

## 🚀 快速安裝 Node.js

### 方法 1：自動安裝腳本（推薦）
執行下面的 PowerShell 腳本會自動下載並安裝最新的 Node.js：

```powershell
.\install-nodejs.ps1
```

### 方法 2：手動下載安裝
1. 前往 Node.js 官網：https://nodejs.org/
2. 下載 LTS 版本（推薦穩定版）
3. 執行下載的 .msi 安裝檔
4. 依照安裝精靈完成安裝

### 方法 3：使用 Chocolatey（如果已安裝）
```powershell
choco install nodejs
```

### 方法 4：使用 Winget（Windows 10/11）
```powershell
winget install OpenJS.NodeJS
```

## 📋 安裝後驗證

安裝完成後，開啟新的命令提示字元或 PowerShell，執行：

```cmd
node --version
npm --version
```

如果顯示版本號，表示安裝成功！

## 🔧 常見問題

### 問題：找不到 'node' 命令
**解決方法：**
1. 重新啟動命令提示字元
2. 檢查環境變數 PATH 是否包含 Node.js 路徑
3. 重新安裝 Node.js，確保勾選「Add to PATH」選項

### 問題：權限不足
**解決方法：**
1. 以系統管理員身分執行 PowerShell
2. 或下載 .zip 版本手動解壓縮

## 🎯 推薦版本

- **LTS 版本**：18.x 或 20.x（長期支援版本）
- **穩定性**：LTS 版本更穩定，適合生產環境
- **相容性**：支援 Windows 7 以上版本

## 📦 安裝完成後

Node.js 安裝完成後，您就可以：
1. 執行 CSV 同步腳本
2. 啟動代理伺服器
3. 使用完整的餐廳管理系統功能

---

安裝完成後，請重新執行 CSV 同步程序！
