import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDurationHuman } from '../../services/calculation';

export const ReportsView: React.FC = () => {
  const {
    sessions,
    tables,
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
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Báo cáo & Doanh thu
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cơ cấu doanh thu tiền giờ vs dịch vụ F&B, hiệu suất bàn và xuất dữ liệu kế toán
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

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Tổng doanh thu</span>
          <div className="text-2xl font-bold text-amber-300">
            {formatVND(totalGrandRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {completedSessions.length} lượt chơi đã chốt
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Doanh thu tiền giờ</span>
          <div className="text-2xl font-bold text-white">
            {formatVND(totalTableRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Tổng {formatDurationHuman(totalPlayedMinutes)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Doanh thu F&B</span>
          <div className="text-2xl font-bold text-white">
            {formatVND(totalFnbRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Tỷ trọng: {totalGrandRevenue > 0 ? Math.round((totalFnbRevenue / totalGrandRevenue) * 100) : 0}% tổng thu
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Lợi nhuận ước tính</span>
          <div className="text-2xl font-bold text-emerald-400">
            {formatVND(netEstimatedProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Chi phí vận hành: {formatVND(totalExpenses)}
          </div>
        </div>
      </div>

      {/* Top Tables Performance */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <h3 className="text-sm font-semibold text-white mb-3.5">
          Xếp hạng doanh thu theo bàn
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {tablePerformance.slice(0, 8).map((item, index) => (
            <div
              key={item.table.id}
              className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg font-semibold flex items-center justify-center text-xs shrink-0 ${
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

              <div className="text-right font-bold text-amber-300 shrink-0">
                {formatVND(item.totalRevenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
