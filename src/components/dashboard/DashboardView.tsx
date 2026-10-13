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
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            TỔNG QUAN HOẠT ĐỘNG
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Báo cáo tài chính ca và tình trạng bàn bida thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => onNavigateTab('tables')}
            className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-bold transition-colors"
          >
            SƠ ĐỒ BÀN →
          </button>
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors"
          >
            THU NGÂN
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">DOANH THU HÔM NAY</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatVND(totalRevenueToday)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            {completedToday.length} hóa đơn đã hoàn tất
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">TIỀN GIỜ CHƠI</span>
          <div className="text-xl sm:text-2xl font-black text-gold-400">
            {formatVND(tableRevenueToday)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            Doanh thu bàn bida
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">ĐỒ ĂN & NƯỚC UỐNG</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatVND(fnbRevenueToday)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            Doanh số dịch vụ F&B
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">LỢI NHUẬN ƯỚC TÍNH</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatVND(estimatedProfit)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">
            Chi phí vận hành: {formatVND(expensesToday)}
          </div>
        </div>
      </div>

      {/* Room Counters */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 font-mono">
        <div
          onClick={() => onNavigateTab('tables')}
          className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 block">● ĐANG CHƠI</span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">{playingCount} BÀN</div>
        </div>

        <div
          onClick={() => onNavigateTab('tables')}
          className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 cursor-pointer hover:border-slate-500 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 block">○ BÀN TRỐNG</span>
          <div className="text-lg sm:text-xl font-black text-slate-200 mt-0.5">{availableCount} BÀN</div>
        </div>

        <div
          onClick={() => onNavigateTab('pos')}
          className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 block">▲ CHỜ TÍNH</span>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">{waitingCount} BÀN</div>
        </div>
      </div>

      {/* Chart & Tables 2-Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">
              DOANH THU THEO KHUNG GIỜ
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              CAO ĐIỂM: 18:00 - 23:30
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-1.5 sm:gap-2 pb-2 border-b border-charcoal-750">
            {hourlyData.map((item, index) => {
              const heightPercent = Math.round((item.amount / maxHourly) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    className={`w-full rounded-t transition-all ${
                      item.isPeak ? 'bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-charcoal-700 hover:bg-charcoal-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{item.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-charcoal-700" /> GIỜ THƯỜNG
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-amber-500/80" /> GIỜ CAO ĐIỂM
            </span>
          </div>
        </div>

        {/* Live Playing Tables List */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300">BÀN ĐANG CHƠI ({playingCount})</span>
              <span
                onClick={() => onNavigateTab('tables')}
                className="text-[10px] text-emerald-400 hover:underline cursor-pointer font-bold"
              >
                XEM TẤT CẢ →
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
                        <span className="font-bold text-white">{t.code}</span>
                        <span className="text-slate-400 ml-1.5 text-[10px]">{t.type}</span>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {sess?.customerName || 'Khách lẻ'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gold-400">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </div>
                        <div className="text-[10px] text-slate-400">
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
            className="w-full mt-3 py-1.5 text-center text-xs text-slate-300 hover:text-white bg-charcoal-800 rounded-lg transition-colors font-bold"
          >
            VÀO SƠ ĐỒ BÀN
          </button>
        </div>
      </div>

      {/* Recent Settled Invoices Table */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300">
            GIAO DỊCH HOÀN TẤT GẦN ĐÂY
          </span>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-slate-400 hover:text-white font-bold"
          >
            XEM BÁO CÁO →
          </button>
        </div>

        {completedToday.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-sans">
            Chưa có hóa đơn nào hoàn tất hôm nay.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">MÃ</th>
                  <th className="py-2 px-3">BÀN</th>
                  <th className="py-2 px-3">KHÁCH HÀNG</th>
                  <th className="py-2 px-3">THỜI GIAN</th>
                  <th className="py-2 px-3">TỔNG THU</th>
                  <th className="py-2 px-3">PHƯƠNG THỨC</th>
                  <th className="py-2 px-3">THU NGÂN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {completedToday.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-800 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">
                      HD-{item.id.slice(-4).toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {item.tableCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      {item.customerName || 'Khách lẻ'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {item.playedMinutes || 0} phút
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gold-400">
                      {formatVND(item.finalTotal || 0)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-charcoal-800 text-slate-300 border border-charcoal-700">
                        {item.paymentMethod === 'BANK_TRANSFER' ? 'VIETQR' : item.paymentMethod === 'MEMBER_WALLET' ? 'VÍ' : 'TIỀN MẶT'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
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
