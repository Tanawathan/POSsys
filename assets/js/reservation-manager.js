/**
 * 訂位管理系統
 * 管理餐廳訂位、客戶資料、預約排程等功能
 */

class ReservationManager {
    constructor() {
        this.reservations = [];
        this.customers = new Map();
        this.waitingList = [];
        this.blacklist = [];
        this.reservationHistory = [];
        this.settings = {
            maxAdvanceDays: 30,           // 最多可提前訂位天數
            maxPartySize: 10,             // 最大用餐人數
            timeSlots: [                  // 可預訂時段
                '11:30', '12:00', '12:30', '13:00', '13:30',
                '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
            ],
            reservationDuration: 120,     // 預計用餐時間（分鐘）
            confirmationRequired: true,   // 需要確認訂位
            reminderHours: 2,             // 提醒時間（小時前）
            noShowPenalty: 3              // 未到場次數限制
        };
        this.init();
    }

    /**
     * 初始化訂位管理系統
     */
    init() {
        // 初始化 Notion 資料管理器
        this.notionManager = new NotionDataManager();
        
        this.loadSampleData();
        this.setupNotifications();
        this.checkUpcomingReservations();
    }

    /**
     * 載入範例資料
     */
    loadSampleData() {
        // 建立範例訂位記錄
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.reservations = [
            {
                id: 'RES001',
                customerName: '王小明',
                phone: '0912-345-678',
                partySize: 4,
                reservationDate: today.toISOString().split('T')[0],
                reservationTime: '18:30',
                tableAssignment: '方6',
                status: '已確認',
                notes: '生日聚餐，需要生日蛋糕',
                createdAt: new Date().toISOString(),
                confirmedAt: new Date().toISOString(),
                source: '電話訂位',
                specialRequests: ['生日蛋糕', '靠窗座位'],
                customerType: '常客'
            },
            {
                id: 'RES002',
                customerName: '李美華',
                phone: '0923-456-789',
                partySize: 2,
                reservationDate: tomorrow.toISOString().split('T')[0],
                reservationTime: '19:00',
                tableAssignment: '前右2',
                status: '待確認',
                notes: '素食者',
                createdAt: new Date().toISOString(),
                source: '線上訂位',
                specialRequests: ['素食菜單'],
                customerType: '新客戶'
            },
            {
                id: 'RES003',
                customerName: '陳建華',
                phone: '0934-567-890',
                partySize: 6,
                reservationDate: tomorrow.toISOString().split('T')[0],
                reservationTime: '18:00',
                tableAssignment: null,
                status: '候補中',
                notes: '公司聚餐',
                createdAt: new Date().toISOString(),
                source: '電話訂位',
                specialRequests: ['發票', '分開結帳'],
                customerType: '企業客戶'
            }
        ];

        // 建立客戶資料
        this.customers.set('0912-345-678', {
            name: '王小明',
            phone: '0912-345-678',
            email: 'wang@email.com',
            visitCount: 8,
            totalSpent: 15600,
            averageSpent: 1950,
            lastVisit: '2024-07-20',
            preferences: ['泰式咖哩', '椰汁雞湯'],
            allergies: [],
            vip: true,
            birthday: '1985-03-15',
            notes: '常客，喜歡靠窗座位',
            noShowCount: 0
        });

        this.customers.set('0923-456-789', {
            name: '李美華',
            phone: '0923-456-789',
            email: 'li@email.com',
            visitCount: 1,
            totalSpent: 0,
            averageSpent: 0,
            lastVisit: null,
            preferences: [],
            allergies: ['蝦', '蟹'],
            vip: false,
            birthday: '1990-08-22',
            notes: '素食者，對海鮮過敏',
            noShowCount: 0
        });

        this.customers.set('0934-567-890', {
            name: '陳建華',
            phone: '0934-567-890',
            email: 'chen@company.com',
            visitCount: 3,
            totalSpent: 8400,
            averageSpent: 2800,
            lastVisit: '2024-07-10',
            preferences: ['團體聚餐'],
            allergies: [],
            vip: false,
            birthday: '1978-12-05',
            notes: '公司主管，常帶團體用餐',
            noShowCount: 0
        });

        // 等候名單
        this.waitingList = [
            {
                id: 'WAIT001',
                customerName: '張三',
                phone: '0945-678-901',
                partySize: 4,
                preferredDate: tomorrow.toISOString().split('T')[0],
                preferredTime: '19:30',
                notes: '可接受19:00-20:00任何時間',
                createdAt: new Date().toISOString(),
                priority: 'normal'
            }
        ];
    }

    /**
     * 建立新訂位
     */
    createReservation(reservationData) {
        // 驗證訂位資料
        const validation = this.validateReservation(reservationData);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // 檢查時間衝突
        const conflicts = this.checkTimeConflicts(
            reservationData.date,
            reservationData.time,
            reservationData.partySize
        );

        if (conflicts.length > 0) {
            // 如果有衝突，加入等候名單
            return this.addToWaitingList(reservationData);
        }

        // 建立訂位記錄
        const reservation = {
            id: this.generateReservationId(),
            customerName: reservationData.customerName,
            phone: reservationData.phone,
            partySize: reservationData.partySize,
            reservationDate: reservationData.date,
            reservationTime: reservationData.time,
            tableAssignment: this.assignTable(reservationData.partySize, reservationData.date, reservationData.time),
            status: this.settings.confirmationRequired ? '待確認' : '已確認',
            notes: reservationData.notes || '',
            createdAt: new Date().toISOString(),
            source: reservationData.source || '系統',
            specialRequests: reservationData.specialRequests || [],
            customerType: this.getCustomerType(reservationData.phone)
        };

        this.reservations.push(reservation);
        this.updateCustomerRecord(reservationData.phone, reservationData.customerName);
        
        // 同步到 Notion
        this.syncReservationToNotion(reservation);
        
        return {
            success: true,
            reservation: reservation,
            message: '訂位成功'
        };
    }

    /**
     * 驗證訂位資料
     */
    validateReservation(data) {
        if (!data.customerName || data.customerName.length < 2) {
            return { valid: false, message: '請輸入正確的客戶姓名' };
        }

        if (!data.phone || !this.validatePhone(data.phone)) {
            return { valid: false, message: '請輸入正確的聯絡電話' };
        }

        if (!data.partySize || data.partySize < 1 || data.partySize > this.settings.maxPartySize) {
            return { valid: false, message: `用餐人數須在1-${this.settings.maxPartySize}人之間` };
        }

        if (!data.date || !this.isValidReservationDate(data.date)) {
            return { valid: false, message: '請選擇有效的訂位日期' };
        }

        if (!data.time || !this.settings.timeSlots.includes(data.time)) {
            return { valid: false, message: '請選擇有效的訂位時間' };
        }

        // 檢查黑名單
        if (this.isBlacklisted(data.phone)) {
            return { valid: false, message: '很抱歉，無法為此電話號碼建立訂位' };
        }

        return { valid: true };
    }

    /**
     * 驗證電話號碼
     */
    validatePhone(phone) {
        const phoneRegex = /^09\d{2}-?\d{3}-?\d{3}$/;
        return phoneRegex.test(phone);
    }

    /**
     * 檢查是否為有效訂位日期
     */
    isValidReservationDate(date) {
        const today = new Date();
        const reservationDate = new Date(date);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + this.settings.maxAdvanceDays);

        return reservationDate >= today && reservationDate <= maxDate;
    }

    /**
     * 檢查時間衝突
     */
    checkTimeConflicts(date, time, partySize) {
        const conflicts = [];
        const reservationDateTime = new Date(`${date} ${time}`);
        const endTime = new Date(reservationDateTime.getTime() + this.settings.reservationDuration * 60000);

        // 檢查同時段的訂位
        const sameTimeReservations = this.reservations.filter(res => 
            res.reservationDate === date && 
            res.status !== '已取消' &&
            res.status !== '未到場'
        );

        // 檢查是否有適合的桌子
        const availableTables = this.getAvailableTables(date, time, partySize);
        
        if (availableTables.length === 0) {
            conflicts.push({
                type: 'no_table',
                message: '該時段沒有適合的桌位'
            });
        }

        return conflicts;
    }

    /**
     * 取得可用桌位
     */
    getAvailableTables(date, time, partySize) {
        // 假設的餐廳桌位配置
        const tables = [
            { id: '前右2', capacity: 2 },
            { id: '前左2', capacity: 2 },
            { id: '方6', capacity: 6 },
            { id: '方4', capacity: 4 },
            { id: '圓3', capacity: 3 },
            { id: '後2', capacity: 2 }
        ];

        // 過濾出容量適合的桌子
        const suitableTables = tables.filter(table => table.capacity >= partySize);

        // 檢查哪些桌子在該時段沒有被預訂
        const occupiedTables = this.reservations
            .filter(res => 
                res.reservationDate === date &&
                res.tableAssignment &&
                res.status !== '已取消' &&
                res.status !== '未到場' &&
                this.isTimeOverlapping(res.reservationTime, time)
            )
            .map(res => res.tableAssignment);

        return suitableTables.filter(table => !occupiedTables.includes(table.id));
    }

    /**
     * 檢查時間是否重疊
     */
    isTimeOverlapping(time1, time2) {
        const duration = this.settings.reservationDuration;
        const start1 = new Date(`2000-01-01 ${time1}`);
        const end1 = new Date(start1.getTime() + duration * 60000);
        const start2 = new Date(`2000-01-01 ${time2}`);
        const end2 = new Date(start2.getTime() + duration * 60000);

        return start1 < end2 && start2 < end1;
    }

    /**
     * 分配桌位
     */
    assignTable(partySize, date, time) {
        const availableTables = this.getAvailableTables(date, time, partySize);
        
        if (availableTables.length === 0) {
            return null;
        }

        // 選擇最適合的桌子（容量最接近用餐人數）
        availableTables.sort((a, b) => a.capacity - b.capacity);
        return availableTables[0].id;
    }

    /**
     * 加入等候名單
     */
    addToWaitingList(reservationData) {
        const waitingItem = {
            id: this.generateWaitingId(),
            customerName: reservationData.customerName,
            phone: reservationData.phone,
            partySize: reservationData.partySize,
            preferredDate: reservationData.date,
            preferredTime: reservationData.time,
            notes: reservationData.notes || '',
            createdAt: new Date().toISOString(),
            priority: this.getCustomerType(reservationData.phone) === 'VIP' ? 'high' : 'normal'
        };

        this.waitingList.push(waitingItem);
        
        return {
            success: false,
            waitingListItem: waitingItem,
            message: '該時段已滿，已為您加入等候名單'
        };
    }

    /**
     * 取得客戶類型
     */
    getCustomerType(phone) {
        const customer = this.customers.get(phone);
        if (!customer) return '新客戶';
        
        if (customer.vip) return 'VIP';
        if (customer.visitCount >= 5) return '常客';
        if (customer.visitCount >= 1) return '回頭客';
        return '新客戶';
    }

    /**
     * 更新客戶記錄
     */
    updateCustomerRecord(phone, name) {
        if (!this.customers.has(phone)) {
            this.customers.set(phone, {
                name: name,
                phone: phone,
                email: '',
                visitCount: 0,
                totalSpent: 0,
                averageSpent: 0,
                lastVisit: null,
                preferences: [],
                allergies: [],
                vip: false,
                birthday: '',
                notes: '',
                noShowCount: 0
            });
        }
    }

    /**
     * 確認訂位
     */
    confirmReservation(reservationId) {
        const reservation = this.reservations.find(res => res.id === reservationId);
        if (!reservation) {
            throw new Error('找不到訂位記錄');
        }

        if (reservation.status === '已確認') {
            throw new Error('訂位已經確認過了');
        }

        reservation.status = '已確認';
        reservation.confirmedAt = new Date().toISOString();

        // 同步到 Notion
        this.updateReservationInNotion(reservation);

        return reservation;
    }

    /**
     * 取消訂位
     */
    cancelReservation(reservationId, reason = '') {
        const reservation = this.reservations.find(res => res.id === reservationId);
        if (!reservation) {
            throw new Error('找不到訂位記錄');
        }

        if (reservation.status === '已取消') {
            throw new Error('訂位已經取消過了');
        }

        reservation.status = '已取消';
        reservation.cancelledAt = new Date().toISOString();
        reservation.cancellationReason = reason;

        // 同步到 Notion
        this.updateReservationInNotion(reservation);

        // 檢查等候名單是否有人可以遞補
        this.checkWaitingListForReschedule(reservation);

        return reservation;
    }

    /**
     * 檢查等候名單遞補
     */
    checkWaitingListForReschedule(cancelledReservation) {
        const suitable = this.waitingList.filter(item => 
            item.preferredDate === cancelledReservation.reservationDate &&
            item.partySize <= this.getTableCapacity(cancelledReservation.tableAssignment) &&
            this.isTimeClose(item.preferredTime, cancelledReservation.reservationTime)
        );

        if (suitable.length > 0) {
            // 按優先級排序
            suitable.sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (b.priority === 'high' && a.priority !== 'high') return 1;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

            const selected = suitable[0];
            
            // 建立新訂位
            const newReservation = {
                id: this.generateReservationId(),
                customerName: selected.customerName,
                phone: selected.phone,
                partySize: selected.partySize,
                reservationDate: selected.preferredDate,
                reservationTime: cancelledReservation.reservationTime,
                tableAssignment: cancelledReservation.tableAssignment,
                status: '待確認',
                notes: selected.notes,
                createdAt: new Date().toISOString(),
                source: '等候名單遞補',
                specialRequests: [],
                customerType: this.getCustomerType(selected.phone)
            };

            this.reservations.push(newReservation);
            
            // 從等候名單移除
            this.waitingList = this.waitingList.filter(item => item.id !== selected.id);

            return newReservation;
        }

        return null;
    }

    /**
     * 取得桌子容量
     */
    getTableCapacity(tableId) {
        const capacities = {
            '前右2': 2, '前左2': 2, '方6': 6, '方4': 4, '圓3': 3, '後2': 2
        };
        return capacities[tableId] || 0;
    }

    /**
     * 檢查時間是否接近
     */
    isTimeClose(time1, time2, toleranceMinutes = 60) {
        const t1 = new Date(`2000-01-01 ${time1}`);
        const t2 = new Date(`2000-01-01 ${time2}`);
        const diff = Math.abs(t1.getTime() - t2.getTime());
        return diff <= toleranceMinutes * 60000;
    }

    /**
     * 客戶到場
     */
    markAsArrived(reservationId) {
        const reservation = this.reservations.find(res => res.id === reservationId);
        if (!reservation) {
            throw new Error('找不到訂位記錄');
        }

        reservation.status = '已到場';
        reservation.arrivedAt = new Date().toISOString();

        // 更新客戶記錄
        const customer = this.customers.get(reservation.phone);
        if (customer) {
            customer.visitCount++;
            customer.lastVisit = new Date().toISOString().split('T')[0];
        }

        return reservation;
    }

    /**
     * 標記未到場
     */
    markAsNoShow(reservationId) {
        const reservation = this.reservations.find(res => res.id === reservationId);
        if (!reservation) {
            throw new Error('找不到訂位記錄');
        }

        reservation.status = '未到場';
        reservation.noShowAt = new Date().toISOString();

        // 更新客戶記錄
        const customer = this.customers.get(reservation.phone);
        if (customer) {
            customer.noShowCount++;
            
            // 如果未到場次數過多，加入黑名單
            if (customer.noShowCount >= this.settings.noShowPenalty) {
                this.addToBlacklist(reservation.phone, '多次未到場');
            }
        }

        return reservation;
    }

    /**
     * 加入黑名單
     */
    addToBlacklist(phone, reason) {
        if (!this.isBlacklisted(phone)) {
            this.blacklist.push({
                phone: phone,
                reason: reason,
                addedAt: new Date().toISOString()
            });
        }
    }

    /**
     * 檢查是否在黑名單
     */
    isBlacklisted(phone) {
        return this.blacklist.some(item => item.phone === phone);
    }

    /**
     * 搜尋訂位
     */
    searchReservations(criteria) {
        return this.reservations.filter(reservation => {
            if (criteria.customerName && !reservation.customerName.includes(criteria.customerName)) {
                return false;
            }
            if (criteria.phone && !reservation.phone.includes(criteria.phone)) {
                return false;
            }
            if (criteria.date && reservation.reservationDate !== criteria.date) {
                return false;
            }
            if (criteria.status && reservation.status !== criteria.status) {
                return false;
            }
            if (criteria.tableAssignment && reservation.tableAssignment !== criteria.tableAssignment) {
                return false;
            }
            return true;
        });
    }

    /**
     * 取得今日訂位
     */
    getTodayReservations() {
        const today = new Date().toISOString().split('T')[0];
        return this.reservations
            .filter(res => res.reservationDate === today)
            .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
    }

    /**
     * 取得即將到來的訂位
     */
    getUpcomingReservations(days = 7) {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + days);

        return this.reservations
            .filter(res => {
                const resDate = new Date(res.reservationDate);
                return resDate >= today && resDate <= endDate && res.status !== '已取消';
            })
            .sort((a, b) => {
                const dateCompare = a.reservationDate.localeCompare(b.reservationDate);
                if (dateCompare !== 0) return dateCompare;
                return a.reservationTime.localeCompare(b.reservationTime);
            });
    }

    /**
     * 取得訂位統計
     */
    getReservationStatistics() {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);

        const stats = {
            today: {
                total: 0,
                confirmed: 0,
                pending: 0,
                arrived: 0,
                noShow: 0,
                cancelled: 0
            },
            thisMonth: {
                total: 0,
                confirmed: 0,
                cancelled: 0,
                noShow: 0,
                avgPartySize: 0
            },
            overall: {
                totalReservations: this.reservations.length,
                totalCustomers: this.customers.size,
                vipCustomers: Array.from(this.customers.values()).filter(c => c.vip).length,
                waitingListCount: this.waitingList.length,
                blacklistCount: this.blacklist.length
            }
        };

        // 今日統計
        const todayReservations = this.reservations.filter(res => res.reservationDate === today);
        stats.today.total = todayReservations.length;
        stats.today.confirmed = todayReservations.filter(res => res.status === '已確認').length;
        stats.today.pending = todayReservations.filter(res => res.status === '待確認').length;
        stats.today.arrived = todayReservations.filter(res => res.status === '已到場').length;
        stats.today.noShow = todayReservations.filter(res => res.status === '未到場').length;
        stats.today.cancelled = todayReservations.filter(res => res.status === '已取消').length;

        // 本月統計
        const thisMonthReservations = this.reservations.filter(res => res.reservationDate.startsWith(thisMonth));
        stats.thisMonth.total = thisMonthReservations.length;
        stats.thisMonth.confirmed = thisMonthReservations.filter(res => res.status === '已確認' || res.status === '已到場').length;
        stats.thisMonth.cancelled = thisMonthReservations.filter(res => res.status === '已取消').length;
        stats.thisMonth.noShow = thisMonthReservations.filter(res => res.status === '未到場').length;
        
        if (thisMonthReservations.length > 0) {
            stats.thisMonth.avgPartySize = thisMonthReservations.reduce((sum, res) => sum + res.partySize, 0) / thisMonthReservations.length;
        }

        return stats;
    }

    /**
     * 產生訂位編號
     */
    generateReservationId() {
        const today = new Date();
        const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
        const count = this.reservations.filter(res => res.id.includes(dateStr)).length + 1;
        return `RES${dateStr}${count.toString().padStart(3, '0')}`;
    }

    /**
     * 產生等候編號
     */
    generateWaitingId() {
        const count = this.waitingList.length + 1;
        return `WAIT${count.toString().padStart(3, '0')}`;
    }

    /**
     * 設定通知系統
     */
    setupNotifications() {
        // 每小時檢查一次即將到來的訂位
        setInterval(() => {
            this.checkUpcomingReservations();
        }, 3600000); // 1小時
    }

    /**
     * 檢查即將到來的訂位
     */
    checkUpcomingReservations() {
        const now = new Date();
        const reminderTime = new Date(now.getTime() + this.settings.reminderHours * 3600000);
        
        const upcomingReservations = this.reservations.filter(res => {
            if (res.status !== '已確認') return false;
            
            const resDateTime = new Date(`${res.reservationDate} ${res.reservationTime}`);
            return resDateTime <= reminderTime && resDateTime > now;
        });

        return upcomingReservations;
    }

    /**
     * 匯出訂位報告
     */
    exportReservationReport(format = 'json') {
        const report = {
            reservations: this.reservations,
            customers: Array.from(this.customers.entries()).map(([phone, data]) => ({ phone, ...data })),
            waitingList: this.waitingList,
            statistics: this.getReservationStatistics(),
            settings: this.settings,
            generatedAt: new Date().toISOString()
        };

        if (format === 'csv') {
            return this.convertReservationsToCSV(report);
        }

        return JSON.stringify(report, null, 2);
    }

    /**
     * 轉換為CSV格式
     */
    convertReservationsToCSV(data) {
        const csvLines = [];
        
        // 訂位記錄
        csvLines.push('訂位人,訂位時間,訂位人數,聯絡電話,桌況管理,訂位狀態');
        data.reservations.forEach(res => {
            csvLines.push(`${res.customerName},${res.reservationDate} ${res.reservationTime},${res.partySize},${res.phone},${res.tableAssignment || ''},${res.status}`);
        });
        
        return csvLines.join('\n');
    }

    /**
     * 同步預約到 Notion
     */
    async syncReservationToNotion(reservation) {
        if (!this.notionManager) {
            console.warn('Notion 管理器未初始化');
            return;
        }

        try {
            const notionReservation = {
                '訂位人': { title: [{ text: { content: reservation.customerName } }] },
                '聯絡電話': { phone_number: reservation.phone },
                '訂位人數': { number: reservation.partySize },
                '訂位日期': { date: { start: reservation.reservationDate } },
                '訂位時間': { rich_text: [{ text: { content: reservation.reservationTime } }] },
                '桌號': { rich_text: [{ text: { content: reservation.tableAssignment || '' } }] },
                '狀態': { select: { name: reservation.status } },
                '備註': { rich_text: [{ text: { content: reservation.notes || '' } }] },
                '建立時間': { date: { start: reservation.createdAt } },
                '來源': { select: { name: reservation.source } },
                '客戶類型': { select: { name: reservation.customerType } }
            };

            const result = await this.notionManager.createRecord('reservations', notionReservation);
            console.log('預約已同步到 Notion:', result);
            
            // 儲存 Notion ID 以便後續更新
            reservation.notionId = result.id;
            
        } catch (error) {
            console.error('同步預約到 Notion 失敗:', error);
        }
    }

    /**
     * 更新 Notion 中的預約
     */
    async updateReservationInNotion(reservation) {
        if (!this.notionManager || !reservation.notionId) {
            console.warn('Notion 管理器未初始化或預約沒有 Notion ID');
            return;
        }

        try {
            const notionReservation = {
                '狀態': { select: { name: reservation.status } },
                '桌號': { rich_text: [{ text: { content: reservation.tableAssignment || '' } }] },
                '備註': { rich_text: [{ text: { content: reservation.notes || '' } }] },
                '更新時間': { date: { start: new Date().toISOString() } }
            };

            const result = await this.notionManager.updateRecord('reservations', reservation.notionId, notionReservation);
            console.log('預約已在 Notion 中更新:', result);
            
        } catch (error) {
            console.error('更新 Notion 中的預約失敗:', error);
        }
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReservationManager;
}
