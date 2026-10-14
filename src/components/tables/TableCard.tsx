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

  const isMaintenance = table.status === 'MAINTENANCE';
  const hasActiveSession = Boolean(session && (session.status === 'ACTIVE' || session.status === 'WAITING_PAYMENT' || session.status === 'PAUSED'));
  const isPlaying = table.status === 'PLAYING' && hasActiveSession;
  const isWaiting = table.status === 'WAITING_PAYMENT' && hasActiveSession;
  const isAvailable = table.status === 'AVAILABLE' || (!hasActiveSession && !isMaintenance);
  const isPaused = session?.status === 'PAUSED';

  const getTypeName = (type: string) => {
    switch (type) {
      case 'POOL': return 'Bàn Lỗ';
      case 'CAROM': return 'Carom';
      case 'VIP': return 'Phòng VIP';
      case 'SNOOKER': return 'Snooker';
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'POOL': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25';
      case 'CAROM': return 'bg-purple-500/10 text-purple-300 border-purple-500/25';
      case 'VIP': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'SNOOKER': return 'bg-blue-500/10 text-blue-300 border-blue-500/25';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      onClick={() => onSelectTable && onSelectTable(table)}
      className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none font-sans ${
        isSelected
          ? 'bg-slate-900 border-2 border-amber-400 shadow-lg'
          : isPlaying
          ? isPaused
            ? 'bg-slate-900 border border-amber-500/40 hover:border-amber-400'
            : 'bg-slate-900 border border-emerald-500/40 hover:border-emerald-400'
          : isWaiting
          ? 'bg-slate-900 border border-amber-500/50 hover:border-amber-400'
          : isMaintenance
          ? 'bg-slate-900/40 border border-slate-800 opacity-60'
          : 'bg-slate-900 border border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header: Table Code, Type, and Status */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/60">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight">
                {table.code}
              </h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap border ${getTypeBadge(table.type)}`}>
                {getTypeName(table.type)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[150px]">
              {table.area}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status indicator */}
            {isPlaying ? (
              isPaused ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-medium border border-amber-500/25 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  <span>Tạm dừng</span>
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>Đang chơi</span>
                </span>
              )
            ) : isWaiting ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span>Chờ tính</span>
              </span>
            ) : isMaintenance ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium whitespace-nowrap">
                Bảo trì
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-medium whitespace-nowrap flex items-center gap-1.5 border border-slate-700/40">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                <span>Bàn trống</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Table Content */}
        <div className="py-3.5">
          {session && feeInfo ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Thời gian chơi</span>
                <span className="text-xl font-bold text-white tracking-tight font-mono">
                  {formatSecondsToTimer(feeInfo.netSeconds)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Tạm tính</span>
                <span className="text-base font-bold text-amber-300">
                  {formatVND(feeInfo.grandTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-800/60">
                <span className="truncate max-w-[140px] text-slate-300 font-medium">
                  {session.customerName || 'Khách vãng lai'}
                </span>
                <span className="text-slate-400">
                  {session.orders?.length > 0 ? `${session.orders.length} món` : 'Chưa gọi món'}
                </span>
              </div>
            </div>
          ) : isMaintenance ? (
            <div className="py-4 text-center text-xs text-slate-400 italic">
              {table.notes || 'Bàn đang được bảo trì định kỳ'}
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-slate-200">
                {formatVND(table.hourlyRate)} / giờ
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {table.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2.5 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
        {isAvailable && (
          <button
            onClick={() => onOpenTable(table)}
            className="w-full h-11 sm:h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center transition-all shadow-sm active:scale-[0.98] truncate"
          >
            Mở bàn
          </button>
        )}

        {(isPlaying || isWaiting) && session && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOrderMenu(table)}
              className="flex-1 h-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center transition-all border border-slate-700/60 active:scale-[0.98] truncate"
            >
              Gọi món
            </button>

            <button
              onClick={() => onCheckout(table, session)}
              className="flex-1 h-11 sm:h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center transition-all shadow-sm active:scale-[0.98] truncate"
            >
              Thanh toán
            </button>
          </div>
        )}

        {isMaintenance && (
          <button
            onClick={() => onToggleMaintenance(table)}
            className="w-full h-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center justify-center transition-all border border-slate-750 truncate active:scale-98"
          >
            Mở lại bàn
          </button>
        )}
      </div>
    </div>
  );
};
