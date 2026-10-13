import {
  TableItem,
  TableSession,
  MenuItem,
  Customer,
  Staff,
  ShiftRecord,
  CashTransaction,
  AuditLog,
  PricingRule,
  SystemSettings,
} from '../types';

const STORAGE_KEYS = {
  TABLES: 'thanhlong_tables_v3',
  SESSIONS: 'thanhlong_sessions_v3',
  MENU: 'thanhlong_menu_v1',
  CUSTOMERS: 'thanhlong_customers_v1',
  STAFF: 'thanhlong_staff_v1',
  SHIFTS: 'thanhlong_shifts_v1',
  TRANSACTIONS: 'thanhlong_transactions_v1',
  AUDIT_LOGS: 'thanhlong_audit_logs_v1',
  PRICING: 'thanhlong_pricing_v1',
  SETTINGS: 'thanhlong_settings_v2',
  CURRENT_USER: 'thanhlong_current_user_v1',
};

// Seed Tables (Đúng 6 bàn chuẩn quán)
const DEFAULT_TABLES: TableItem[] = [
  { id: 'tbl-1', code: 'Bàn 01', name: 'Aileex 9020 Silver Pool', type: 'POOL', hourlyRate: 60000, status: 'PLAYING', currentSessionId: 'sess-1', assignedStaffName: 'Lê Hoàng Nam', area: 'Khu Sảnh Lỗ' },
  { id: 'tbl-2', code: 'Bàn 02', name: 'Aileex 9020 Silver Pool', type: 'POOL', hourlyRate: 60000, status: 'AVAILABLE', area: 'Khu Sảnh Lỗ' },
  { id: 'tbl-3', code: 'Bàn 03', name: 'Aileex King Gold Pool', type: 'POOL', hourlyRate: 60000, status: 'PLAYING', currentSessionId: 'sess-2', assignedStaffName: 'Vũ Minh Tuấn', area: 'Khu Sảnh Lỗ' },
  { id: 'tbl-4', code: 'Bàn 04', name: 'Hollywood Pro Carom 3C', type: 'CAROM', hourlyRate: 70000, status: 'AVAILABLE', area: 'Khu Carom' },
  { id: 'tbl-5', code: 'Bàn 05', name: 'Hollywood Pro Carom 3C', type: 'CAROM', hourlyRate: 70000, status: 'WAITING_PAYMENT', currentSessionId: 'sess-3', assignedStaffName: 'Lê Hoàng Nam', area: 'Khu Carom' },
  { id: 'tbl-6', code: 'VIP 01', name: 'Phòng VIP Hoàng Gia', type: 'VIP', hourlyRate: 110000, status: 'PLAYING', currentSessionId: 'sess-4', assignedStaffName: 'Trần Quốc Huy', area: 'Phòng VIP Lầu 1' },
];

// Helper to get time ago in ISO
const getTimeAgo = (minutesAgo: number) => {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
};

// Seed Active & Past Sessions
const DEFAULT_SESSIONS: TableSession[] = [
  {
    id: 'sess-1',
    tableId: 'tbl-1',
    tableCode: 'Bàn 01',
    tableType: 'POOL',
    startTime: getTimeAgo(85), // 1 hr 25 mins ago
    status: 'ACTIVE',
    appliedHourlyRate: 60000,
    pauseRecords: [],
    customerId: 'cust-1',
    customerName: 'Anh Tuấn (VIP)',
    customerPhone: '0908123456',
    customerTier: 'GOLD',
    staffId: 'staff-3',
    staffName: 'Lê Hoàng Nam',
    orders: [
      { id: 'ord-101', menuItemId: 'menu-1', name: 'Heineken Silver (Lon)', price: 28000, costPrice: 18000, quantity: 4, unit: 'Lon', category: 'BEER', createdAt: getTimeAgo(60) },
      { id: 'ord-102', menuItemId: 'menu-8', name: 'Bò khô cháy tỏi vắt chanh', price: 65000, costPrice: 35000, quantity: 1, unit: 'Đĩa', category: 'SNACK', createdAt: getTimeAgo(50) },
    ],
  },
  {
    id: 'sess-2',
    tableId: 'tbl-3',
    tableCode: 'Bàn 03',
    tableType: 'POOL',
    startTime: getTimeAgo(45), // 45 mins ago
    status: 'ACTIVE',
    appliedHourlyRate: 60000,
    pauseRecords: [],
    staffId: 'staff-4',
    staffName: 'Vũ Minh Tuấn',
    orders: [
      { id: 'ord-201', menuItemId: 'menu-4', name: 'Bò Húc (Red Bull)', price: 22000, costPrice: 13000, quantity: 2, unit: 'Lon', category: 'SOFT_DRINK', createdAt: getTimeAgo(40) },
      { id: 'ord-202', menuItemId: 'menu-6', name: 'Cà phê sữa đá pha phin', price: 25000, costPrice: 9000, quantity: 2, unit: 'Ly', category: 'COFFEE', createdAt: getTimeAgo(35) },
    ],
  },
  {
    id: 'sess-3',
    tableId: 'tbl-4',
    tableCode: 'Bàn 04',
    tableType: 'POOL',
    startTime: getTimeAgo(110), // 1 hr 50 mins ago
    status: 'WAITING_PAYMENT',
    appliedHourlyRate: 60000,
    pauseRecords: [],
    customerId: 'cust-2',
    customerName: 'Hoàng Long',
    customerPhone: '0912334455',
    customerTier: 'SILVER',
    staffId: 'staff-3',
    staffName: 'Lê Hoàng Nam',
    orders: [
      { id: 'ord-301', menuItemId: 'menu-2', name: 'Tiger Crystal (Lon)', price: 25000, costPrice: 17000, quantity: 6, unit: 'Lon', category: 'BEER', createdAt: getTimeAgo(90) },
      { id: 'ord-302', menuItemId: 'menu-10', name: 'Mì xào bò trứng ốp la', price: 45000, costPrice: 22000, quantity: 2, unit: 'Dĩa', category: 'FAST_FOOD', createdAt: getTimeAgo(80) },
      { id: 'ord-303', menuItemId: 'menu-9', name: 'Khoai tây chiên lắc phô mai', price: 40000, costPrice: 18000, quantity: 1, unit: 'Dĩa', category: 'SNACK', createdAt: getTimeAgo(70) },
    ],
  },
  {
    id: 'sess-4',
    tableId: 'tbl-7',
    tableCode: 'Bàn 07',
    tableType: 'POOL',
    startTime: getTimeAgo(25),
    status: 'ACTIVE',
    appliedHourlyRate: 60000,
    pauseRecords: [],
    staffId: 'staff-4',
    staffName: 'Vũ Minh Tuấn',
    orders: [
      { id: 'ord-401', menuItemId: 'menu-3', name: 'Nước suối Aquafina 500ml', price: 12000, costPrice: 5000, quantity: 2, unit: 'Chai', category: 'WATER', createdAt: getTimeAgo(20) },
    ],
  },
  {
    id: 'sess-5',
    tableId: 'tbl-9',
    tableCode: 'Bàn 09',
    tableType: 'CAROM',
    startTime: getTimeAgo(140), // 2 hr 20 mins ago
    status: 'ACTIVE',
    appliedHourlyRate: 70000,
    pauseRecords: [
      { pausedAt: getTimeAgo(90), resumedAt: getTimeAgo(75), reason: 'Đợi cơ thủ đối thủ' }
    ],
    customerId: 'cust-3',
    customerName: 'Bác Ba Carom',
    customerPhone: '0988776655',
    customerTier: 'DIAMOND',
    staffId: 'staff-3',
    staffName: 'Lê Hoàng Nam',
    orders: [
      { id: 'ord-501', menuItemId: 'menu-5', name: 'Cà phê đen đá', price: 22000, costPrice: 8000, quantity: 2, unit: 'Ly', category: 'COFFEE', createdAt: getTimeAgo(120) },
      { id: 'ord-502', menuItemId: 'menu-11', name: 'Đậu phộng tỏi ớt', price: 20000, costPrice: 8000, quantity: 2, unit: 'Đĩa', category: 'SNACK', createdAt: getTimeAgo(100) },
    ],
  },
  {
    id: 'sess-6',
    tableId: 'tbl-12',
    tableCode: 'Bàn 12',
    tableType: 'CAROM',
    startTime: getTimeAgo(60),
    status: 'ACTIVE',
    appliedHourlyRate: 70000,
    pauseRecords: [],
    staffId: 'staff-4',
    staffName: 'Vũ Minh Tuấn',
    orders: [],
  },
  {
    id: 'sess-7',
    tableId: 'tbl-13',
    tableCode: 'VIP 01',
    tableType: 'VIP',
    startTime: getTimeAgo(95),
    status: 'ACTIVE',
    appliedHourlyRate: 110000,
    pauseRecords: [],
    customerId: 'cust-4',
    customerName: 'Giám đốc Trần Văn Thịnh',
    customerPhone: '0977889900',
    customerTier: 'DIAMOND',
    staffId: 'staff-2',
    staffName: 'Trần Quốc Huy',
    orders: [
      { id: 'ord-701', menuItemId: 'menu-1', name: 'Heineken Silver (Lon)', price: 28000, costPrice: 18000, quantity: 8, unit: 'Lon', category: 'BEER', createdAt: getTimeAgo(80) },
      { id: 'ord-702', menuItemId: 'menu-12', name: 'Trái cây thập cẩm đặc biệt', price: 120000, costPrice: 60000, quantity: 1, unit: 'Dĩa lớn', category: 'SNACK', createdAt: getTimeAgo(70) },
    ],
  },
  // Sample Completed Sessions Today for reporting & charts
  {
    id: 'sess-8',
    tableId: 'tbl-2',
    tableCode: 'Bàn 02',
    tableType: 'POOL',
    startTime: getTimeAgo(320),
    endTime: getTimeAgo(200),
    status: 'COMPLETED',
    appliedHourlyRate: 60000,
    pauseRecords: [],
    staffId: 'staff-3',
    staffName: 'Lê Hoàng Nam',
    cashierName: 'Lê Hoàng Nam',
    orders: [
      { id: 'ord-801', menuItemId: 'menu-2', name: 'Tiger Crystal (Lon)', price: 25000, costPrice: 17000, quantity: 4, unit: 'Lon', category: 'BEER', createdAt: getTimeAgo(300) },
    ],
    playedMinutes: 120,
    tableFee: 120000,
    ordersFee: 100000,
    discountAmount: 0,
    surcharge: 0,
    finalTotal: 220000,
    paymentMethod: 'CASH',
    completedAt: getTimeAgo(200),
  },
  {
    id: 'sess-9',
    tableId: 'tbl-10',
    tableCode: 'Bàn 10',
    tableType: 'CAROM',
    startTime: getTimeAgo(240),
    endTime: getTimeAgo(130),
    status: 'COMPLETED',
    appliedHourlyRate: 70000,
    pauseRecords: [],
    customerId: 'cust-1',
    customerName: 'Anh Tuấn (VIP)',
    customerPhone: '0908123456',
    customerTier: 'GOLD',
    staffId: 'staff-3',
    staffName: 'Lê Hoàng Nam',
    cashierName: 'Lê Hoàng Nam',
    orders: [
      { id: 'ord-901', menuItemId: 'menu-6', name: 'Cà phê sữa đá pha phin', price: 25000, costPrice: 9000, quantity: 2, unit: 'Ly', category: 'COFFEE', createdAt: getTimeAgo(220) },
      { id: 'ord-902', menuItemId: 'menu-10', name: 'Mì xào bò trứng ốp la', price: 45000, costPrice: 22000, quantity: 1, unit: 'Dĩa', category: 'FAST_FOOD', createdAt: getTimeAgo(200) },
    ],
    playedMinutes: 110,
    tableFee: 128333,
    ordersFee: 95000,
    discountAmount: 12833, // 10% Gold discount
    surcharge: 0,
    finalTotal: 210500,
    paymentMethod: 'BANK_TRANSFER',
    completedAt: getTimeAgo(130),
  },
];

// Seed Menu Items
const DEFAULT_MENU: MenuItem[] = [
  { id: 'menu-1', name: 'Heineken Silver (Lon 330ml)', category: 'BEER', price: 28000, costPrice: 18000, unit: 'Lon', stock: 120, minStockAlert: 24, isAvailable: true },
  { id: 'menu-2', name: 'Tiger Crystal (Lon 330ml)', category: 'BEER', price: 25000, costPrice: 17000, unit: 'Lon', stock: 96, minStockAlert: 24, isAvailable: true },
  { id: 'menu-3', name: 'Nước suối Aquafina 500ml', category: 'WATER', price: 12000, costPrice: 5000, unit: 'Chai', stock: 150, minStockAlert: 30, isAvailable: true },
  { id: 'menu-4', name: 'Bò Húc Thái (Red Bull)', category: 'SOFT_DRINK', price: 22000, costPrice: 13000, unit: 'Lon', stock: 45, minStockAlert: 20, isAvailable: true },
  { id: 'menu-5', name: 'Cà phê đen đá Robusta', category: 'COFFEE', price: 22000, costPrice: 8000, unit: 'Ly', stock: 100, minStockAlert: 15, isAvailable: true },
  { id: 'menu-6', name: 'Cà phê sữa đá pha phin', category: 'COFFEE', price: 25000, costPrice: 9000, unit: 'Ly', stock: 85, minStockAlert: 15, isAvailable: true },
  { id: 'menu-7', name: 'Sting dâu tây đỏ', category: 'SOFT_DRINK', price: 18000, costPrice: 10000, unit: 'Chai', stock: 60, minStockAlert: 20, isAvailable: true },
  { id: 'menu-8', name: 'Bò khô cháy tỏi vắt chanh', category: 'SNACK', price: 65000, costPrice: 35000, unit: 'Đĩa', stock: 35, minStockAlert: 10, isAvailable: true },
  { id: 'menu-9', name: 'Khoai tây chiên lắc phô mai', category: 'SNACK', price: 40000, costPrice: 18000, unit: 'Dĩa', stock: 40, minStockAlert: 10, isAvailable: true },
  { id: 'menu-10', name: 'Mì xào bò trứng ốp la', category: 'FAST_FOOD', price: 45000, costPrice: 22000, unit: 'Dĩa', stock: 50, minStockAlert: 15, isAvailable: true },
  { id: 'menu-11', name: 'Đậu phộng tỏi ớt rang giòn', category: 'SNACK', price: 20000, costPrice: 8000, unit: 'Đĩa', stock: 8, minStockAlert: 15, isAvailable: true }, // Low stock sample
  { id: 'menu-12', name: 'Trái cây thập cẩm VIP', category: 'SNACK', price: 120000, costPrice: 60000, unit: 'Dĩa lớn', stock: 15, minStockAlert: 5, isAvailable: true },
  { id: 'menu-13', name: 'Nem chua rán Hà Nội (8 cái)', category: 'FAST_FOOD', price: 50000, costPrice: 25000, unit: 'Đĩa', stock: 25, minStockAlert: 8, isAvailable: true },
  { id: 'menu-14', name: 'Thuốc lá Craven "A" đỏ', category: 'OTHER', price: 35000, costPrice: 28000, unit: 'Gói', stock: 40, minStockAlert: 10, isAvailable: true },
];

// Seed Customers & Members
const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'TL-8899',
    name: 'Anh Tuấn (VIP)',
    phone: '0908123456',
    tier: 'GOLD',
    points: 1450,
    prepaidBalance: 850000,
    totalSpent: 14500000,
    totalPlayHours: 85.5,
    createdAt: '2025-01-10T10:00:00Z',
    notes: 'Khách quen khu Pool, thích ngồi bàn 01 hoặc 03',
  },
  {
    id: 'cust-2',
    code: 'TL-5521',
    name: 'Hoàng Long',
    phone: '0912334455',
    tier: 'SILVER',
    points: 620,
    prepaidBalance: 120000,
    totalSpent: 6200000,
    totalPlayHours: 42.0,
    createdAt: '2025-03-15T14:30:00Z',
    notes: 'Hay chơi buổi chiều sau giờ làm',
  },
  {
    id: 'cust-3',
    code: 'TL-9999',
    name: 'Bác Ba Carom',
    phone: '0988776655',
    tier: 'DIAMOND',
    points: 3800,
    prepaidBalance: 2450000,
    totalSpent: 38000000,
    totalPlayHours: 210.0,
    createdAt: '2024-11-01T09:00:00Z',
    notes: 'Cao thủ Carom 3 băng, câu lạc bộ VIP',
  },
  {
    id: 'cust-4',
    code: 'TL-7777',
    name: 'Giám đốc Trần Văn Thịnh',
    phone: '0977889900',
    tier: 'DIAMOND',
    points: 4200,
    prepaidBalance: 5200000,
    totalSpent: 42000000,
    totalPlayHours: 160.0,
    createdAt: '2024-10-20T16:00:00Z',
    notes: 'Thường xuyên đặt phòng VIP chiêu đãi đối tác',
  },
  {
    id: 'cust-5',
    code: 'TL-2211',
    name: 'Nguyễn Văn Đạt',
    phone: '0933221144',
    tier: 'STANDARD',
    points: 120,
    prepaidBalance: 0,
    totalSpent: 1200000,
    totalPlayHours: 9.5,
    createdAt: '2026-02-12T19:00:00Z',
    notes: 'Hội viên mới đăng ký',
  },
];

// Seed Staff
const DEFAULT_STAFF: Staff[] = [
  { id: 'staff-1', code: 'NV-001', name: 'Nguyễn Thanh Long', phone: '0909000111', role: 'OWNER', isActive: true },
  { id: 'staff-2', code: 'NV-002', name: 'Trần Quốc Huy', phone: '0909222333', role: 'MANAGER', isActive: true },
  { id: 'staff-3', code: 'NV-003', name: 'Lê Hoàng Nam', phone: '0909444555', role: 'CASHIER', isActive: true },
  { id: 'staff-4', code: 'NV-004', name: 'Vũ Minh Tuấn', phone: '0909666777', role: 'WAITER', isActive: true },
];

// Seed Pricing Rules
const DEFAULT_PRICING: PricingRule[] = [
  { type: 'POOL', typeName: 'Bàn Lỗ (Pool 9-Ball / 8-Ball)', defaultHourlyRate: 60000, peakHourRate: 75000, weekendSurcharge: 10000, minimumMinutes: 15, roundingMinutes: 5 },
  { type: 'CAROM', typeName: 'Bàn Carom (Libre / 3 Băng)', defaultHourlyRate: 70000, peakHourRate: 85000, weekendSurcharge: 10000, minimumMinutes: 15, roundingMinutes: 5 },
  { type: 'VIP', typeName: 'Phòng VIP Riêng (A/C, Sofa)', defaultHourlyRate: 110000, peakHourRate: 130000, weekendSurcharge: 15000, minimumMinutes: 30, roundingMinutes: 5 },
  { type: 'SNOOKER', typeName: 'Bàn Snooker Thi Đấu', defaultHourlyRate: 90000, peakHourRate: 110000, weekendSurcharge: 10000, minimumMinutes: 30, roundingMinutes: 5 },
];

// Seed System Settings
const DEFAULT_SETTINGS: SystemSettings = {
  clubName: 'THANH LONG BILLIARDS',
  slogan: 'Đỉnh Cao Nghệ Thuật Cơ Thủ - Trải Nghiệm Chuẩn Thi Đấu',
  address: 'Số 188 Nguyễn Thị Thập, Phường Tân Quy, Quận 7, TP. Hồ Chí Minh',
  phone: '0909 888 999 - 028 3775 8888',
  wifiSsid: 'ThanhLong_Billiards_VIP',
  wifiPassword: 'thanhlong8888',
  bankName: 'MB',
  bankAccountNo: '999988889999',
  bankAccountName: 'THANH LONG BILLIARDS CLUB',
  peakHourStart: '18:00',
  peakHourEnd: '23:30',
  enableWeekendSurcharge: true,
  receiptHeader: 'CÂU LẠC BỘ BIDA THANH LONG',
  receiptFooter: 'Cảm ơn Quý Khách! Hẹn gặp lại Quý Cơ Thủ!',
  currency: 'VNĐ',
  isCloudSyncEnabled: false,
  theme: 'dark',
};

// Seed Current Shift
const DEFAULT_SHIFTS: ShiftRecord[] = [
  {
    id: 'shift-1',
    shiftName: 'Ca Chiều (15:00 - 22:00)',
    staffId: 'staff-3',
    staffName: 'Lê Hoàng Nam',
    startTime: getTimeAgo(180),
    status: 'OPEN',
    initialCash: 2000000, // 2 triệu tiền lẻ thối
    totalRevenue: 430500,
    tableRevenue: 248333,
    fnbRevenue: 195000,
    notes: 'Ca đông khách khu sảnh lỗ và phòng VIP',
  },
];

// Seed Cash Transactions
const DEFAULT_TRANSACTIONS: CashTransaction[] = [
  { id: 'tx-1', type: 'INCOME', category: 'BILL_COLLECTION', amount: 220000, description: 'Thu tiền hóa đơn Bàn 02', staffName: 'Lê Hoàng Nam', referenceId: 'sess-8', createdAt: getTimeAgo(200) },
  { id: 'tx-2', type: 'INCOME', category: 'BILL_COLLECTION', amount: 210500, description: 'Thu tiền chuyển khoản Bàn 10', staffName: 'Lê Hoàng Nam', referenceId: 'sess-9', createdAt: getTimeAgo(130) },
  { id: 'tx-3', type: 'INCOME', category: 'WALLET_TOPUP', amount: 1000000, description: 'Nạp ví hội viên Anh Tuấn (TL-8899)', staffName: 'Trần Quốc Huy', createdAt: getTimeAgo(260) },
  { id: 'tx-4', type: 'EXPENSE', category: 'FNB_IMPORT', amount: 850000, description: 'Nhập bổ sung 3 thùng bia Heineken Silver', staffName: 'Trần Quốc Huy', createdAt: getTimeAgo(300) },
  { id: 'tx-5', type: 'EXPENSE', category: 'ELECTRICITY_WATER', amount: 3500000, description: 'Tiền điện lạnh máy điều hòa tháng 9', staffName: 'Nguyễn Thanh Long', createdAt: getTimeAgo(1440) },
];

// Seed Audit Logs
const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', action: 'BẮT ĐẦU CA LÀM', details: 'Thu ngân Lê Hoàng Nam mở Ca Chiều với 2.000.000đ tiền mặt', staffName: 'Lê Hoàng Nam', role: 'CASHIER', timestamp: getTimeAgo(180) },
  { id: 'log-2', action: 'MỞ BÀN', details: 'Mở Bàn 01 cho khách hội viên Anh Tuấn (GOLD)', staffName: 'Lê Hoàng Nam', role: 'CASHIER', timestamp: getTimeAgo(85) },
  { id: 'log-3', action: 'ORDER MÓN', details: 'Thêm 4 lon Heineken Silver vào Bàn 01', staffName: 'Lê Hoàng Nam', role: 'CASHIER', timestamp: getTimeAgo(60) },
  { id: 'log-4', action: 'THANH TOÁN HÓA ĐƠN', details: 'Hoàn tất thanh toán Bàn 02 số tiền 220.000đ', staffName: 'Lê Hoàng Nam', role: 'CASHIER', timestamp: getTimeAgo(200) },
];

/**
 * Storage Engine with LocalStorage and fallback
 */
export const StorageService = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage exceeded or blocked
    }
  },

  // Tables
  getTables(): TableItem[] {
    return this.get(STORAGE_KEYS.TABLES, DEFAULT_TABLES);
  },
  saveTables(tables: TableItem[]): void {
    this.set(STORAGE_KEYS.TABLES, tables);
  },

  // Sessions
  getSessions(): TableSession[] {
    return this.get(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS);
  },
  saveSessions(sessions: TableSession[]): void {
    this.set(STORAGE_KEYS.SESSIONS, sessions);
  },

  // Menu
  getMenu(): MenuItem[] {
    return this.get(STORAGE_KEYS.MENU, DEFAULT_MENU);
  },
  saveMenu(menu: MenuItem[]): void {
    this.set(STORAGE_KEYS.MENU, menu);
  },

  // Customers
  getCustomers(): Customer[] {
    return this.get(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },
  saveCustomers(customers: Customer[]): void {
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
  },

  // Staff
  getStaff(): Staff[] {
    return this.get(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  },
  saveStaff(staff: Staff[]): void {
    this.set(STORAGE_KEYS.STAFF, staff);
  },

  // Pricing
  getPricingRules(): PricingRule[] {
    return this.get(STORAGE_KEYS.PRICING, DEFAULT_PRICING);
  },
  savePricingRules(rules: PricingRule[]): void {
    this.set(STORAGE_KEYS.PRICING, rules);
  },

  // Settings
  getSettings(): SystemSettings {
    return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: SystemSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // Shifts
  getShifts(): ShiftRecord[] {
    return this.get(STORAGE_KEYS.SHIFTS, DEFAULT_SHIFTS);
  },
  saveShifts(shifts: ShiftRecord[]): void {
    this.set(STORAGE_KEYS.SHIFTS, shifts);
  },

  // Transactions
  getTransactions(): CashTransaction[] {
    return this.get(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },
  saveTransactions(txs: CashTransaction[]): void {
    this.set(STORAGE_KEYS.TRANSACTIONS, txs);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.get(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  },
  saveAuditLogs(logs: AuditLog[]): void {
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Current Active User/Role
  getCurrentStaff(): Staff {
    return this.get(STORAGE_KEYS.CURRENT_USER, DEFAULT_STAFF[0]); // Default to Owner
  },
  setCurrentStaff(staff: Staff): void {
    this.set(STORAGE_KEYS.CURRENT_USER, staff);
  },

  // Export Complete Backup JSON
  exportAllData(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tables: this.getTables(),
      sessions: this.getSessions(),
      menu: this.getMenu(),
      customers: this.getCustomers(),
      staff: this.getStaff(),
      pricing: this.getPricingRules(),
      settings: this.getSettings(),
      shifts: this.getShifts(),
      transactions: this.getTransactions(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import Backup JSON
  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.tables) this.saveTables(data.tables);
      if (data.sessions) this.saveSessions(data.sessions);
      if (data.menu) this.saveMenu(data.menu);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.staff) this.saveStaff(data.staff);
      if (data.pricing) this.savePricingRules(data.pricing);
      if (data.settings) this.saveSettings(data.settings);
      if (data.shifts) this.saveShifts(data.shifts);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.auditLogs) this.saveAuditLogs(data.auditLogs);
      return true;
    } catch {
      return false;
    }
  },

  // Reset to Factory Demo State
  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.MENU);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.PRICING);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
};
