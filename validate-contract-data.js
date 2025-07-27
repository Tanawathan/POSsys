#!/usr/bin/env node

/**
 * 🔍 資料驗證檢查工具
 * 驗證收集的合約資料是否完整且格式正確
 */

const fs = require('fs');

class DataValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.data = null;
    }

    loadData() {
        try {
            if (!fs.existsSync('uber-eats-contract-data.json')) {
                console.log('❌ 找不到資料檔案，請先執行 node collect-contract-data.js');
                return false;
            }
            
            const rawData = fs.readFileSync('uber-eats-contract-data.json', 'utf8');
            this.data = JSON.parse(rawData);
            return true;
        } catch (error) {
            console.log('❌ 讀取資料檔案失敗:', error.message);
            return false;
        }
    }

    validateRestaurantInfo() {
        const restaurant = this.data.data.restaurant;
        
        if (!restaurant.nameZh) this.errors.push('缺少餐廳中文名稱');
        if (!restaurant.nameEn) this.warnings.push('建議提供餐廳英文名稱');
        if (!restaurant.legalName) this.errors.push('缺少法定公司名稱');
        if (!restaurant.taxId) this.errors.push('缺少統一編號');
        else if (!/^\d{8}$/.test(restaurant.taxId)) {
            this.errors.push('統一編號格式錯誤 (應為8位數字)');
        }
        if (!restaurant.businessLicense) this.errors.push('缺少營業執照號碼');
        if (!restaurant.establishedDate) this.warnings.push('建議提供成立日期');
    }

    validateAddressInfo() {
        const address = this.data.data.address;
        
        if (!address.street) this.errors.push('缺少街道地址');
        if (!address.city) this.errors.push('缺少城市');
        if (!address.postalCode) this.errors.push('缺少郵遞區號');
        else if (!/^\d{3,5}$/.test(address.postalCode)) {
            this.warnings.push('郵遞區號格式可能不正確');
        }
    }

    validateContactInfo() {
        const contact = this.data.data.contact;
        
        if (!contact.name) this.errors.push('缺少負責人姓名');
        if (!contact.phone) this.errors.push('缺少聯絡電話');
        else if (!/^[\d\-\+\(\)\s]+$/.test(contact.phone)) {
            this.warnings.push('電話號碼格式可能不正確');
        }
        if (!contact.email) this.errors.push('缺少電子郵件');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
            this.errors.push('電子郵件格式不正確');
        }
        if (!contact.idNumber) this.warnings.push('建議提供身分證字號');
    }

    validateBankingInfo() {
        const banking = this.data.data.banking;
        
        if (!banking.bankName) this.errors.push('缺少銀行名稱');
        if (!banking.accountNumber) this.errors.push('缺少帳戶號碼');
        if (!banking.accountName) this.errors.push('缺少戶名');
        if (!banking.branchCode) this.warnings.push('建議提供分行代碼');
    }

    validateBusinessInfo() {
        const business = this.data.data.business;
        const hours = business.hours;
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        
        days.forEach((day, index) => {
            if (!hours[day]) {
                this.warnings.push(`${dayNames[index]}營業時間未設定`);
            } else if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(hours[day]) && hours[day] !== '休息') {
                this.warnings.push(`${dayNames[index]}營業時間格式不正確 (應為 HH:MM-HH:MM 或 "休息")`);
            }
        });
        
        if (!business.cuisineType) this.warnings.push('建議指定主要菜系類型');
        if (!business.avgOrderValue) this.warnings.push('建議提供預計平均客單價');
        else if (!/^\d+$/.test(business.avgOrderValue)) {
            this.warnings.push('平均客單價應為數字');
        }
    }

    generateReport() {
        console.log('🔍 Uber Eats 合約資料驗證報告');
        console.log('=====================================');
        console.log(`驗證時間: ${new Date().toLocaleString('zh-TW')}`);
        console.log(`資料建立時間: ${new Date(this.data.timestamp).toLocaleString('zh-TW')}\n`);

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ 所有資料驗證通過！');
            console.log('🎉 你的資料已準備就緒，可以開始填寫合約了。\n');
        } else {
            if (this.errors.length > 0) {
                console.log('❌ 必須修正的錯誤:');
                this.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
                console.log('');
            }

            if (this.warnings.length > 0) {
                console.log('⚠️  建議改善的項目:');
                this.warnings.forEach((warning, index) => {
                    console.log(`   ${index + 1}. ${warning}`);
                });
                console.log('');
            }
        }

        // 顯示完整度統計
        const totalFields = 25; // 預計的總欄位數
        const completedFields = totalFields - this.errors.length;
        const completeness = Math.round((completedFields / totalFields) * 100);
        
        console.log('📊 資料完整度統計:');
        console.log(`   完整度: ${completeness}%`);
        console.log(`   必填項目錯誤: ${this.errors.length}`);
        console.log(`   建議改善項目: ${this.warnings.length}`);
        console.log('');

        // 下一步建議
        if (this.errors.length === 0) {
            console.log('🚀 下一步行動:');
            console.log('   1. 準備實體文件 (營業執照、身分證等)');
            console.log('   2. 檢查銀行帳戶資訊正確性');
            console.log('   3. 開始填寫 Uber Eats 線上申請表單');
            console.log('   4. 簽署合作夥伴協議');
        } else {
            console.log('🔧 請先修正上述錯誤，然後重新執行:');
            console.log('   node collect-contract-data.js');
        }
    }

    async validate() {
        if (!this.loadData()) {
            return;
        }

        console.log('🔍 開始驗證資料...\n');

        this.validateRestaurantInfo();
        this.validateAddressInfo();
        this.validateContactInfo();
        this.validateBankingInfo();
        this.validateBusinessInfo();

        this.generateReport();

        // 儲存驗證報告
        const report = {
            timestamp: new Date().toISOString(),
            errors: this.errors,
            warnings: this.warnings,
            completeness: Math.round(((25 - this.errors.length) / 25) * 100),
            readyForSubmission: this.errors.length === 0
        };

        fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2), 'utf8');
        console.log('📄 詳細驗證報告已儲存到 validation-report.json');
    }
}

// 執行驗證
const validator = new DataValidator();
validator.validate().catch(console.error);
