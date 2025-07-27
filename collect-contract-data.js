#!/usr/bin/env node

/**
 * 🍔 Uber Eats 合約資料收集工具
 * 互動式收集所有必要的合約資料
 */

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class UberEatsDataCollector {
    constructor() {
        this.data = {
            restaurant: {},
            address: {},
            contact: {},
            banking: {},
            business: {},
            technical: {}
        };
        this.currentStep = 0;
        this.totalSteps = 6;
    }

    async start() {
        console.log('🍔 Uber Eats 合約資料收集工具');
        console.log('=====================================');
        console.log('這個工具將協助你收集所有必要的合約資料\n');
        
        await this.collectRestaurantInfo();
        await this.collectAddressInfo();
        await this.collectContactInfo();
        await this.collectBankingInfo();
        await this.collectBusinessInfo();
        await this.collectTechnicalInfo();
        
        this.generateSummary();
        this.saveData();
        
        console.log('\n🎉 資料收集完成！');
        console.log('📄 資料已儲存到 uber-eats-contract-data.json');
        console.log('📋 摘要報告已產生到 contract-data-summary.md');
        
        rl.close();
    }

    async ask(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async collectRestaurantInfo() {
        console.log(`\n📋 步驟 ${++this.currentStep}/${this.totalSteps}: 餐廳基本資訊`);
        console.log('─────────────────────────────────');
        
        this.data.restaurant.nameZh = await this.ask('🏪 餐廳中文名稱: ');
        this.data.restaurant.nameEn = await this.ask('🏪 餐廳英文名稱: ');
        this.data.restaurant.legalName = await this.ask('📄 法定公司名稱: ');
        this.data.restaurant.taxId = await this.ask('🆔 統一編號: ');
        this.data.restaurant.businessLicense = await this.ask('📋 營業執照號碼: ');
        this.data.restaurant.establishedDate = await this.ask('📅 成立日期 (YYYY/MM/DD): ');
    }

    async collectAddressInfo() {
        console.log(`\n📍 步驟 ${++this.currentStep}/${this.totalSteps}: 地址資訊`);
        console.log('─────────────────────────────────');
        
        this.data.address.street = await this.ask('🏠 街道地址: ');
        this.data.address.city = await this.ask('🏙️  城市: ');
        this.data.address.district = await this.ask('🗺️  區域: ');
        this.data.address.postalCode = await this.ask('📮 郵遞區號: ');
        this.data.address.country = 'Taiwan';
        
        console.log(`✅ 完整地址: ${this.data.address.country}, ${this.data.address.city}${this.data.address.district}, ${this.data.address.street}, ${this.data.address.postalCode}`);
    }

    async collectContactInfo() {
        console.log(`\n👤 步驟 ${++this.currentStep}/${this.totalSteps}: 聯絡人資訊`);
        console.log('─────────────────────────────────');
        
        this.data.contact.name = await this.ask('👨‍💼 負責人姓名: ');
        this.data.contact.title = await this.ask('💼 職位: ');
        this.data.contact.idNumber = await this.ask('🆔 身分證字號: ');
        this.data.contact.phone = await this.ask('📱 聯絡電話: ');
        this.data.contact.email = await this.ask('📧 電子郵件: ');
    }

    async collectBankingInfo() {
        console.log(`\n💳 步驟 ${++this.currentStep}/${this.totalSteps}: 銀行資訊`);
        console.log('─────────────────────────────────');
        
        this.data.banking.bankName = await this.ask('🏦 銀行名稱: ');
        this.data.banking.branchName = await this.ask('🏢 分行名稱: ');
        this.data.banking.accountNumber = await this.ask('💳 帳戶號碼: ');
        this.data.banking.branchCode = await this.ask('🔢 分行代碼: ');
        this.data.banking.swiftCode = await this.ask('🌐 SWIFT Code (如有): ');
        this.data.banking.accountName = await this.ask('👤 戶名: ');
    }

    async collectBusinessInfo() {
        console.log(`\n🍽️  步驟 ${++this.currentStep}/${this.totalSteps}: 營業資訊`);
        console.log('─────────────────────────────────');
        
        console.log('📅 營業時間 (格式: HH:MM-HH:MM，如 09:00-22:00):');
        this.data.business.hours = {
            monday: await this.ask('週一: '),
            tuesday: await this.ask('週二: '),
            wednesday: await this.ask('週三: '),
            thursday: await this.ask('週四: '),
            friday: await this.ask('週五: '),
            saturday: await this.ask('週六: '),
            sunday: await this.ask('週日: ')
        };
        
        this.data.business.cuisineType = await this.ask('🍜 主要菜系類型: ');
        this.data.business.avgOrderValue = await this.ask('💰 預計平均客單價 (NT$): ');
        this.data.business.expectedOrders = await this.ask('📊 預計每日訂單量: ');
    }

    async collectTechnicalInfo() {
        console.log(`\n💻 步驟 ${++this.currentStep}/${this.totalSteps}: 技術整合資訊`);
        console.log('─────────────────────────────────');
        
        this.data.technical.currentPOS = await this.ask('🖥️  目前使用的 POS 系統 [預設: 自建系統]: ') || '自建系統 (Notion-based)';
        this.data.technical.website = await this.ask('🌐 餐廳網站 URL (如有): ');
        this.data.technical.apiStatus = '85% 完成';
        this.data.technical.webhookUrl = 'https://tanawatthaipos.netlify.app/.netlify/functions/uber-eats-webhook';
        
        console.log('✅ API 整合狀態: 85% 完成');
        console.log('✅ Webhook URL 已設定');
    }

    generateSummary() {
        const summary = `# 📋 Uber Eats 合約資料摘要

**產生時間**: ${new Date().toLocaleString('zh-TW')}

## 🏪 餐廳基本資訊
- **中文名稱**: ${this.data.restaurant.nameZh}
- **英文名稱**: ${this.data.restaurant.nameEn}
- **法定名稱**: ${this.data.restaurant.legalName}
- **統一編號**: ${this.data.restaurant.taxId}
- **營業執照**: ${this.data.restaurant.businessLicense}
- **成立日期**: ${this.data.restaurant.establishedDate}

## 📍 地址資訊
- **完整地址**: ${this.data.address.country}, ${this.data.address.city}${this.data.address.district}, ${this.data.address.street}
- **郵遞區號**: ${this.data.address.postalCode}

## 👤 聯絡人資訊
- **負責人**: ${this.data.contact.name} (${this.data.contact.title})
- **身分證**: ${this.data.contact.idNumber}
- **電話**: ${this.data.contact.phone}
- **信箱**: ${this.data.contact.email}

## 💳 銀行資訊
- **銀行**: ${this.data.banking.bankName} ${this.data.banking.branchName}
- **帳號**: ${this.data.banking.accountNumber}
- **分行代碼**: ${this.data.banking.branchCode}
- **SWIFT**: ${this.data.banking.swiftCode || '無'}
- **戶名**: ${this.data.banking.accountName}

## 🕒 營業時間
- **週一**: ${this.data.business.hours.monday}
- **週二**: ${this.data.business.hours.tuesday}
- **週三**: ${this.data.business.hours.wednesday}
- **週四**: ${this.data.business.hours.thursday}
- **週五**: ${this.data.business.hours.friday}
- **週六**: ${this.data.business.hours.saturday}
- **週日**: ${this.data.business.hours.sunday}

## 🍽️ 業務資訊
- **菜系類型**: ${this.data.business.cuisineType}
- **平均客單價**: NT$ ${this.data.business.avgOrderValue}
- **預計日訂單量**: ${this.data.business.expectedOrders} 單

## 💻 技術整合
- **POS 系統**: ${this.data.technical.currentPOS}
- **網站**: ${this.data.technical.website || '無'}
- **API 狀態**: ${this.data.technical.apiStatus}
- **Webhook URL**: ${this.data.technical.webhookUrl}

---

## 📋 待辦事項檢查清單

### 📄 所需文件
- [ ] 營業執照影本
- [ ] 統一編號證明
- [ ] 銀行開戶證明
- [ ] 負責人身分證影本
- [ ] 公司印章 (大小章)
- [ ] 菜單資料 (電子檔)

### ✅ 下一步行動
1. [ ] 準備上述所有實體文件
2. [ ] 檢查所有資料正確性
3. [ ] 完成 Uber Eats 線上申請
4. [ ] 簽署合作夥伴協議
5. [ ] 等待審核結果
6. [ ] 完成最終 API 測試

---

**💡 注意**: 請仔細檢查所有資料，確保與正式文件一致！
`;

        fs.writeFileSync('contract-data-summary.md', summary, 'utf8');
    }

    saveData() {
        const jsonData = {
            timestamp: new Date().toISOString(),
            data: this.data,
            metadata: {
                apiIntegrationStatus: '85%',
                webhookUrl: 'https://tanawatthaipos.netlify.app/.netlify/functions/uber-eats-webhook',
                clientId: 'cIVLSsW2jTLPx06BSc7nifdp7JsB45Aj',
                version: '1.0'
            }
        };
        
        fs.writeFileSync('uber-eats-contract-data.json', JSON.stringify(jsonData, null, 2), 'utf8');
    }
}

// 啟動資料收集
const collector = new UberEatsDataCollector();
collector.start().catch(console.error);
