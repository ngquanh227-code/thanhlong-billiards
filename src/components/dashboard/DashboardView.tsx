import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatSecondsToTimer, calculateTableFee } from '../../services/calculation';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { tables, sessions, transactions, pricingRules, currentTime } = useApp();

  const completedToday = sessions.filter((s) => s.status === 'COMPLETED');

  const tableRevenueToday = completedToday.reduce((sum, s) => sum + (s.tableFee || 0), 0);
  const fnbRevenueToday = completedToday.reduce((sum, s) => sum + (s.ordersFee || 0), 0);
  const totalRevenueToday = completedToday.reduce((sum, s) => sum + (s.finalTotal || 0), 0);

  const expensesToday = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const estimatedProfit = Math.max(0, totalRevenueToday - expensesToday);

  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

  const hourlyData = [
    { hour: '08:00', amount: 120000, isPeak: false },
    { hour: '10:00', amount: 240000, isPeak: false },
    { hour: '12:00', amount: 380000, isPeak: false },
    { hour: '14:00', amount: 490000, isPeak: false },
    { hour: '16:00', amount: 620000, isPeak: false },
    { hour: '18:00', amount: 1150000, isPeak: true },
    { hour: '20:00', amount: 1680000, isPeak: true },
    { hour: '22:00', amount: 1420000, isPeak: true },
    { hour: '23:30', amount: 890000, isPeak: true },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.amount));

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tổng quan hoạt động
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Báo cáo tài chính ca làm việc và trạng thái bàn bida theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('tables')}
            className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center justify-center transition-colors"
          >
            Sơ đồ bàn
          </button>
          <button
            onClick={() => onNavigateTab('pos')}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center transition-colors shadow-sm"
          >
            Thu ngân
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Doanh thu hôm nay</span>
          <div className="text-2xl font-bold text-white">
            {formatVND(totalRevenueToday)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {completedToday.length} hóa đơn đã chốt
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Tiền giờ chơi</span>
          <div className="text-2xl font-bold text-amber-300">
            {formatVND(tableRevenueToday)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Doanh thu bàn bida
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Dịch vụ đồ ăn & uống</span>
          <div className="text-2xl font-bold text-white">
            {formatVND(fnbRevenueToday)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Doanh số dịch vụ F&B
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1 font-medium">Lợi nhuận ước tính</span>
          <div className="text-2xl font-bold text-emerald-400">
            {formatVND(estimatedProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Chi phí vận hành: {formatVND(expensesToday)}
          </div>
        </div>
      </div>

      {/* Room Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div
          onClick={() => onNavigateTab('tables')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <span className="text-xs text-slate-400 block font-medium">Đang chơi</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{playingCount} bàn</div>
        </div>

        <div
          onClick={() => onNavigateTab('tables')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <span className="text-xs text-slate-400 block font-medium">Bàn trống</span>
          <div className="text-xl font-bold text-slate-200 mt-1">{availableCount} bàn</div>
        </div>

        <div
          onClick={() => onNavigateTab('pos')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <span className="text-xs text-slate-400 block font-medium">Chờ tính</span>
          <div className="text-xl font-bold text-amber-300 mt-1">{waitingCount} bàn</div>
        </div>
      </div>

      {/* Chart & Tables 2-Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">
              Doanh thu theo khung giờ
            </span>
            <span className="text-xs text-amber-300 font-medium">
              Cao điểm: 18:00 - 23:30
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pb-2 border-b border-slate-800">
            {hourlyData.map((item, index) => {
              const heightPercent = Math.round((item.amount / maxHourly) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      item.isPeak ? 'bg-amber-500/80' : 'bg-slate-750 hover:bg-slate-700'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{item.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-700" /> Giờ thường
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/80" /> Giờ cao điểm
            </span>
          </div>
        </div>

        {/* Live Playing Tables List */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-sm font-semibold text-white">Bàn đang chơi ({playingCount})</span>
              <span
                onClick={() => onNavigateTab('tables')}
                className="text-xs text-emerald-400 hover:underline cursor-pointer font-medium"
              >
                Xem tất cả
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {tables
                .filter((t) => t.status === 'PLAYING')
                .slice(0, 5)
                .map((t) => {
                  const sess = sessions.find((s) => s.id === t.currentSessionId);
                  const rule = pricingRules.find((r) => r.type === t.type);
                  const fee = sess ? calculateTableFee(sess, rule, currentTime) : null;

                  return (
                    <div
                      key={t.id}
                      onClick={() => onNavigateTab('tables')}
                      className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 flex items-center justify-between cursor-pointer text-xs border border-slate-800 transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-white">{t.code}</span>
                        <span className="text-slate-400 ml-1.5 text-[11px]">{t.type}</span>
                        <div className="text-[11px] text-slate-400">
                          {sess?.customerName || 'Khách lẻ'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-amber-300">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tables')}
            className="w-full mt-4 py-2 text-center text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors font-medium"
          >
            Vào sơ đồ bàn
          </button>
        </div>
      </div>

      {/* Recent Settled Invoices Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white">
            Giao dịch hoàn tất gần đây
          </span>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Xem báo cáo chi tiết
          </button>
        </div>

        {completedToday.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có hóa đơn nào hoàn tất hôm nay.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="py-2.5 px-3">Mã HĐ</th>
                  <th className="py-2.5 px-3">Bàn</th>
                  <th className="py-2.5 px-3">Khách hàng</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Tổng thu</th>
                  <th className="py-2.5 px-3">Phương thức</th>
                  <th className="py-2.5 px-3">Thu ngân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedToday.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-300">
                      HD-{item.id.slice(-4).toUpperCase()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.tableCode}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.customerName || 'Khách lẻ'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {item.playedMinutes || 0} phút
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-300">
                      {formatVND(item.finalTotal || 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.paymentMethod === 'BANK_TRANSFER' ? 'VietQR' : item.paymentMethod === 'MEMBER_WALLET' ? 'Ví VIP' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {item.cashierName || item.staffName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
