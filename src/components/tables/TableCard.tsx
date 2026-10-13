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
      case 'POOL': return 'Bàn Lỗ';
      case 'CAROM': return 'Carom';
      case 'VIP': return 'Phòng VIP';
      case 'SNOOKER': return 'Snooker';
      default: return type;
    }
  };

  return (
    <div
      onClick={() => onSelectTable && onSelectTable(table)}
      className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none font-sans ${
        isSelected
          ? 'bg-[#151b28] border-2 border-amber-400/80 shadow-lg'
          : isPlaying
          ? isPaused
            ? 'bg-[#121622] border border-amber-500/30 hover:border-amber-400/60'
            : 'bg-[#111722] border border-emerald-500/30 hover:border-emerald-400/60'
          : isWaiting
          ? 'bg-[#15171e] border border-amber-500/40 hover:border-amber-400/60'
          : isMaintenance
          ? 'bg-slate-900/40 border border-slate-800 opacity-60'
          : 'bg-[#11141c] border border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header: Table Code, Type, and Status */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/60">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {table.code}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-medium">
                {getTypeName(table.type)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[150px]">
              {table.area}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            {isPlaying ? (
              isPaused ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20">
                  Tạm dừng
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20">
                  Đang chơi
                </span>
              )
            ) : isWaiting ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-medium border border-amber-500/25">
                Chờ tính
              </span>
            ) : isMaintenance ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                Bảo trì
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-400 font-medium">
                Bàn trống
              </span>
            )}

            {/* Admin discrete action button */}
            {isAdmin && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEditTable && onEditTable(table)}
                  className="text-xs text-amber-400/90 hover:text-amber-300 hover:underline px-1 py-0.5 transition-colors font-medium"
                  title="Chỉnh sửa thông tin bàn"
                >
                  Sửa
                </button>
                {isAvailable && onDeleteTable && (
                  <button
                    onClick={() => onDeleteTable(table)}
                    className="text-xs text-slate-500 hover:text-rose-400 hover:underline px-1 py-0.5 transition-colors"
                    title="Xóa bàn"
                  >
                    Xóa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Table Content */}
        <div className="py-3">
          {session && feeInfo ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Thời gian chơi</span>
                <span className="text-xl font-semibold text-white tracking-tight">
                  {formatSecondsToTimer(feeInfo.netSeconds)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Tạm tính</span>
                <span className="text-base font-bold text-amber-300">
                  {formatVND(feeInfo.grandTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/50">
                <span className="truncate max-w-[140px] text-slate-300">
                  {session.customerName || 'Khách vãng lai'}
                </span>
                <span>
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
              <span className="text-base font-semibold text-slate-200">
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
      <div className="pt-2 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
        {isAvailable && (
          <button
            onClick={() => onOpenTable(table)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            Mở bàn
          </button>
        )}

        {(isPlaying || isWaiting) && session && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOrderMenu(table)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Gọi món
            </button>

            <button
              onClick={() => onCheckout(table, session)}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              Thanh toán
            </button>
          </div>
        )}

        {isMaintenance && (
          <button
            onClick={() => onToggleMaintenance(table)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Mở lại bàn
          </button>
        )}
      </div>
    </div>
  );
};
