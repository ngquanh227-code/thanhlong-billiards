import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDurationHuman } from '../../services/calculation';
import {
  BarChart3,
  Download,
  Award,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    sessions,
    tables,
    staff,
    transactions,
    exportDatabaseJSON,
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
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Báo cáo & Phân tích doanh thu
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cơ cấu doanh thu tiền giờ vs đồ ăn F&B, hiệu suất từng bàn và xuất file CSV
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-charcoal-850 p-0.5 rounded-lg border border-charcoal-750 text-xs">
            {(['TODAY', '7DAYS', 'MONTH', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-charcoal-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'TODAY' ? 'Hôm Nay' : r === '7DAYS' ? '7 Ngày' : r === 'MONTH' ? 'Tháng Này' : 'Tất Cả'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Tổng Doanh Thu</span>
          <div className="text-xl font-bold text-gold-400 font-mono">
            {formatVND(totalGrandRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {completedSessions.length} lượt chơi đã chốt
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Doanh Thu Giờ Chơi</span>
          <div className="text-xl font-bold text-white font-mono">
            {formatVND(totalTableRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng {formatDurationHuman(totalPlayedMinutes)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Doanh Thu F&B</span>
          <div className="text-xl font-bold text-white font-mono">
            {formatVND(totalFnbRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tỷ trọng: {totalGrandRevenue > 0 ? Math.round((totalFnbRevenue / totalGrandRevenue) * 100) : 0}% doanh thu
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Lợi Nhuận Ước Tính</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatVND(netEstimatedProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chi phí vận hành: {formatVND(totalExpenses)}
          </div>
        </div>
      </div>

      {/* 2-Columns: Top Tables Performance & Staff Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Tables Performance */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <h3 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-400" />
            Xếp Hạng Doanh Thu Các Bàn Bida
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {tablePerformance.slice(0, 8).map((item, index) => (
              <div
                key={item.table.id}
                className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-md font-bold flex items-center justify-center text-[11px] ${
                    index === 0
                      ? 'bg-amber-500/20 text-amber-300'
                      : index === 1
                      ? 'bg-slate-700 text-slate-200'
                      : index === 2
                      ? 'bg-amber-900/40 text-amber-400'
                      : 'bg-charcoal-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white">{item.table.code}</span>
                    <span className="text-slate-400 ml-1.5 text-[11px]">({item.table.type})</span>
                    <div className="text-[11px] text-slate-500">
                      {item.sessionCount} lượt chơi • {formatDurationHuman(item.totalMinutes)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-medium text-gold-400">
                  {formatVND(item.totalRevenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Productivity */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <h3 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Doanh Thu Theo Nhân Viên / Thu Ngân
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {staffPerformance.map((item) => (
              <div
                key={item.staff.id}
                className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-charcoal-800 border border-charcoal-700 text-slate-200 font-bold text-xs flex items-center justify-center">
                    {item.staff.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{item.staff.name}</span>
                    <div className="text-[11px] text-slate-500">
                      {item.staff.role} • {item.sessionCount} hóa đơn hoàn tất
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-medium text-white">
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
