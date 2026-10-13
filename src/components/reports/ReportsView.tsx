import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDurationHuman } from '../../services/calculation';

export const ReportsView: React.FC = () => {
  const {
    sessions,
    tables,
    staff,
    transactions,
  } = useApp();

  const [dateRange, setDateRange] = useState<'TODAY' | '7DAYS' | 'MONTH' | 'ALL'>('TODAY');

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  // Aggregated totals
  const totalGrandRevenue = completedSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
  const totalTableRevenue = completedSessions.reduce((sum, s) => sum + (s.tableFee || 0), 0);
  const totalFnbRevenue = completedSessions.reduce((sum, s) => sum + (s.ordersFee || 0), 0);
  const totalPlayedMinutes = completedSessions.reduce((sum, s) => sum + (s.playedMinutes || 0), 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netEstimatedProfit = totalGrandRevenue - totalExpenses;

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

  // Top Staff by revenue handled
  const staffPerformance = staff.map((st) => {
    const staffSessions = completedSessions.filter((s) => s.staffId === st.id);
    const rev = staffSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
    return {
      staff: st,
      sessionCount: staffSessions.length,
      totalRevenue: rev,
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
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            BÁO CÁO & PHÂN TÍCH DOANH THU
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Cơ cấu doanh thu tiền giờ vs đồ ăn F&B, hiệu suất từng bàn và xuất dữ liệu CSV
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          {/* Date Range Selector */}
          <div className="flex items-center bg-charcoal-850 p-0.5 rounded-lg border border-charcoal-750 text-xs font-bold">
            {(['TODAY', '7DAYS', 'MONTH', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  dateRange === r
                    ? 'bg-charcoal-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'TODAY' ? 'HÔM NAY' : r === '7DAYS' ? '7 NGÀY' : r === 'MONTH' ? 'THÁNG' : 'TẤT CẢ'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-charcoal-700 text-xs font-bold transition-colors"
          >
            XUẤT CSV
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">TỔNG DOANH THU</span>
          <div className="text-xl font-black text-gold-400">
            {formatVND(totalGrandRevenue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            {completedSessions.length} lượt chơi đã chốt
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">DOANH THU GIỜ</span>
          <div className="text-xl font-black text-white">
            {formatVND(totalTableRevenue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            Tổng {formatDurationHuman(totalPlayedMinutes)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">DOANH THU F&B</span>
          <div className="text-xl font-black text-white">
            {formatVND(totalFnbRevenue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            Tỷ trọng: {totalGrandRevenue > 0 ? Math.round((totalFnbRevenue / totalGrandRevenue) * 100) : 0}% doanh thu
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">LỢI NHUẬN ƯỚC TÍNH</span>
          <div className="text-xl font-black text-emerald-400">
            {formatVND(netEstimatedProfit)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            Chi phí vận hành: {formatVND(totalExpenses)}
          </div>
        </div>
      </div>

      {/* 2-Columns: Top Tables Performance & Staff Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 font-mono">
        {/* Top Tables Performance */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            XẾP HẠNG DOANH THU CÁC BÀN BIDA
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {tablePerformance.slice(0, 8).map((item, index) => (
              <div
                key={item.table.id}
                className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded font-black flex items-center justify-center text-[10px] ${
                    index === 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : index === 1
                      ? 'bg-slate-700 text-slate-200'
                      : index === 2
                      ? 'bg-amber-900/40 text-amber-400'
                      : 'bg-charcoal-800 text-slate-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white">{item.table.code}</span>
                    <span className="text-slate-400 ml-1.5 text-[10px]">({item.table.type})</span>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {item.sessionCount} lượt chơi • {formatDurationHuman(item.totalMinutes)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-black text-gold-400">
                  {formatVND(item.totalRevenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Productivity */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            DOANH THU THEO NHÂN VIÊN / THU NGÂN
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {staffPerformance.map((item) => (
              <div
                key={item.staff.id}
                className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-charcoal-800 border border-charcoal-700 text-gold-400 font-black text-[10px] flex items-center justify-center">
                    {item.staff.code}
                  </div>
                  <div>
                    <span className="font-bold text-white font-sans">{item.staff.name}</span>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {item.staff.role} • {item.sessionCount} hóa đơn hoàn tất
                    </div>
                  </div>
                </div>

                <div className="text-right font-bold text-white">
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
