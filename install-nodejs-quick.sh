#!/bin/bash

# 🚀 Node.js 快速安裝腳本 for macOS

echo "🔍 檢查系統..."
echo "系統: $(uname -s)"
echo "架構: $(uname -m)"

# 檢查是否已有 Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js 已安裝: $(node --version)"
    exit 0
fi

echo "📥 開始安裝 Node.js..."

# 下載 Node.js LTS 版本
NODE_VERSION="v20.10.0"

# 檢測系統架構
if [[ $(uname -m) == "arm64" ]]; then
    ARCH="arm64"
    echo "🖥️ 檢測到 Apple Silicon (M1/M2)"
else
    ARCH="x64"
    echo "🖥️ 檢測到 Intel 處理器"
fi

# 下載 URL
DOWNLOAD_URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-darwin-${ARCH}.tar.gz"
TEMP_DIR="/tmp/nodejs-install"
INSTALL_DIR="/usr/local"

echo "📥 下載 Node.js ${NODE_VERSION}..."
mkdir -p ${TEMP_DIR}
cd ${TEMP_DIR}

curl -L -o node.tar.gz "${DOWNLOAD_URL}"

if [ $? -ne 0 ]; then
    echo "❌ 下載失敗"
    exit 1
fi

echo "📦 解壓縮..."
tar -xzf node.tar.gz

if [ $? -ne 0 ]; then
    echo "❌ 解壓縮失敗"
    exit 1
fi

echo "📋 安裝 Node.js..."
EXTRACTED_DIR=$(find . -name "node-${NODE_VERSION}-darwin-${ARCH}" -type d)

if [ -z "$EXTRACTED_DIR" ]; then
    echo "❌ 找不到解壓縮的目錄"
    exit 1
fi

# 複製檔案到系統目錄 (需要 sudo)
echo "🔐 需要管理員權限來安裝到系統目錄..."
sudo cp -R ${EXTRACTED_DIR}/bin/* ${INSTALL_DIR}/bin/
sudo cp -R ${EXTRACTED_DIR}/lib/* ${INSTALL_DIR}/lib/
sudo cp -R ${EXTRACTED_DIR}/include/* ${INSTALL_DIR}/include/ 2>/dev/null || true
sudo cp -R ${EXTRACTED_DIR}/share/* ${INSTALL_DIR}/share/ 2>/dev/null || true

# 清理
cd /
rm -rf ${TEMP_DIR}

# 驗證安裝
echo "🔍 驗證安裝..."
if command -v node &> /dev/null; then
    echo "✅ Node.js 安裝成功!"
    echo "Node.js 版本: $(node --version)"
    echo "npm 版本: $(npm --version)"
    
    # 設定 PATH (如果需要)
    echo "📝 更新 shell 設定..."
    if [[ -f ~/.zshrc ]]; then
        grep -q "/usr/local/bin" ~/.zshrc || echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
        echo "✅ 已更新 ~/.zshrc"
    fi
    
    echo ""
    echo "🎉 安裝完成! 請執行以下命令重新載入終端:"
    echo "source ~/.zshrc"
    echo ""
    echo "或重新開啟終端視窗"
    
else
    echo "❌ 安裝失敗，請手動從 https://nodejs.org 下載安裝"
    exit 1
fi
