import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDurationHuman } from '../../services/calculation';

export const ReportsView: React.FC = () => {
  const {
    sessions,
    tables,
    menu,
    isAdmin,
    addToast,
  } = useApp();

  const [dateRange, setDateRange] = useState<'TODAY' | '7DAYS' | 'MONTH' | 'ALL'>('TODAY');

  // Daily fixed costs overhead (Rent, electricity, wages apportioned per day)
  const [dailyFixedCost, setDailyFixedCost] = useState<number>(() => {
    const saved = localStorage.getItem('thanhlong_daily_fixed_cost');
    return saved !== null ? Number(saved) : 500000;
  });

  const [fixedCostInput, setFixedCostInput] = useState<number>(dailyFixedCost);

  // Filter completed sessions by selected dateRange
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const completedSessions = sessions.filter((s) => {
    if (s.status !== 'COMPLETED') return false;
    const sessionTime = new Date(s.endTime || s.startTime).getTime();

    if (dateRange === 'TODAY') {
      return sessionTime >= startOfToday;
    }
    if (dateRange === '7DAYS') {
      return sessionTime >= sevenDaysAgo;
    }
    if (dateRange === 'MONTH') {
      return sessionTime >= startOfMonth;
    }
    return true; // ALL
  });

  // Aggregated totals
  const totalGrandRevenue = completedSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
  const totalTableRevenue = completedSessions.reduce((sum, s) => sum + (s.tableFee || 0), 0);
  const totalPlayedMinutes = completedSessions.reduce((sum, s) => sum + (s.playedMinutes || 0), 0);

  // F&B Cost of Goods Sold & Profit calculation
  let totalFnbRevenue = 0;
  let totalFnbCost = 0;

  // Track F&B items sold for Best-Sellers ranking
  const itemSalesMap = new Map<string, {
    name: string;
    unit: string;
    category: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
  }>();

  completedSessions.forEach((s) => {
    (s.orders || []).forEach((ord) => {
      const matchedMenu = menu.find((m) => m.id === ord.menuItemId);
      const unitCost = ord.costPrice ?? matchedMenu?.costPrice ?? 0;
      const rev = ord.price * ord.quantity;
      const cst = unitCost * ord.quantity;

      totalFnbRevenue += rev;
      totalFnbCost += cst;

      const existing = itemSalesMap.get(ord.name) || {
        name: ord.name,
        unit: ord.unit || 'Phần',
        category: ord.category || 'F&B',
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };

      existing.quantity += ord.quantity;
      existing.revenue += rev;
      existing.cost += cst;
      existing.profit += (rev - cst);
      itemSalesMap.set(ord.name, existing);
    });
  });

  const topSellingItems = Array.from(itemSalesMap.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);

  const totalFnbProfit = Math.max(0, totalFnbRevenue - totalFnbCost);

  // Today's / Period Net Profit or Loss Calculation
  // In 'TODAY' mode: subtract 1 day of fixed costs
  // In '7DAYS': subtract 7 days
  // In 'MONTH': subtract days in month so far
  const daysMultiplier = dateRange === 'TODAY' ? 1 : dateRange === '7DAYS' ? 7 : dateRange === 'MONTH' ? Math.max(1, now.getDate()) : 30;
  const periodFixedCost = dailyFixedCost * daysMultiplier;
  const totalPeriodCosts = totalFnbCost + periodFixedCost;
  const netProfitOrLoss = totalGrandRevenue - totalPeriodCosts;
  const isProfitable = netProfitOrLoss >= 0;

  const handleSaveFixedCost = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, fixedCostInput);
    setDailyFixedCost(val);
    localStorage.setItem('thanhlong_daily_fixed_cost', val.toString());
    addToast('success', 'Đã lưu chi phí', `Chi phí cố định ngày: ${formatVND(val)}`);
  };

  // Payment method breakdown
  const paymentBreakdown = {
    CASH: { label: 'Tiền mặt', total: 0, count: 0 },
    BANK_TRANSFER: { label: 'Chuyển khoản VietQR', total: 0, count: 0 },
    WALLET: { label: 'Trừ ví hội viên VIP', total: 0, count: 0 },
  };

  completedSessions.forEach((s) => {
    const method = (s.paymentMethod || 'CASH') as keyof typeof paymentBreakdown;
    if (paymentBreakdown[method]) {
      paymentBreakdown[method].total += (s.finalTotal || 0);
      paymentBreakdown[method].count += 1;
    } else {
      paymentBreakdown.CASH.total += (s.finalTotal || 0);
      paymentBreakdown.CASH.count += 1;
    }
  });

  // Peak Hours distribution analysis
  const timeSlots = [
    { label: 'Sáng (08:00 - 12:00)', startHour: 8, endHour: 12, revenue: 0, count: 0 },
    { label: 'Chiều (12:00 - 18:00)', startHour: 12, endHour: 18, revenue: 0, count: 0 },
    { label: 'Tối - Giờ vàng (18:00 - 23:00)', startHour: 18, endHour: 23, revenue: 0, count: 0 },
    { label: 'Đêm (23:00 - 04:00)', startHour: 23, endHour: 4, revenue: 0, count: 0 },
  ];

  completedSessions.forEach((s) => {
    const date = new Date(s.startTime);
    const hour = date.getHours();

    if (hour >= 8 && hour < 12) {
      timeSlots[0].revenue += (s.finalTotal || 0);
      timeSlots[0].count += 1;
    } else if (hour >= 12 && hour < 18) {
      timeSlots[1].revenue += (s.finalTotal || 0);
      timeSlots[1].count += 1;
    } else if (hour >= 18 && hour < 23) {
      timeSlots[2].revenue += (s.finalTotal || 0);
      timeSlots[2].count += 1;
    } else {
      timeSlots[3].revenue += (s.finalTotal || 0);
      timeSlots[3].count += 1;
    }
  });

  const maxSlotRev = Math.max(...timeSlots.map((ts) => ts.revenue), 1);

  // Top Tables by revenue
  const tablePerformance = tables.map((t) => {
    const tableSessions = completedSessions.filter((s) => s.tableId === t.id);
    const rev = tableSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
    const mins = tableSessions.reduce((sum, s) => sum + (s.playedMinutes || 0), 0);
    return {
      table: t,
      sessionCount: tableSessions.length,
      totalRevenue: rev,
      totalMinutes: mins,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const handleExportCSV = () => {
    const headers = ['Mã Hóa Đơn', 'Bàn', 'Khách Hàng', 'Bắt Đầu', 'Kết Thúc', 'Tiền Giờ', 'Tiền Menu', 'Tổng Tiền', 'Hình Thức'];
    const rows = completedSessions.map((s) => [
      s.id,
      s.tableCode || s.tableId,
      s.customerName || 'Khách vãng lai',
      new Date(s.startTime).toLocaleTimeString('vi-VN'),
      s.endTime ? new Date(s.endTime).toLocaleTimeString('vi-VN') : '',
      s.tableFee,
      s.ordersFee,
      s.finalTotal,
      s.paymentMethod || 'CASH',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thanh-long-billiards-bao-cao-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto w-full select-none pb-24 lg:pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Báo cáo & Doanh thu
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phân tích doanh thu, hạch toán lãi lỗ, cơ cấu thanh toán và hiệu suất khai thác quán
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="grid grid-cols-4 sm:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs text-center">
            {(['TODAY', '7DAYS', 'MONTH', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`py-2 sm:py-1.5 sm:px-3 rounded-lg text-xs font-medium transition-all text-center ${
                  dateRange === r
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'TODAY' ? 'Hôm nay' : r === '7DAYS' ? '7 ngày' : r === 'MONTH' ? 'Tháng này' : 'Tất cả'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="h-10 sm:h-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors flex items-center justify-center active:scale-98"
          >
            Xuất file CSV
          </button>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Grand Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">
            Tổng doanh thu ({dateRange === 'TODAY' ? 'hôm nay' : dateRange === '7DAYS' ? '7 ngày' : dateRange === 'MONTH' ? 'tháng này' : 'toàn bộ'})
          </span>
          <div className="text-2xl font-bold text-amber-300">
            {formatVND(totalGrandRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {completedSessions.length} lượt chơi đã thanh toán
          </div>
        </div>

        {/* Table Fee Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Doanh thu tiền giờ</span>
          <div className="text-2xl font-bold text-white">
            {formatVND(totalTableRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Tổng {formatDurationHuman(totalPlayedMinutes)}
          </div>
        </div>

        {/* F&B Capital Cost (Giá gốc / Số vốn) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Số vốn F&B (Giá gốc)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              VỐN
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-200">
            {formatVND(totalFnbCost)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Tiền vốn nhập hàng các món đã bán
          </div>
        </div>

        {/* F&B Profit (Tiền lãi F&B) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Tiền lãi F&B</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold">
              LÃI
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatVND(totalFnbProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Tổng thu F&B: {formatVND(totalFnbRevenue)}
          </div>
        </div>
      </div>

      {/* Row 2: Bảng Tính Lãi / Lỗ Ròng & Điều Chỉnh Chi Phí Cố Định */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isProfitable
          ? 'bg-slate-900/70 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-slate-900/70 border-rose-500/40 shadow-lg shadow-rose-950/20'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Profit / Loss Badge & Grand Value */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Hạch toán kết quả kinh doanh ròng
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border tracking-wide ${
                isProfitable
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}>
                {isProfitable ? 'KỲ NÀY CÓ LÃI' : 'KỲ NÀY ĐANG LỖ'}
              </span>
            </div>

            {/* Profit or Loss Display (Green = Lãi, Red = Lỗ) */}
            <div className="flex items-baseline gap-3 my-1 flex-wrap">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight font-mono ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isProfitable
                  ? `+${formatVND(netProfitOrLoss)}`
                  : `-${formatVND(Math.abs(netProfitOrLoss))}`}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                (sau khi trừ giá vốn F&B và chi phí cố định vận hành)
              </span>
            </div>

            {/* Formula breakdown */}
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap font-mono">
              <span>Doanh thu: <strong className="text-amber-300">{formatVND(totalGrandRevenue)}</strong></span>
              <span>−</span>
              <span>Vốn F&B: <strong className="text-slate-300">{formatVND(totalFnbCost)}</strong></span>
              <span>−</span>
              <span>Chi phí cố định: <strong className="text-rose-300">{formatVND(periodFixedCost)}</strong></span>
            </div>
          </div>

          {/* Right: Editable Daily Fixed Costs (Mặt bằng + Điện nước + Nhân sự phân bổ ngày) */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-3 min-w-[280px] sm:min-w-[340px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Chi phí cố định phân bổ ngày
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                  {isAdmin ? 'ADMIN SỬA' : 'CHỈ XEM'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mặt bằng, điện nước, khấu hao và lương phân bổ theo ngày
              </p>
            </div>

            <form onSubmit={handleSaveFixedCost} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="50000"
                  min="0"
                  disabled={!isAdmin}
                  value={fixedCostInput}
                  onChange={(e) => setFixedCostInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-slate-500 disabled:opacity-60"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-mono">
                  VNĐ/ngày
                </span>
              </div>
              {isAdmin && (
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
                >
                  Lưu
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Row 3: Biểu Đồ Khung Giờ Vàng (Peak Hours) & Cơ Cấu Thanh Toán */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Khung Giờ Vàng (Peak Hours) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">
                Khung giờ vàng & Cao điểm trong ngày
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium">
                Giờ khách đông nhất
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Phân bổ doanh thu theo khung giờ giúp bố trí ca nhân viên và kích cầu giờ thấp điểm.
            </p>

            <div className="space-y-3.5">
              {timeSlots.map((slot) => {
                const percent = Math.min(100, Math.round((slot.revenue / maxSlotRev) * 100));
                return (
                  <div key={slot.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{slot.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{slot.count} bill</span>
                        <span className="font-bold text-white font-mono">{formatVND(slot.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Giờ cao điểm ghi nhận:</span>
            <strong className="text-amber-300">Tối (18:00 - 23:00)</strong>
          </div>
        </div>

        {/* Cơ Cấu Thanh Toán (Payment Methods) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">
                Cơ cấu hình thức thanh toán
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                Đối soát két & ngân hàng
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tách bạch tiền mặt trong két và tiền chuyển khoản để kiểm quỹ cuối ca chính xác.
            </p>

            <div className="space-y-3">
              {Object.entries(paymentBreakdown).map(([key, data]) => {
                const sharePercent = totalGrandRevenue > 0
                  ? Math.round((data.total / totalGrandRevenue) * 100)
                  : 0;

                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{data.label}</span>
                        <span className="text-[11px] text-slate-400">({data.count} giao dịch)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Chiếm {sharePercent}% tổng doanh thu
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-amber-300 text-sm font-mono">
                        {formatVND(data.total)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tiền mặt hiện tại cần có trong két:</span>
            <strong className="text-emerald-400 font-mono text-xs">
              {formatVND(paymentBreakdown.CASH.total)}
            </strong>
          </div>
        </div>
      </div>

      {/* Row 4: Top 5 Món F&B Bán Chạy & Xếp Hạng Bàn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Món F&B Bán Chạy Nhất */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Top món F&B bán chạy & sinh lời nhất
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Xếp hạng theo tiền lãi ròng thực tế mang về cho quán
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
              BEST SELLERS
            </span>
          </div>

          {topSellingItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chưa có dữ liệu gọi món F&B trong khoảng thời gian đã chọn.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {topSellingItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : idx === 1
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-white truncate block">
                        {item.name}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Đã bán: <strong className="text-slate-200">{item.quantity} {item.unit}</strong> • Vốn: {formatVND(item.cost)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-400 font-mono">
                      +{formatVND(item.profit)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Doanh thu: {formatVND(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Xếp Hạng Doanh Thu Theo Bàn */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Hiệu suất & Doanh thu theo từng bàn
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bàn nào mang lại doanh thu và thời gian sử dụng cao nhất
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
              {tables.length} bàn
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {tablePerformance.slice(0, 6).map((item, index) => (
              <div
                key={item.table.id}
                className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                    index === 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : index === 1
                      ? 'bg-slate-700 text-slate-200'
                      : index === 2
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white">{item.table.code}</span>
                    <span className="text-slate-400 ml-1.5 text-[11px]">({item.table.type})</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.sessionCount} lượt chơi • {formatDurationHuman(item.totalMinutes)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-bold text-amber-300 shrink-0 font-mono">
                  {formatVND(item.totalRevenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
