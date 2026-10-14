import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDurationHuman } from '../../services/calculation';

export const ReportsView: React.FC = () => {
  const {
    sessions,
    tables,
    transactions,
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

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  // Aggregated totals
  const totalGrandRevenue = completedSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
  const totalTableRevenue = completedSessions.reduce((sum, s) => sum + (s.tableFee || 0), 0);
  const totalPlayedMinutes = completedSessions.reduce((sum, s) => sum + (s.playedMinutes || 0), 0);

  // F&B Cost of Goods Sold & Profit calculation
  let totalFnbRevenue = 0;
  let totalFnbCost = 0;

  completedSessions.forEach((s) => {
    (s.orders || []).forEach((ord) => {
      const matchedMenu = menu.find((m) => m.id === ord.menuItemId);
      const unitCost = ord.costPrice ?? matchedMenu?.costPrice ?? 0;
      totalFnbRevenue += ord.price * ord.quantity;
      totalFnbCost += unitCost * ord.quantity;
    });
  });

  const totalFnbProfit = Math.max(0, totalFnbRevenue - totalFnbCost);

  // Today's Profit or Loss Calculation
  // Profit = Total Revenue - F&B Capital Cost - Daily Fixed Costs
  const totalDailyCosts = totalFnbCost + dailyFixedCost;
  const netProfitOrLoss = totalGrandRevenue - totalDailyCosts;
  const isProfitable = netProfitOrLoss >= 0;

  const handleSaveFixedCost = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, fixedCostInput);
    setDailyFixedCost(val);
    localStorage.setItem('thanhlong_daily_fixed_cost', val.toString());
    addToast('success', 'Đã lưu chi phí', `Chi phí cố định ngày: ${formatVND(val)}`);
  };

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
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full select-none pb-24 lg:pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Báo cáo & Doanh thu
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Báo cáo doanh thu, hạch toán vốn & lãi F&B, tính toán lãi/lỗ theo chi phí cố định
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['TODAY', '7DAYS', 'MONTH', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors"
          >
            Xuất file CSV
          </button>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Grand Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Tổng doanh thu hôm nay</span>
          <div className="text-2xl font-bold text-amber-300">
            {formatVND(totalGrandRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {completedSessions.length} lượt chơi đã chốt bill
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

      {/* Row 2: Bảng Tính Lãi / Lỗ Hôm Nay & Điều Chỉnh Chi Phí Cố Định */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isProfitable
          ? 'bg-slate-900/70 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-slate-900/70 border-rose-500/40 shadow-lg shadow-rose-950/20'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Profit / Loss Badge & Grand Value */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Hạch toán kết quả kinh doanh hôm nay
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border tracking-wide ${
                isProfitable
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}>
                {isProfitable ? 'HÔM NAY CÓ LÃI' : 'HÔM NAY ĐANG LỖ'}
              </span>
            </div>

            {/* Profit or Loss Display (Green = Lãi, Red = Lỗ) */}
            <div className="flex items-baseline gap-3 my-1">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight font-mono ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isProfitable
                  ? `+${formatVND(netProfitOrLoss)}`
                  : `-${formatVND(Math.abs(netProfitOrLoss))}`}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                (sau khi trừ giá vốn F&B và chi phí cố định)
              </span>
            </div>

            {/* Transparent formula breakdown */}
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap font-mono">
              <span>Doanh thu: <strong className="text-amber-300">{formatVND(totalGrandRevenue)}</strong></span>
              <span>−</span>
              <span>Vốn F&B: <strong className="text-slate-300">{formatVND(totalFnbCost)}</strong></span>
              <span>−</span>
              <span>Chi phí cố định: <strong className="text-rose-300">{formatVND(dailyFixedCost)}</strong></span>
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
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                    isAdmin
                      ? 'bg-slate-900 border-slate-600 text-white focus:outline-none focus:border-amber-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 cursor-default'
                  }`}
                />
              </div>

              {isAdmin && (
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap transition-colors active:scale-95"
                >
                  Lưu chi phí
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Row 3: Thống Kê Rõ Ràng F&B (Số vốn & Lãi) và Bảng Xếp Hạng Bàn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chi tiết Thống Kê F&B */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">
                Thống kê rõ ràng F&B (Số vốn & Tiền lãi)
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                Dịch vụ đồ uống & ăn nhẹ
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tách biệt rõ ràng số vốn hàng bán bỏ ra và số tiền lãi thực nhận từ dịch vụ F&B.
            </p>

            <div className="grid grid-cols-2 gap-3.5 mb-4">
              {/* Vốn F&B */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Số vốn F&B (Giá gốc)
                </span>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {formatVND(totalFnbCost)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Giá gốc nhập hàng các món đã order
                </p>
              </div>

              {/* Lãi F&B */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-medium block mb-1">
                  Tiền lãi F&B
                </span>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                  {formatVND(totalFnbProfit)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lợi nhuận gộp sau khi trừ tiền vốn
                </p>
              </div>
            </div>

            {/* F&B Summary note */}
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Tổng doanh thu bán F&B:</span>
              <strong className="text-white font-mono">{formatVND(totalFnbRevenue)}</strong>
            </div>
          </div>
        </div>

        {/* Xếp Hạng Doanh Thu Theo Bàn */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-semibold text-white">
              Xếp hạng doanh thu theo bàn
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
              {tables.length} bàn
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
