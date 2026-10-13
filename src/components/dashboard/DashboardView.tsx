import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatSecondsToTimer, calculateTableFee } from '../../services/calculation';
import {
  TrendingUp,
  Clock,
  UtensilsCrossed,
  DollarSign,
  BarChart2,
  Receipt,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { tables, sessions, transactions, pricingRules, currentTime } = useApp();

  const completedToday = sessions.filter((s) => s.status === 'COMPLETED');
  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE' || s.status === 'WAITING_PAYMENT');

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
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Tổng quan hoạt động
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Báo cáo doanh thu và tình trạng phòng bàn hôm nay
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('tables')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-medium transition-colors"
          >
            <span>Sơ đồ bàn</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigateTab('pos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            <span>Thu ngân</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards - Clean Stripe / Linear Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Doanh thu hôm nay</span>
          <div className="text-2xl font-bold text-white font-mono">
            {formatVND(totalRevenueToday)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {completedToday.length} hóa đơn đã hoàn tất
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Tiền giờ chơi</span>
          <div className="text-2xl font-bold text-white font-mono">
            {formatVND(tableRevenueToday)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Từ các bàn đã chốt
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Đồ ăn & Nước uống</span>
          <div className="text-2xl font-bold text-white font-mono">
            {formatVND(fnbRevenueToday)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Doanh số dịch vụ F&B
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <span className="text-xs text-slate-400 block mb-1">Lợi nhuận ước tính</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatVND(estimatedProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Chi phí vận hành: {formatVND(expensesToday)}
          </div>
        </div>
      </div>

      {/* Simple Room Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div
          onClick={() => onNavigateTab('tables')}
          className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 cursor-pointer hover:border-charcoal-600 transition-colors"
        >
          <span className="text-xs text-slate-400 block">Đang chơi</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{playingCount} bàn</div>
        </div>

        <div
          onClick={() => onNavigateTab('tables')}
          className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 cursor-pointer hover:border-charcoal-600 transition-colors"
        >
          <span className="text-xs text-slate-400 block">Bàn trống</span>
          <div className="text-xl font-bold text-slate-200 font-mono mt-0.5">{availableCount} bàn</div>
        </div>

        <div
          onClick={() => onNavigateTab('pos')}
          className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 cursor-pointer hover:border-charcoal-600 transition-colors"
        >
          <span className="text-xs text-slate-400 block">Chờ thanh toán</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{waitingCount} bàn</div>
        </div>
      </div>

      {/* Chart & Tables 2-Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300">
              Doanh thu theo khung giờ
            </span>
            <span className="text-[11px] text-slate-400">
              Cao điểm: 18:00 - 23:30
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pb-2 border-b border-charcoal-750">
            {hourlyData.map((item, index) => {
              const heightPercent = Math.round((item.amount / maxHourly) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    className={`w-full rounded-t transition-all ${
                      item.isPeak ? 'bg-amber-500/80' : 'bg-charcoal-700 hover:bg-charcoal-650'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{item.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-charcoal-700" /> Giờ thường
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-amber-500/80" /> Giờ cao điểm
            </span>
          </div>
        </div>

        {/* Live Playing Tables List */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">Bàn đang chơi ({playingCount})</span>
              <span
                onClick={() => onNavigateTab('tables')}
                className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
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
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{t.code}</span>
                        <span className="text-slate-400 ml-1.5 text-[11px]">{t.type}</span>
                        <div className="text-[11px] text-slate-400">
                          {sess?.customerName || 'Khách lẻ'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-medium text-slate-200">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
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
            className="w-full mt-3 py-1.5 text-center text-xs text-slate-300 hover:text-white bg-charcoal-800 rounded-lg transition-colors"
          >
            Vào sơ đồ bàn
          </button>
        </div>
      </div>

      {/* Recent Settled Invoices Table */}
      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300">
            Giao dịch hoàn tất gần đây
          </span>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Xem báo cáo đầy đủ →
          </button>
        </div>

        {completedToday.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Chưa có hóa đơn nào hoàn tất hôm nay.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">Mã</th>
                  <th className="py-2 px-3">Bàn</th>
                  <th className="py-2 px-3">Khách Hàng</th>
                  <th className="py-2 px-3">Thời Gian</th>
                  <th className="py-2 px-3">Tổng Thu</th>
                  <th className="py-2 px-3">Phương Thức</th>
                  <th className="py-2 px-3">Thu Ngân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {completedToday.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-800 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-300">
                      HD-{item.id.slice(-4).toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.tableCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {item.customerName || 'Khách lẻ'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {item.playedMinutes || 0} phút
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                      {formatVND(item.finalTotal || 0)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-charcoal-800 text-slate-300">
                        {item.paymentMethod === 'BANK_TRANSFER' ? 'VietQR' : item.paymentMethod === 'MEMBER_WALLET' ? 'Ví' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
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
