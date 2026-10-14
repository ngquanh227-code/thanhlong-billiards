// Types for Thanh Long Billiards Management System

export type TableType = 'POOL' | 'CAROM' | 'VIP' | 'SNOOKER';

export type TableStatus = 'AVAILABLE' | 'PLAYING' | 'WAITING_PAYMENT' | 'MAINTENANCE';

export type MemberTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'DIAMOND';

export type StaffRole = 'ADMIN' | 'STAFF' | 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER';

export const isAdminRole = (role: StaffRole | string): boolean => {
  return role === 'ADMIN' || role === 'OWNER' || role === 'MANAGER';
};

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MEMBER_WALLET' | 'SPLIT';

export interface TableItem {
  id: string;
  code: string; // e.g. "Bàn 01", "VIP 02"
  name: string;
  type: TableType;
  hourlyRate: number; // base hourly rate in VND
  status: TableStatus;
  currentSessionId?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  area: string; // "Tầng 1 - Sảnh chính", "Tầng 2 - Phòng VIP", "Khu Carom"
  notes?: string;
}

export interface SessionPauseRecord {
  pausedAt: string; // ISO string
  resumedAt?: string; // ISO string
  reason?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  category: string;
  notes?: string;
  createdAt: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  tableCode: string;
  tableType: TableType;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  status: 'ACTIVE' | 'PAUSED' | 'WAITING_PAYMENT' | 'COMPLETED' | 'CANCELLED';
  appliedHourlyRate: number;
  pauseRecords: SessionPauseRecord[];
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerTier?: MemberTier;
  staffId: string;
  staffName: string;
  orders: OrderItem[];
  // Calculated at checkout or cached
  playedMinutes?: number;
  tableFee?: number;
  ordersFee?: number;
  surcharge?: number;
  discountAmount?: number;
  discountReason?: string;
  finalTotal?: number;
  paymentMethod?: PaymentMethod;
  paymentDetails?: {
    cashReceived?: number;
    cashChange?: number;
    bankTransferAmount?: number;
    walletDeducted?: number;
    bankTransactionRef?: string;
  };
  cashierId?: string;
  cashierName?: string;
  completedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'BEER' | 'SOFT_DRINK' | 'WATER' | 'COFFEE' | 'SNACK' | 'FAST_FOOD' | 'OTHER';
  price: number;
  costPrice: number;
  unit: string;
  stock: number;
  minStockAlert: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface Customer {
  id: string;
  code: string; // e.g. "TL-8899"
  name: string;
  phone: string;
  tier: MemberTier;
  points: number;
  prepaidBalance: number; // Ví trả trước
  totalSpent: number;
  totalPlayHours: number;
  createdAt: string;
  notes?: string;
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  avatar?: string;
}

export interface ShiftRecord {
  id: string;
  shiftName: string; // "Ca Sáng (08:00 - 15:00)", "Ca Chiều (15:00 - 22:00)", "Ca Đêm (22:00 - 04:00)"
  staffId: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  status: 'OPEN' | 'CLOSED';
  initialCash: number; // Tiền mặt đầu ca
  expectedCashTotal?: number; // Tiền mặt lý thuyết hệ thống thu
  actualEndingCash?: number; // Tiền mặt thực tế đếm cuối ca
  cashDifference?: number; // Chênh lệch thừa / thiếu
  totalRevenue?: number;
  tableRevenue?: number;
  fnbRevenue?: number;
  notes?: string;
}

export interface CashTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'BILL_COLLECTION' | 'WALLET_TOPUP' | 'FNB_IMPORT' | 'ELECTRICITY_WATER' | 'MAINTENANCE' | 'SALARY' | 'OTHER';
  amount: number;
  description: string;
  staffName: string;
  referenceId?: string; // Bill ID or Supplier Invoice ID
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  staffName: string;
  role: StaffRole;
  timestamp: string;
}

export interface PricingRule {
  type: TableType;
  typeName: string;
  defaultHourlyRate: number;
  peakHourRate: number; // Applied during peak hours
  weekendSurcharge: number; // VND added per hour on weekend
  minimumMinutes: number; // e.g. 15 minutes
  roundingMinutes: 1 | 5 | 10 | 15; // Rounding strategy
}

export interface SystemSettings {
  clubName: string;
  slogan: string;
  address: string;
  phone: string;
  wifiSsid: string;
  wifiPassword: string;
  bankName: string; // e.g. "MB Bank", "Vietcombank"
  bankAccountNo: string;
  bankAccountName: string;
  peakHourStart: string; // e.g. "18:00"
  peakHourEnd: string; // e.g. "23:00"
  enablePeakHourRate: boolean;
  enableWeekendSurcharge: boolean;
  weekendSurchargePerHour: number; // VND/hour
  // Member tier discounts (%)
  silverDiscountPercent: number; // default 5
  goldDiscountPercent: number; // default 10
  diamondDiscountPercent: number; // default 15
  pointsPerVnd: number; // default 10000 (10.000đ = 1 point)
  // Happy hour promotions
  happyHourEnabled: boolean;
  happyHourDiscountPercent: number; // default 15
  happyHourStart: string; // e.g. "12:00"
  happyHourEnd: string; // e.g. "17:00"
  // Grace period (minutes before charging table fee)
  gracePeriodMinutes: number; // default 5
  receiptHeader: string;
  receiptFooter: string;
  currency: string;
  // Supabase cloud integration
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isCloudSyncEnabled: boolean;
  theme?: 'dark' | 'light';
}
