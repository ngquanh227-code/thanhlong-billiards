import React from 'react';
import { TableItem, TableSession, PricingRule } from '../../types';
import { calculateTableFee, formatSecondsToTimer, formatVND } from '../../services/calculation';

interface TableCardProps {
  table: TableItem;
  session?: TableSession;
  pricingRule?: PricingRule;
  currentTime: Date;
  isSelected?: boolean;
  isAdmin?: boolean;
  onSelectTable?: (table: TableItem) => void;
  onOpenTable: (table: TableItem) => void;
  onPauseTable: (table: TableItem) => void;
  onResumeTable: (table: TableItem) => void;
  onTransferTable: (table: TableItem) => void;
  onOrderMenu: (table: TableItem) => void;
  onCheckout: (table: TableItem, session: TableSession) => void;
  onToggleMaintenance: (table: TableItem) => void;
  onEditTable?: (table: TableItem) => void;
  onDeleteTable?: (table: TableItem) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  session,
  pricingRule,
  currentTime,
  isSelected,
  isAdmin,
  onSelectTable,
  onOpenTable,
  onOrderMenu,
  onCheckout,
  onToggleMaintenance,
  onEditTable,
  onDeleteTable,
}) => {
  const feeInfo = session ? calculateTableFee(session, pricingRule, currentTime) : null;

  const isAvailable = table.status === 'AVAILABLE';
  const isPlaying = table.status === 'PLAYING';
  const isWaiting = table.status === 'WAITING_PAYMENT';
  const isMaintenance = table.status === 'MAINTENANCE';
  const isPaused = session?.status === 'PAUSED';

  const getTypeName = (type: string) => {
    switch (type) {
      case 'POOL': return 'LỖ';
      case 'CAROM': return 'CAROM';
      case 'VIP': return 'VIP';
      case 'SNOOKER': return 'SNOOKER';
      default: return type;
    }
  };

  return (
    <div
      onClick={() => onSelectTable && onSelectTable(table)}
      className={`group relative flex flex-col justify-between rounded-xl bg-[#0f141f] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? 'ring-2 ring-gold-400 border-gold-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-[#141b29]'
          : isPlaying
          ? isPaused
            ? 'border-amber-500/40 bg-[#141720] hover:border-amber-400/70'
            : 'border-emerald-500/40 bg-[#0f181c] hover:border-emerald-400/70'
          : isWaiting
          ? 'border-amber-500/50 bg-[#16171a] hover:border-amber-400/80'
          : isMaintenance
          ? 'border-charcoal-700/50 opacity-60 bg-charcoal-900'
          : 'border-charcoal-750 hover:border-charcoal-600 bg-[#0d121b]'
      }`}
    >
      <div>
        {/* Admin Quick Action Strip (Chỉ hiển thị khi là Admin) */}
        {isAdmin && (
          <div
            className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-charcoal-750/80 text-[10px] font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-amber-400 font-bold shrink-0">[ADMIN]</span>
              <span className="text-slate-400 truncate max-w-[110px]" title={table.name}>
                {table.name}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEditTable && onEditTable(table)}
                className="px-2 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-amber-300 border border-amber-500/30 hover:border-amber-500 font-bold transition-colors"
                title="Chỉnh sửa tên bàn, mã bàn, giá giờ, loại bàn, khu vực"
              >
                [SỬA BÀN]
              </button>
              {isAvailable && onDeleteTable && (
                <button
                  onClick={() => onDeleteTable(table)}
                  className="px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-rose-950/70 text-slate-400 hover:text-rose-400 border border-charcoal-700 hover:border-rose-800/50 transition-colors font-bold"
                  title="Xóa bàn khỏi hệ thống"
                >
                  [XÓA]
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header: Table Code, Type & Typographic Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-heading text-sm sm:text-base font-black text-white tracking-wide">
              {table.code}
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400 border border-charcoal-700">
              {getTypeName(table.type)}
            </span>
          </div>

          {/* Clean typographic status badge */}
          <div>
            {isPlaying ? (
              isPaused ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  ■ TẠM DỪNG
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● ĐANG CHƠI
                </span>
              )
            ) : isWaiting ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ▲ CHỜ TÍNH
              </span>
            ) : isMaintenance ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                × BẢO TRÌ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-charcoal-800 text-slate-400 border border-charcoal-700">
                ○ TRỐNG
              </span>
            )}
          </div>
        </div>

        {/* Center: Clean Stats Area */}
        <div className="py-2.5 border-y border-charcoal-750 my-1 font-mono">
          {session && feeInfo ? (
            <div className="flex flex-col gap-1.5">
              {/* Timer */}
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400 tracking-wider">THỜI GIAN:</span>
                <span className="text-lg sm:text-xl font-black text-white tracking-wider">
                  {formatSecondsToTimer(feeInfo.netSeconds)}
                </span>
              </div>

              {/* Total amount */}
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400 tracking-wider">TẠM TÍNH:</span>
                <span className="text-sm sm:text-base font-black text-gold-400">
                  {formatVND(feeInfo.grandTotal)}
                </span>
              </div>

              {/* Guest or orders info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-charcoal-800/60 font-sans">
                <span className="truncate max-w-[130px] font-medium text-slate-300">
                  KHÁCH: {session.customerName || 'Vãng lai'}
                </span>
                <span className="font-mono text-slate-400">
                  {session.orders?.length > 0 ? `${session.orders.length} MÓN` : 'CHƯA MÓN'}
                </span>
              </div>
            </div>
          ) : isMaintenance ? (
            <div className="py-3 text-center text-xs text-slate-400 italic font-sans">
              {table.notes || 'Đang bảo trì định kỳ'}
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-slate-200">
                {formatVND(table.hourlyRate)}/GIỜ
              </span>
              <span className="text-[11px] text-slate-400 font-sans mt-0.5">{table.area}</span>
              {!isAdmin && <span className="text-[10px] text-slate-500 font-sans mt-0.5">{table.name}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions: High contrast, thumb-friendly */}
      <div className="mt-2.5 pt-1" onClick={(e) => e.stopPropagation()}>
        {isAvailable && (
          <button
            onClick={() => onOpenTable(table)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-mono font-bold text-xs tracking-wider transition-all"
          >
            + MỞ BÀN
          </button>
        )}

        {(isPlaying || isWaiting) && session && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOrderMenu(table)}
              className="flex-1 py-2 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-mono font-bold tracking-wider transition-colors active:scale-98"
            >
              GỌI MÓN
            </button>

            <button
              onClick={() => onCheckout(table, session)}
              className="flex-1 py-2 px-2 rounded-lg bg-gold-500 hover:bg-amber-400 active:scale-98 text-charcoal-950 font-mono font-black text-xs tracking-wider transition-colors"
            >
              THANH TOÁN
            </button>
          </div>
        )}

        {isMaintenance && (
          <button
            onClick={() => onToggleMaintenance(table)}
            className="w-full py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 text-xs font-mono font-bold tracking-wider transition-colors"
          >
            MỞ LẠI BÀN
          </button>
        )}
      </div>
    </div>
  );
};
