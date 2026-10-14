import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import {
  TableItem,
  TableSession,
  MenuItem,
  Customer,
  Staff,
  PricingRule,
  SystemSettings,
  ShiftRecord,
  CashTransaction,
  AuditLog,
  OrderItem,
  PaymentMethod,
  TableType,
  TableStatus,
} from '../types';
import { StorageService } from '../services/storage';
import { calculateTableFee } from '../services/calculation';
import { sounds } from '../services/sound';
import { isSupabaseConfigured, SupabaseSync } from '../services/supabase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  tables: TableItem[];
  sessions: TableSession[];
  menu: MenuItem[];
  customers: Customer[];
  staff: Staff[];
  pricingRules: PricingRule[];
  settings: SystemSettings;
  shifts: ShiftRecord[];
  transactions: CashTransaction[];
  auditLogs: AuditLog[];
  currentStaff: Staff;
  isAdmin: boolean;
  currentTime: Date;
  toasts: ToastMessage[];
  currentBranch: string;
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  isCloudSyncActive: boolean;

  // Actions
  toggleRole: () => void;
  verifyAdminPassword: (password: string) => boolean;
  loginAsAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  switchCurrentStaff: (staffId: string) => void;
  setCurrentBranch: (branch: string) => void;
  toggleSound: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Table Management Actions (Thêm/Sửa/Xóa số lượng bàn)
  addTable: (data: { code: string; name: string; type: TableType; hourlyRate: number; area: string; notes?: string }) => TableItem;
  updateTable: (table: TableItem) => void;
  deleteTable: (tableId: string) => boolean;

  // Table & Session Actions
  openTable: (tableId: string, customerId?: string, staffId?: string, customRate?: number) => TableSession | null;
  pauseTable: (tableId: string, reason?: string) => void;
  resumeTable: (tableId: string) => void;
  transferTable: (fromTableId: string, toTableId: string) => boolean;
  mergeTables: (sourceTableId: string, targetTableId: string) => boolean;
  addOrdersToTable: (
    tableId: string,
    itemsToAdd: { item: MenuItem; quantity: number; notes?: string }[]
  ) => boolean;
  addOrderToTable: (tableId: string, menuItem: MenuItem, quantity: number, notes?: string) => boolean;
  removeOrderItem: (tableId: string, orderItemId: string) => void;
  updateOrderItemQty: (tableId: string, orderItemId: string, delta: number) => void;
  completeCheckout: (
    sessionId: string,
    paymentMethod: PaymentMethod,
    discountAmount: number,
    surcharge: number,
    cashReceived: number,
    cashChange: number,
    bankRef?: string,
    pointsRedeemed?: number
  ) => boolean;
  setTableMaintenance: (tableId: string, isMaintenance: boolean, notes?: string) => void;

  // Active Session Helper
  getActiveSessionForTable: (tableId: string) => TableSession | undefined;

  // Customer Actions
  addCustomer: (data: Omit<Customer, 'id' | 'code' | 'points' | 'totalSpent' | 'totalPlayHours' | 'createdAt'>) => Customer;
  depositCustomerWallet: (customerId: string, amount: number, bonusAmount?: number) => void;

  // Menu & Stock Actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => MenuItem;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (menuItemId: string) => boolean;
  importStock: (menuItemId: string, addedStock: number, unitCost: number, supplierNotes?: string) => void;

  // Shift & Cashflow Actions
  startNewShift: (shiftName: string, initialCash: number) => void;
  closeCurrentShift: (actualEndingCash: number, notes?: string) => void;
  addCashTransaction: (type: 'INCOME' | 'EXPENSE', category: CashTransaction['category'], amount: number, description: string) => void;

  // System Settings & Pricing
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  updatePricingRule: (rule: PricingRule) => void;
  resetAllDemoData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableItem[]>(() => StorageService.getTables());
  const [sessions, setSessions] = useState<TableSession[]>(() => StorageService.getSessions());
  const [menu, setMenu] = useState<MenuItem[]>(() => StorageService.getMenu());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [staff, setStaff] = useState<Staff[]>(() => StorageService.getStaff());
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(() => StorageService.getPricingRules());
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());
  const [shifts, setShifts] = useState<ShiftRecord[]>(() => StorageService.getShifts());
  const [transactions, setTransactions] = useState<CashTransaction[]>(() => StorageService.getTransactions());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [currentStaff, setCurrentStaff] = useState<Staff>(() => StorageService.getCurrentStaff());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('Chi nhánh 1 - Quận 7 (Trụ sở chính)');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (StorageService.getSettings()?.theme as 'dark' | 'light') || 'light';
  });

  // Sync sound setting
  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Sync theme setting
  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    setSettings((prev) => {
      const updated = { ...prev, theme: newTheme };
      StorageService.saveSettings(updated);
      return updated;
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    sounds.playClick();
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Real-time second tick for table clocks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Supabase Realtime Cloud Sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Pull initial cloud state
    SupabaseSync.pullAll().then((cloudData) => {
      if (cloudData) {
        if (cloudData.tables && cloudData.tables.length > 0) {
          setTables(cloudData.tables);
          StorageService.saveTables(cloudData.tables);
        }
        if (cloudData.sessions && Array.isArray(cloudData.sessions)) {
          setSessions(cloudData.sessions);
          StorageService.saveSessions(cloudData.sessions);
        }
        if (cloudData.menu && cloudData.menu.length > 0) {
          setMenu(cloudData.menu);
          StorageService.saveMenu(cloudData.menu);
        }
        if (cloudData.shifts && Array.isArray(cloudData.shifts)) {
          setShifts(cloudData.shifts);
          StorageService.saveShifts(cloudData.shifts);
        }
        if (cloudData.transactions && Array.isArray(cloudData.transactions)) {
          setTransactions(cloudData.transactions);
          StorageService.saveTransactions(cloudData.transactions);
        }
      }
    });

    // Realtime channel listener across all devices (PC & Phone)
    const unsubscribe = SupabaseSync.subscribeRealtime((key, data) => {
      if (!data) return;

      if (key === 'tables' && Array.isArray(data)) {
        setTables(data);
        StorageService.saveTables(data);
      }
      if (key === 'sessions' && Array.isArray(data)) {
        setSessions(data);
        StorageService.saveSessions(data);
      }
      if (key === 'menu' && Array.isArray(data)) {
        setMenu(data);
        StorageService.saveMenu(data);
      }
      if (key === 'shifts' && Array.isArray(data)) {
        setShifts(data);
        StorageService.saveShifts(data);
      }
      if (key === 'transactions' && Array.isArray(data)) {
        setTransactions(data);
        StorageService.saveTransactions(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save to LocalStorage for fast offline recovery (Cloud pushes happen in user actions)
  useEffect(() => {
    StorageService.saveTables(tables);
  }, [tables]);

  useEffect(() => {
    StorageService.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    StorageService.saveMenu(menu);
  }, [menu]);

  useEffect(() => {
    StorageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    StorageService.savePricingRules(pricingRules);
  }, [pricingRules]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveShifts(shifts);
  }, [shifts]);

  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Toast Helpers (Disabled all notification popups)
  const addToast = useCallback((_type: 'success' | 'error' | 'info' | 'warning', _title: string, _message?: string) => {
    // Notifications disabled per user request
  }, []);

  const removeToast = useCallback((_id: string) => {
    // Notifications disabled
  }, []);

  // Add audit log helper
  const logAudit = useCallback((action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      action,
      details,
      staffName: currentStaff.name,
      role: currentStaff.role,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [currentStaff]);

  // Switch Current User/Role
  const switchCurrentStaff = (staffId: string) => {
    const found = staff.find((s) => s.id === staffId);
    if (found) {
      setCurrentStaff(found);
      StorageService.setCurrentStaff(found);
      sounds.playClick();
    }
  };

  const isAdmin = currentStaff.role === 'ADMIN' || (currentStaff.role as string) === 'OWNER' || (currentStaff.role as string) === 'MANAGER';

  const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'thanhlong2026').trim();

  const verifyAdminPassword = (password: string): boolean => {
    return password.trim() === ADMIN_PASSWORD;
  };

  const loginAsAdmin = (password: string): boolean => {
    if (verifyAdminPassword(password)) {
      const adminStaff = staff.find((s) => s.role === 'ADMIN') || {
        id: 'staff-admin',
        code: 'ADMIN',
        name: 'Nguyễn Thanh Long (Admin)',
        phone: '0909000111',
        role: 'ADMIN',
        isActive: true,
      };
      setCurrentStaff(adminStaff);
      StorageService.setCurrentStaff(adminStaff);
      sounds.playPaymentSuccess();
      return true;
    }
    sounds.playClick();
    return false;
  };

  const logoutAdmin = () => {
    const staffMember = staff.find((s) => s.role === 'STAFF') || {
      id: 'staff-staff',
      code: 'NV-01',
      name: 'Lê Hoàng Nam (Nhân Viên)',
      phone: '0909000111',
      role: 'STAFF',
      isActive: true,
    };
    setCurrentStaff(staffMember);
    StorageService.setCurrentStaff(staffMember);
    sounds.playClick();
  };

  const toggleRole = () => {
    if (isAdmin) {
      logoutAdmin();
    } else {
      // Direct toggle fallback (in UI we will guard with AdminPasswordModal)
      loginAsAdmin(ADMIN_PASSWORD);
    }
  };

  // Helper: get active session for table
  const getActiveSessionForTable = useCallback((tableId: string): TableSession | undefined => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.currentSessionId) return undefined;
    return sessions.find((s) => s.id === table.currentSessionId && (s.status === 'ACTIVE' || s.status === 'PAUSED' || s.status === 'WAITING_PAYMENT'));
  }, [tables, sessions]);

  // Open Table
  const openTable = (tableId: string, customerId?: string, staffId?: string, customRate?: number): TableSession | null => {
    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable || targetTable.status !== 'AVAILABLE') {
      addToast('error', 'Lỗi mở bàn', 'Bàn này đang có khách hoặc đang bảo trì!');
      return null;
    }

    const assignedStaff = staff.find((s) => s.id === staffId) || currentStaff;
    const customer = customers.find((c) => c.id === customerId);
    const rule = pricingRules.find((r) => r.type === targetTable.type);

    const rate = customRate || targetTable.hourlyRate || rule?.defaultHourlyRate || 60000;
    const newSessionId = `sess-${Date.now()}`;

    const newSession: TableSession = {
      id: newSessionId,
      tableId: targetTable.id,
      tableCode: targetTable.code,
      tableType: targetTable.type,
      startTime: new Date().toISOString(),
      status: 'ACTIVE',
      appliedHourlyRate: rate,
      pauseRecords: [],
      customerId: customer?.id,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      customerTier: customer?.tier,
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
      orders: [],
    };

    const updatedSessions = [newSession, ...sessions];
    const updatedTables = tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status: 'PLAYING' as TableStatus,
            currentSessionId: newSessionId,
            assignedStaffId: assignedStaff.id,
            assignedStaffName: assignedStaff.name,
          }
        : t
    );

    setSessions(updatedSessions);
    setTables(updatedTables);
    StorageService.saveSessions(updatedSessions);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
      SupabaseSync.pushKey('tables', updatedTables);
    }

    sounds.playOpenTable();
    logAudit('MỞ BÀN', `Mở ${targetTable.code} (${targetTable.type}) - Giá: ${rate.toLocaleString()}đ/h${customer ? ` cho khách ${customer.name}` : ''}`);
    addToast('success', 'Mở bàn thành công', `${targetTable.code} đã bắt đầu tính giờ.`);
    return newSession;
  };

  // Pause Table
  const pauseTable = (tableId: string, reason?: string) => {
    const session = getActiveSessionForTable(tableId);
    if (!session || session.status !== 'ACTIVE') return;

    const updatedPauseRecords = [
      ...(session.pauseRecords || []),
      { pausedAt: new Date().toISOString(), reason: reason || 'Tạm dừng chơi' },
    ];

    const updatedSessions = sessions.map((s) =>
      s.id === session.id
        ? { ...s, status: 'PAUSED' as const, pauseRecords: updatedPauseRecords }
        : s
    );

    setSessions(updatedSessions);
    StorageService.saveSessions(updatedSessions);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
    }

    sounds.playClick();
    logAudit('TẠM DỪNG BÀN', `Tạm dừng tính giờ ${session.tableCode} - Lý do: ${reason || 'Không ghi'}`);
    addToast('warning', 'Đã tạm dừng', `${session.tableCode} đã tạm dừng tính giờ.`);
  };

  // Resume Table
  const resumeTable = (tableId: string) => {
    const session = getActiveSessionForTable(tableId);
    if (!session || session.status !== 'PAUSED') return;

    const pauseRecords = [...(session.pauseRecords || [])];
    const lastPauseIndex = pauseRecords.length - 1;
    if (lastPauseIndex >= 0 && !pauseRecords[lastPauseIndex].resumedAt) {
      pauseRecords[lastPauseIndex] = {
        ...pauseRecords[lastPauseIndex],
        resumedAt: new Date().toISOString(),
      };
    }

    const updatedSessions = sessions.map((s) =>
      s.id === session.id
        ? { ...s, status: 'ACTIVE' as const, pauseRecords }
        : s
    );

    setSessions(updatedSessions);
    StorageService.saveSessions(updatedSessions);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
    }

    sounds.playClick();
    logAudit('TIẾP TỤC BÀN', `Tiếp tục tính giờ ${session.tableCode}`);
    addToast('success', 'Tiếp tục chơi', `${session.tableCode} đã tiếp tục tính giờ.`);
  };

  // Transfer Table (Chuyển bàn)
  const transferTable = (fromTableId: string, toTableId: string): boolean => {
    const fromTable = tables.find((t) => t.id === fromTableId);
    const toTable = tables.find((t) => t.id === toTableId);

    if (!fromTable || !toTable) return false;
    if (toTable.status !== 'AVAILABLE') {
      addToast('error', 'Chuyển bàn thất bại', `${toTable.code} hiện không trống!`);
      return false;
    }

    const session = getActiveSessionForTable(fromTableId);
    if (!session) {
      addToast('error', 'Chuyển bàn thất bại', `${fromTable.code} không có phiên chơi hoạt động!`);
      return false;
    }

    const updatedSessions = sessions.map((s) =>
      s.id === session.id
        ? {
            ...s,
            tableId: toTable.id,
            tableCode: toTable.code,
            tableType: toTable.type,
            appliedHourlyRate: toTable.hourlyRate,
          }
        : s
    );

    const updatedTables = tables.map((t) => {
      if (t.id === fromTableId) {
        return {
          ...t,
          status: 'AVAILABLE' as TableStatus,
          currentSessionId: undefined,
          assignedStaffId: undefined,
          assignedStaffName: undefined,
        };
      }
      if (t.id === toTableId) {
        return {
          ...t,
          status: 'PLAYING' as TableStatus,
          currentSessionId: session.id,
          assignedStaffId: fromTable.assignedStaffId,
          assignedStaffName: fromTable.assignedStaffName,
        };
      }
      return t;
    });

    setSessions(updatedSessions);
    setTables(updatedTables);
    StorageService.saveSessions(updatedSessions);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
      SupabaseSync.pushKey('tables', updatedTables);
    }

    sounds.playClick();
    logAudit('CHUYỂN BÀN', `Chuyển phiên chơi từ ${fromTable.code} sang ${toTable.code}`);
    addToast('success', 'Chuyển bàn thành công', `Đã chuyển toàn bộ thời gian & món ăn từ ${fromTable.code} sang ${toTable.code}.`);
    return true;
  };

  // Merge Tables (Gộp bàn - Sapo FnB feature)
  const mergeTables = (sourceTableId: string, targetTableId: string): boolean => {
    const sourceTable = tables.find((t) => t.id === sourceTableId);
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!sourceTable || !targetTable) return false;

    const sourceSession = getActiveSessionForTable(sourceTableId);
    const targetSession = getActiveSessionForTable(targetTableId);
    if (!sourceSession || !targetSession) {
      addToast('error', 'Lỗi gộp bàn', 'Cả 2 bàn phải đang có khách để gộp hóa đơn!');
      return false;
    }

    // Merge source orders into target session
    const combinedOrders = [...targetSession.orders, ...sourceSession.orders];

    const updatedSessions = sessions.map((s) => {
      if (s.id === targetSession.id) {
        return {
          ...s,
          orders: combinedOrders,
        };
      }
      if (s.id === sourceSession.id) {
        return {
          ...s,
          status: 'COMPLETED' as const,
          endTime: new Date().toISOString(),
          notes: `Đã gộp vào ${targetTable.code}`,
        };
      }
      return s;
    });

    // Free source table back to AVAILABLE
    const updatedTables = tables.map((t) =>
      t.id === sourceTableId
        ? {
            ...t,
            status: 'AVAILABLE' as TableStatus,
            currentSessionId: undefined,
            assignedStaffId: undefined,
            assignedStaffName: undefined,
          }
        : t
    );

    setSessions(updatedSessions);
    setTables(updatedTables);
    StorageService.saveSessions(updatedSessions);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
      SupabaseSync.pushKey('tables', updatedTables);
    }

    sounds.playOpenTable();
    logAudit('GỘP BÀN', `Gộp hóa đơn từ ${sourceTable.code} vào ${targetTable.code}`);
    addToast('success', 'Gộp bàn thành công', `Đã gộp toàn bộ món ăn từ ${sourceTable.code} vào ${targetTable.code}. ${sourceTable.code} đã trở về trạng thái trống.`);
    return true;
  };

  // Atomic batch order items addition
  const addOrdersToTable = (
    tableId: string,
    itemsToAdd: { item: MenuItem; quantity: number; notes?: string }[]
  ): boolean => {
    if (!itemsToAdd || itemsToAdd.length === 0) return false;

    const session = getActiveSessionForTable(tableId);
    if (!session) {
      addToast('error', 'Lỗi order', 'Bàn chưa được mở!');
      return false;
    }

    // Validate inventory stock for all items
    for (const { item, quantity } of itemsToAdd) {
      const curMenuItem = menu.find((m) => m.id === item.id) || item;
      if (curMenuItem.stock < quantity) {
        addToast(
          'error',
          'Không đủ tồn kho',
          `Mặt hàng "${item.name}" chỉ còn ${curMenuItem.stock} ${item.unit}!`
        );
        return false;
      }
    }

    const newOrderItems: OrderItem[] = itemsToAdd.map(({ item, quantity, notes }) => ({
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      costPrice: item.costPrice,
      quantity,
      unit: item.unit,
      category: item.category,
      notes,
      createdAt: new Date().toISOString(),
    }));

    // 1. Batch deduct menu stock
    const updatedMenu = menu.map((m) => {
      const ordered = itemsToAdd.find((it) => it.item.id === m.id);
      if (ordered) {
        return { ...m, stock: Math.max(0, m.stock - ordered.quantity) };
      }
      return m;
    });
    setMenu(updatedMenu);
    StorageService.saveMenu(updatedMenu);

    // 2. Batch add orders to session
    const updatedSessions = sessions.map((s) => {
      if (s.id !== session.id) return s;
      const ordersCopy = [...s.orders];
      newOrderItems.forEach((newItem) => {
        const existingIdx = ordersCopy.findIndex(
          (o) => o.menuItemId === newItem.menuItemId && (!o.notes && !newItem.notes)
        );
        if (existingIdx >= 0) {
          ordersCopy[existingIdx] = {
            ...ordersCopy[existingIdx],
            quantity: ordersCopy[existingIdx].quantity + newItem.quantity,
          };
        } else {
          ordersCopy.push(newItem);
        }
      });
      return { ...s, orders: ordersCopy };
    });
    setSessions(updatedSessions);
    StorageService.saveSessions(updatedSessions);

    // 3. Immediately push to Supabase with zero delay
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
      SupabaseSync.pushKey('menu', updatedMenu);
    }

    sounds.playItemAdded();
    const itemSummaries = itemsToAdd.map((it) => `${it.quantity} ${it.item.name}`).join(', ');
    logAudit('ORDER MÓN', `Thêm ${itemSummaries} vào ${session.tableCode}`);
    addToast('success', 'Đã thêm món', `+${itemsToAdd.length} món (${session.tableCode})`);
    return true;
  };

  // Add order item to active table (single item wrapper)
  const addOrderToTable = (tableId: string, menuItem: MenuItem, quantity: number, notes?: string): boolean => {
    return addOrdersToTable(tableId, [{ item: menuItem, quantity, notes }]);
  };

  // Remove order item from table & restore stock
  const removeOrderItem = (tableId: string, orderItemId: string) => {
    const session = getActiveSessionForTable(tableId);
    if (!session) return;

    const item = session.orders.find((o) => o.id === orderItemId);
    if (!item) return;

    // Restore stock
    const updatedMenu = menu.map((m) =>
      m.id === item.menuItemId ? { ...m, stock: m.stock + item.quantity } : m
    );

    const updatedSessions = sessions.map((s) =>
      s.id === session.id
        ? { ...s, orders: s.orders.filter((o) => o.id !== orderItemId) }
        : s
    );

    setMenu(updatedMenu);
    setSessions(updatedSessions);
    StorageService.saveMenu(updatedMenu);
    StorageService.saveSessions(updatedSessions);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('menu', updatedMenu);
      SupabaseSync.pushKey('sessions', updatedSessions);
    }

    sounds.playClick();
    logAudit('HỦY MÓN', `Hủy món ${item.name} (x${item.quantity}) tại ${session.tableCode} [Bởi: ${currentStaff.name} - ${currentStaff.role}]`);
    addToast('info', 'Đã hủy món', `Đã hủy ${item.name} (x${item.quantity}) và hoàn kho.`);
  };

  // Update order item quantity
  const updateOrderItemQty = (tableId: string, orderItemId: string, delta: number) => {
    const session = getActiveSessionForTable(tableId);
    if (!session) return;

    const item = session.orders.find((o) => o.id === orderItemId);
    if (!item) return;

    const menuObj = menu.find((m) => m.id === item.menuItemId);
    if (delta > 0 && menuObj && menuObj.stock < delta) {
      addToast('error', 'Hết hàng', `Kho chỉ còn ${menuObj.stock} ${menuObj.unit}`);
      return;
    }

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeOrderItem(tableId, orderItemId);
      return;
    }

    // Adjust stock
    const updatedMenu = menu.map((m) =>
      m.id === item.menuItemId ? { ...m, stock: m.stock - delta } : m
    );

    const updatedSessions = sessions.map((s) => {
      if (s.id !== session.id) return s;
      return {
        ...s,
        orders: s.orders.map((o) => (o.id === orderItemId ? { ...o, quantity: newQty } : o)),
      };
    });

    setMenu(updatedMenu);
    setSessions(updatedSessions);
    StorageService.saveMenu(updatedMenu);
    StorageService.saveSessions(updatedSessions);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('menu', updatedMenu);
      SupabaseSync.pushKey('sessions', updatedSessions);
    }

    sounds.playClick();
    if (delta > 0) {
      logAudit('TĂNG MÓN', `Thêm +${delta} ${item.name} tại ${session.tableCode} (Tổng: ${newQty}) [${currentStaff.name}]`);
    } else {
      logAudit('GIẢM MÓN', `Giảm -${Math.abs(delta)} ${item.name} tại ${session.tableCode} (Còn: ${newQty}) [Bởi: ${currentStaff.name} - ${currentStaff.role}]`);
      addToast('warning', 'Đã giảm món', `Đã giảm -${Math.abs(delta)} ${item.name} tại ${session.tableCode}.`);
    }
  };

  // Complete Checkout (Thanh toán & Trả bàn)
  const completeCheckout = (
    sessionId: string,
    paymentMethod: PaymentMethod,
    discountAmount: number,
    surcharge: number,
    cashReceived: number,
    cashChange: number,
    bankRef?: string,
    pointsRedeemed: number = 0
  ): boolean => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status === 'COMPLETED') {
      addToast('error', 'Thanh toán lỗi', 'Phiên này không tồn tại hoặc đã thanh toán!');
      return false;
    }

    const table = tables.find((t) => t.id === session.tableId);
    const rule = pricingRules.find((r) => r.type === session.tableType);
    const now = new Date();

    const feeCalculation = calculateTableFee(session, rule, now, settings);
    const finalTotal = Math.max(0, feeCalculation.tableFee - discountAmount + feeCalculation.fnbFee + surcharge);

    const ptsDivisor = settings.pointsPerVnd || 10000;

    // If payment method is Member Wallet, check balance & deduct
    if (paymentMethod === 'MEMBER_WALLET' && session.customerId) {
      const customer = customers.find((c) => c.id === session.customerId);
      if (!customer || customer.prepaidBalance < finalTotal) {
        addToast('error', 'Số dư ví không đủ', `Ví hội viên chỉ còn ${(customer?.prepaidBalance || 0).toLocaleString()}đ`);
        return false;
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                prepaidBalance: c.prepaidBalance - finalTotal,
                totalSpent: c.totalSpent + finalTotal,
                points: Math.max(0, c.points - pointsRedeemed + Math.floor(finalTotal / ptsDivisor)),
                totalPlayHours: c.totalPlayHours + (feeCalculation.billedMinutes / 60),
              }
            : c
        )
      );
    } else if (session.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === session.customerId
            ? {
                ...c,
                totalSpent: c.totalSpent + finalTotal,
                points: Math.max(0, c.points - pointsRedeemed + Math.floor(finalTotal / ptsDivisor)),
                totalPlayHours: c.totalPlayHours + (feeCalculation.billedMinutes / 60),
              }
            : c
        )
      );
    }

    // Complete Session
    const completedSession: TableSession = {
      ...session,
      endTime: now.toISOString(),
      completedAt: now.toISOString(),
      status: 'COMPLETED',
      playedMinutes: feeCalculation.billedMinutes,
      tableFee: feeCalculation.tableFee,
      ordersFee: feeCalculation.fnbFee,
      discountAmount,
      surcharge,
      finalTotal,
      paymentMethod,
      cashierId: currentStaff.id,
      cashierName: currentStaff.name,
      paymentDetails: {
        cashReceived,
        cashChange,
        bankTransferAmount: paymentMethod === 'BANK_TRANSFER' ? finalTotal : undefined,
        walletDeducted: paymentMethod === 'MEMBER_WALLET' ? finalTotal : undefined,
        bankTransactionRef: bankRef,
      },
    };

    const updatedSessions = sessions.map((s) => (s.id === sessionId ? completedSession : s));

    // Return Table to AVAILABLE
    const updatedTables = table
      ? tables.map((t) =>
          t.id === table.id
            ? {
                ...t,
                status: 'AVAILABLE' as TableStatus,
                currentSessionId: undefined,
                assignedStaffId: undefined,
                assignedStaffName: undefined,
              }
            : t
        )
      : tables;

    // Record Cash Income Transaction
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      type: 'INCOME',
      category: 'BILL_COLLECTION',
      amount: finalTotal,
      description: `Thanh toán ${session.tableCode} (${feeCalculation.billedMinutes} phút + ${session.orders.length} món)`,
      staffName: currentStaff.name,
      referenceId: session.id,
      createdAt: now.toISOString(),
    };
    const updatedTransactions = [newTx, ...transactions];

    // Update active shift revenue stats
    const updatedShifts = shifts.map((sh) => {
      if (sh.status !== 'OPEN') return sh;
      return {
        ...sh,
        totalRevenue: (sh.totalRevenue || 0) + finalTotal,
        tableRevenue: (sh.tableRevenue || 0) + feeCalculation.tableFee,
        fnbRevenue: (sh.fnbRevenue || 0) + feeCalculation.fnbFee,
      };
    });

    setSessions(updatedSessions);
    setTables(updatedTables);
    setTransactions(updatedTransactions);
    setShifts(updatedShifts);
    StorageService.saveSessions(updatedSessions);
    StorageService.saveTables(updatedTables);
    StorageService.saveTransactions(updatedTransactions);
    StorageService.saveShifts(updatedShifts);

    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('sessions', updatedSessions);
      SupabaseSync.pushKey('tables', updatedTables);
      SupabaseSync.pushKey('transactions', updatedTransactions);
      SupabaseSync.pushKey('shifts', updatedShifts);
    }

    sounds.playPaymentSuccess();
    logAudit(
      'THANH TOÁN HÓA ĐƠN',
      `Thu ngân ${currentStaff.name} thanh toán ${session.tableCode}: ${finalTotal.toLocaleString()}đ qua hình thức ${paymentMethod}`
    );

    addToast('success', 'Thanh toán thành công', `Hóa đơn ${session.tableCode}: ${finalTotal.toLocaleString()}đ đã hoàn tất. Bàn đã chuyển về TRỐNG.`);
    return true;
  };

  // Set Table Maintenance
  const setTableMaintenance = (tableId: string, isMaintenance: boolean, notes?: string) => {
    const updatedTables = tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status: (isMaintenance ? 'MAINTENANCE' : 'AVAILABLE') as TableStatus,
            notes: isMaintenance ? notes || 'Bảo trì thay vải nỉ / kiểm tra băng' : undefined,
          }
        : t
    );
    setTables(updatedTables);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('tables', updatedTables);

    sounds.playClick();
    addToast('info', 'Trạng thái bàn', `Đã cập nhật trạng thái bàn sang ${isMaintenance ? 'Bảo trì' : 'Trống'}.`);
  };

  // Add Customer
  const addCustomer = (data: Omit<Customer, 'id' | 'code' | 'points' | 'totalSpent' | 'totalPlayHours' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      code: `TL-${Math.floor(1000 + Math.random() * 9000)}`,
      points: 0,
      totalSpent: 0,
      totalPlayHours: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    sounds.playClick();
    logAudit('TẠO HỘI VIÊN', `Thêm hội viên mới: ${newCust.name} (${newCust.code}) - ĐT: ${newCust.phone}`);
    addToast('success', 'Thêm hội viên', `Hội viên ${newCust.name} (${newCust.code}) đã được tạo.`);
    return newCust;
  };

  // Deposit Customer Wallet
  const depositCustomerWallet = (customerId: string, amount: number, bonusAmount: number = 0) => {
    const totalCredit = amount + bonusAmount;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, prepaidBalance: c.prepaidBalance + totalCredit }
          : c
      )
    );

    const targetCustomer = customers.find((c) => c.id === customerId);

    const tx: CashTransaction = {
      id: `tx-${Date.now()}`,
      type: 'INCOME',
      category: 'WALLET_TOPUP',
      amount,
      description: `Nạp ví hội viên ${targetCustomer?.name} (${amount.toLocaleString()}đ + tặng ${bonusAmount.toLocaleString()}đ)`,
      staffName: currentStaff.name,
      createdAt: new Date().toISOString(),
    };
    const updatedTx = [tx, ...transactions];
    setTransactions(updatedTx);
    StorageService.saveTransactions(updatedTx);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('transactions', updatedTx);

    sounds.playPaymentSuccess();
    logAudit('NẠP VÍ HỘI VIÊN', `Nạp ${amount.toLocaleString()}đ cho hội viên ${targetCustomer?.name} (${targetCustomer?.code})`);
    addToast('success', 'Nạp ví thành công', `Đã cộng ${totalCredit.toLocaleString()}đ vào ví của ${targetCustomer?.name}`);
  };

  // Add Menu Item
  const addMenuItem = (item: Omit<MenuItem, 'id'>): MenuItem => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    const updatedMenu = [...menu, newItem];
    setMenu(updatedMenu);
    StorageService.saveMenu(updatedMenu);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('menu', updatedMenu);

    sounds.playClick();
    logAudit('THÊM MÓN MENU', `Thêm món "${newItem.name}" - Giá: ${newItem.price.toLocaleString()}đ`);
    addToast('success', 'Thêm món thành công', newItem.name);
    return newItem;
  };

  // Update Menu Item
  const updateMenuItem = (item: MenuItem) => {
    const updatedMenu = menu.map((m) => (m.id === item.id ? item : m));
    setMenu(updatedMenu);
    StorageService.saveMenu(updatedMenu);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('menu', updatedMenu);

    sounds.playClick();
    logAudit('CẬP NHẬT MÓN', `Sửa thông tin món "${item.name}"`);
    addToast('success', 'Cập nhật món', item.name);
  };

  // Delete Menu Item
  const deleteMenuItem = (menuItemId: string): boolean => {
    const itemToDelete = menu.find((m) => m.id === menuItemId);
    if (!itemToDelete) return false;

    const updatedMenu = menu.filter((m) => m.id !== menuItemId);
    setMenu(updatedMenu);
    StorageService.saveMenu(updatedMenu);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('menu', updatedMenu);

    sounds.playClick();
    logAudit('XÓA MÓN MENU', `Xóa món "${itemToDelete.name}" khỏi thực đơn`);
    addToast('info', 'Đã xóa món', itemToDelete.name);
    return true;
  };

  // Import Stock
  const importStock = (menuItemId: string, addedStock: number, unitCost: number, supplierNotes?: string) => {
    const targetItem = menu.find((m) => m.id === menuItemId);
    if (!targetItem) return;

    const updatedMenu = menu.map((m) =>
      m.id === menuItemId
        ? { ...m, stock: m.stock + addedStock, costPrice: unitCost || m.costPrice }
        : m
    );

    const totalExpense = addedStock * unitCost;

    const tx: CashTransaction = {
      id: `tx-${Date.now()}`,
      type: 'EXPENSE',
      category: 'FNB_IMPORT',
      amount: totalExpense,
      description: `Nhập ${addedStock} ${targetItem.unit} ${targetItem.name}${supplierNotes ? ` - NCC: ${supplierNotes}` : ''}`,
      staffName: currentStaff.name,
      createdAt: new Date().toISOString(),
    };
    const updatedTx = [tx, ...transactions];

    setMenu(updatedMenu);
    setTransactions(updatedTx);
    StorageService.saveMenu(updatedMenu);
    StorageService.saveTransactions(updatedTx);
    if (isSupabaseConfigured()) {
      SupabaseSync.pushKey('menu', updatedMenu);
      SupabaseSync.pushKey('transactions', updatedTx);
    }

    sounds.playClick();
    logAudit('NHẬP KHO', `Nhập ${addedStock} ${targetItem.unit} ${targetItem.name} - Chi phí: ${totalExpense.toLocaleString()}đ`);
    addToast('success', 'Nhập hàng thành công', `Đã nhập ${addedStock} ${targetItem.unit} ${targetItem.name} vào kho.`);
  };

  // Start New Shift
  const startNewShift = (shiftName: string, initialCash: number) => {
    const newShift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      shiftName,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      startTime: new Date().toISOString(),
      status: 'OPEN',
      initialCash,
      totalRevenue: 0,
      tableRevenue: 0,
      fnbRevenue: 0,
    };
    const updatedShifts = [newShift, ...shifts];
    setShifts(updatedShifts);
    StorageService.saveShifts(updatedShifts);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('shifts', updatedShifts);

    sounds.playOpenTable();
    logAudit('BẮT ĐẦU CA', `${currentStaff.name} mở ${shiftName} với tiền mặt đầu ca: ${initialCash.toLocaleString()}đ`);
    addToast('success', 'Mở ca làm việc', `Đã mở ${shiftName}`);
  };

  // Close Current Shift
  const closeCurrentShift = (actualEndingCash: number, notes?: string) => {
    const activeShift = shifts.find((s) => s.status === 'OPEN');
    if (!activeShift) {
      addToast('error', 'Lỗi', 'Hiện không có ca làm việc nào đang mở!');
      return;
    }

    const expectedCash = (activeShift.initialCash || 0) + (activeShift.totalRevenue || 0);
    const difference = actualEndingCash - expectedCash;

    const updatedShifts = shifts.map((s) =>
      s.id === activeShift.id
        ? {
            ...s,
            status: 'CLOSED' as const,
            endTime: new Date().toISOString(),
            expectedCashTotal: expectedCash,
            actualEndingCash,
            cashDifference: difference,
            notes,
          }
        : s
    );
    setShifts(updatedShifts);
    StorageService.saveShifts(updatedShifts);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('shifts', updatedShifts);

    sounds.playClick();
    logAudit(
      'KẾT THÚC CA',
      `Thu ngân ${currentStaff.name} kết ca ${activeShift.shiftName}. Tiền thực tế: ${actualEndingCash.toLocaleString()}đ, Chênh lệch: ${difference.toLocaleString()}đ`
    );
    addToast('success', 'Đóng ca thành công', `Đã chốt sổ ca làm việc.`);
  };

  // Add Cash Transaction
  const addCashTransaction = (
    type: 'INCOME' | 'EXPENSE',
    category: CashTransaction['category'],
    amount: number,
    description: string
  ) => {
    const tx: CashTransaction = {
      id: `tx-${Date.now()}`,
      type,
      category,
      amount,
      description,
      staffName: currentStaff.name,
      createdAt: new Date().toISOString(),
    };
    const updatedTx = [tx, ...transactions];
    setTransactions(updatedTx);
    StorageService.saveTransactions(updatedTx);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('transactions', updatedTx);

    sounds.playClick();
    logAudit(`TẠO PHIẾU ${type === 'INCOME' ? 'THU' : 'CHI'}`, `${description} - Số tiền: ${amount.toLocaleString()}đ`);
    addToast('success', `Đã lưu phiếu ${type === 'INCOME' ? 'thu' : 'chi'}`, `${amount.toLocaleString()}đ`);
  };

  // Update Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    sounds.playClick();
    logAudit('CẬP NHẬT CÀI ĐẶT', 'Thay đổi cấu hình hệ thống');
    addToast('success', 'Đã lưu cài đặt', 'Cấu hình hệ thống đã được cập nhật.');
  };

  // Update Pricing Rule
  const updatePricingRule = (rule: PricingRule) => {
    setPricingRules((prev) => prev.map((r) => (r.type === rule.type ? rule : r)));
    setTables((prev) =>
      prev.map((t) => (t.type === rule.type ? { ...t, hourlyRate: rule.defaultHourlyRate } : t))
    );
    sounds.playClick();
    logAudit('CẬP NHẬT BẢNG GIÁ', `Đổi giá ${rule.typeName}: ${rule.defaultHourlyRate.toLocaleString()}đ/h`);
    addToast('success', 'Đã lưu giá bàn', `Cập nhật biểu phí ${rule.typeName}`);
  };

  // Reset demo
  const resetAllDemoData = () => {
    StorageService.resetToDefault();
    setTables(StorageService.getTables());
    setSessions(StorageService.getSessions());
    setMenu(StorageService.getMenu());
    setCustomers(StorageService.getCustomers());
    setStaff(StorageService.getStaff());
    setPricingRules(StorageService.getPricingRules());
    setSettings(StorageService.getSettings());
    setShifts(StorageService.getShifts());
    setTransactions(StorageService.getTransactions());
    setAuditLogs(StorageService.getAuditLogs());
    sounds.playOpenTable();
    addToast('info', 'Khôi phục mẫu', 'Đã khôi phục dữ liệu ban đầu của THANH LONG BILLIARDS.');
  };

  const exportDatabaseJSON = () => {
    return StorageService.exportAllData();
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    const success = StorageService.importAllData(jsonStr);
    if (success) {
      setTables(StorageService.getTables());
      setSessions(StorageService.getSessions());
      setMenu(StorageService.getMenu());
      setCustomers(StorageService.getCustomers());
      setStaff(StorageService.getStaff());
      setPricingRules(StorageService.getPricingRules());
      setSettings(StorageService.getSettings());
      setShifts(StorageService.getShifts());
      setTransactions(StorageService.getTransactions());
      setAuditLogs(StorageService.getAuditLogs());
      sounds.playPaymentSuccess();
      addToast('success', 'Khôi phục thành công', 'Dữ liệu đã được nhập lại chính xác.');
      return true;
    }
    addToast('error', 'Lỗi nhập dữ liệu', 'File JSON không đúng định dạng!');
    return false;
  };

  // Table Management Actions (Thêm/Sửa/Xóa số lượng bàn)
  const addTable = (data: { code: string; name: string; type: TableType; hourlyRate: number; area: string; notes?: string }): TableItem => {
    const newId = `tbl-${Date.now()}`;
    const newTable: TableItem = {
      id: newId,
      code: data.code,
      name: data.name,
      type: data.type,
      hourlyRate: data.hourlyRate,
      status: 'AVAILABLE',
      area: data.area,
      notes: data.notes,
    };
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('tables', updatedTables);

    sounds.playOpenTable();
    addToast('success', 'Thêm bàn thành công', `Đã tạo ${newTable.code} - ${newTable.name}`);
    logAudit('THÊM BÀN', `Tạo mới bàn ${newTable.code} (${newTable.type}) - ${newTable.area}`);
    return newTable;
  };

  const updateTable = (updatedTable: TableItem) => {
    const updatedTables = tables.map((t) => (t.id === updatedTable.id ? updatedTable : t));
    setTables(updatedTables);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('tables', updatedTables);

    sounds.playClick();
    addToast('success', 'Cập nhật thành công', `Đã lưu thông tin bàn ${updatedTable.code}`);
    logAudit('CẬP NHẬT BÀN', `Chỉnh sửa thông tin ${updatedTable.code} (${updatedTable.name})`);
  };

  const deleteTable = (tableId: string): boolean => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return false;
    if (table.status === 'PLAYING' || table.status === 'WAITING_PAYMENT') {
      sounds.playClick();
      addToast('error', 'Không thể xóa bàn', `Bàn ${table.code} đang có khách chơi hoặc chờ tính tiền. Vui lòng hoàn tất lượt chơi trước khi xóa!`);
      return false;
    }
    const updatedTables = tables.filter((t) => t.id !== tableId);
    setTables(updatedTables);
    StorageService.saveTables(updatedTables);
    if (isSupabaseConfigured()) SupabaseSync.pushKey('tables', updatedTables);

    sounds.playClick();
    addToast('info', 'Đã xóa bàn', `Đã gỡ ${table.code} khỏi danh sách bàn của quán.`);
    logAudit('XÓA BÀN', `Xóa bàn ${table.code} khỏi hệ thống`);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        tables,
        sessions,
        menu,
        customers,
        staff,
        pricingRules,
        settings,
        shifts,
        transactions,
        auditLogs,
        currentStaff,
        isAdmin,
        toggleRole,
        verifyAdminPassword,
        loginAsAdmin,
        logoutAdmin,
        currentTime,
        toasts,
        currentBranch,
        soundEnabled,
        theme,
        isCloudSyncActive: isSupabaseConfigured(),
        setTheme,
        toggleTheme,
        addTable,
        updateTable,
        deleteTable,
        addToast,
        removeToast,
        switchCurrentStaff,
        setCurrentBranch,
        toggleSound,
        openTable,
        pauseTable,
        resumeTable,
        transferTable,
        mergeTables,
        addOrdersToTable,
        addOrderToTable,
        removeOrderItem,
        updateOrderItemQty,
        completeCheckout,
        setTableMaintenance,
        getActiveSessionForTable,
        addCustomer,
        depositCustomerWallet,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        importStock,
        startNewShift,
        closeCurrentShift,
        addCashTransaction,
        updateSettings,
        updatePricingRule,
        resetAllDemoData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
