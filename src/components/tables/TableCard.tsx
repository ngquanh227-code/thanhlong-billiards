import React from 'react';
import { TableItem, TableSession, PricingRule } from '../../types';
import { calculateTableFee, formatSecondsToTimer, formatVND } from '../../services/calculation';
import { Play, Receipt, UtensilsCrossed, Clock, User, Wrench } from 'lucide-react';

interface TableCardProps {
  table: TableItem;
  session?: TableSession;
  pricingRule?: PricingRule;
  currentTime: Date;
  isSelected?: boolean;
  onSelectTable?: (table: TableItem) => void;
  onOpenTable: (table: TableItem) => void;
  onPauseTable: (table: TableItem) => void;
  onResumeTable: (table: TableItem) => void;
  onTransferTable: (table: TableItem) => void;
  onOrderMenu: (table: TableItem) => void;
  onCheckout: (table: TableItem, session: TableSession) => void;
  onToggleMaintenance: (table: TableItem) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  session,
  pricingRule,
  currentTime,
  isSelected,
  onSelectTable,
  onOpenTable,
  onOrderMenu,
  onCheckout,
  onToggleMaintenance,
}) => {
  const feeInfo = session ? calculateTableFee(session, pricingRule, currentTime) : null;

  const isAvailable = table.status === 'AVAILABLE';
  const isPlaying = table.status === 'PLAYING';
  const isWaiting = table.status === 'WAITING_PAYMENT';
  const isMaintenance = table.status === 'MAINTENANCE';
  const isPaused = session?.status === 'PAUSED';

  // Minimal type badge
  const getTypeName = (type: string) => {
    switch (type) {
      case 'POOL': return 'Pool';
      case 'CAROM': return 'Carom';
      case 'VIP': return 'VIP';
      case 'SNOOKER': return 'Snooker';
      default: return type;
    }
  };

  return (
    <div
      onClick={() => onSelectTable && onSelectTable(table)}
      className={`group relative flex flex-col justify-between rounded-xl bg-charcoal-850 border p-4 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-gold-400 border-gold-400 shadow-[0_0_18px_rgba(212,175,55,0.25)]'
          : isPlaying
          ? isPaused
            ? 'border-amber-500/40 bg-charcoal-850/90 hover:border-amber-400/70'
            : 'border-emerald-500/40 bg-charcoal-850/90 hover:border-emerald-400/70'
          : isWaiting
          ? 'border-amber-500/50 bg-charcoal-850 hover:border-amber-400/80'
          : isMaintenance
          ? 'border-charcoal-700/50 opacity-60'
          : 'border-charcoal-700/60 hover:border-charcoal-500'
      }`}
    >
      <div>
        {/* Header: Table Code, Type & Status Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-tight">
              {table.code}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-400">
              {getTypeName(table.type)}
            </span>
          </div>

          {/* Clean status pill */}
          <div>
            {isPlaying ? (
              isPaused ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Tạm dừng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  Đang chơi
                </span>
              )
            ) : isWaiting ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Chờ tính
              </span>
            ) : isMaintenance ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                <Wrench className="w-3 h-3" />
                Bảo trì
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-charcoal-800 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Trống
              </span>
            )}
          </div>
        </div>

        {/* Center: Clean Stats Area */}
        <div className="py-2.5 border-y border-charcoal-800 my-1">
          {session && feeInfo ? (
            <div className="flex flex-col gap-1.5">
              {/* Large, clean clock */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian:</span>
                </div>
                <div className="font-mono text-xl font-bold text-white tracking-wider">
                  {formatSecondsToTimer(feeInfo.netSeconds)}
                </div>
              </div>

              {/* Total amount */}
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Tạm tính:</span>
                <span className="font-mono text-base font-bold text-gold-400">
                  {formatVND(feeInfo.grandTotal)}
                </span>
              </div>

              {/* Guest or orders info */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="truncate max-w-[130px] flex items-center gap-1 text-slate-300">
                  <User className="w-3 h-3 text-slate-400" />
                  {session.customerName || 'Khách vãng lai'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {session.orders?.length > 0 ? `${session.orders.length} món` : 'Chưa gọi món'}
                </span>
              </div>
            </div>
          ) : isMaintenance ? (
            <div className="py-4 text-center text-xs text-slate-400 italic">
              {table.notes || 'Đang bảo trì định kỳ'}
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-semibold text-slate-200">
                {formatVND(table.hourlyRate)}/giờ
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{table.area}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions: Clean and focused */}
      <div className="mt-3 pt-1" onClick={(e) => e.stopPropagation()}>
        {isAvailable && (
          <button
            onClick={() => onOpenTable(table)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Mở Bàn
          </button>
        )}

        {(isPlaying || isWaiting) && session && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOrderMenu(table)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-medium transition-colors"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
              <span>Gọi Món</span>
            </button>

            <button
              onClick={() => onCheckout(table, session)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Thanh Toán</span>
            </button>
          </div>
        )}

        {isMaintenance && (
          <button
            onClick={() => onToggleMaintenance(table)}
            className="w-full py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 text-xs font-medium transition-colors"
          >
            Mở Lại Bàn
          </button>
        )}
      </div>
    </div>
  );
};
