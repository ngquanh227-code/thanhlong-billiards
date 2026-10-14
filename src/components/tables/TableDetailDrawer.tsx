import React from 'react';
import { TableItem, TableSession, PricingRule, Customer } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';

interface TableDetailDrawerProps {
  table: TableItem | null;
  session?: TableSession;
  pricingRule?: PricingRule;
  customer?: Customer;
  currentTime: Date;
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderModal: (table: TableItem) => void;
  onOpenTransferModal: (table: TableItem) => void;
  onOpenMergeModal: (table: TableItem) => void;
  onPauseTable: (table: TableItem) => void;
  onResumeTable: (table: TableItem) => void;
  onCheckoutTable: (table: TableItem, session: TableSession) => void;
  onUpdateOrderItemQty: (tableId: string, orderItemId: string, delta: number) => void;
  onRemoveOrderItem: (tableId: string, orderItemId: string) => void;
}

export const TableDetailDrawer: React.FC<TableDetailDrawerProps> = ({
  table,
  session,
  pricingRule,
  currentTime,
  isOpen,
  onClose,
  onOpenOrderModal,
  onOpenTransferModal,
  onOpenMergeModal,
  onPauseTable,
  onResumeTable,
  onCheckoutTable,
  onUpdateOrderItemQty,
  onRemoveOrderItem,
}) => {
  if (!isOpen || !table) return null;

  const isPlaying = table.status === 'PLAYING';
  const isPaused = session?.status === 'PAUSED';
  const feeCalc = session ? calculateTableFee(session, pricingRule, currentTime) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between select-none">
        {/* Drawer Header */}
        <div className="p-3.5 bg-charcoal-850 border-b border-charcoal-750 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="font-mono text-xs font-black px-2.5 py-1 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              {table.code}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-300">
                  {table.type}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isPlaying
                    ? isPaused
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-charcoal-800 text-slate-400 border border-charcoal-700'
                }`}>
                  {isPlaying ? (isPaused ? '■ TẠM DỪNG' : '● ĐANG CHƠI') : '○ TRỐNG'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{table.area} • {formatVND(table.hourlyRate)}/H</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 px-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 font-mono text-xs font-bold transition-colors"
          >
            ✕ ĐÓNG
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          {session && feeCalc ? (
            <>
              {/* Session Time & Rate Box */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 tracking-wider">
                    GIỜ VÀO: {new Date(session.startTime).toLocaleTimeString('vi-VN')}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    THỜI GIAN: <b className="text-white">{formatDurationHuman(feeCalc.billedMinutes)}</b>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white tracking-wider">
                    {formatSecondsToTimer(feeCalc.netSeconds)}
                  </div>
                  <div className="text-xs font-bold text-gold-400">
                    {formatVND(feeCalc.tableFee)}
                  </div>
                </div>
              </div>

              {/* Customer Info Card if tagged */}
              {session.customerName && (
                <div className="p-2.5 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">KHÁCH HÀNG:</span>
                    <span className="font-bold text-white text-xs">{session.customerName}</span>
                    {session.customerPhone && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {session.customerPhone}
                      </span>
                    )}
                  </div>

                  {session.customerTier && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20">
                      HẠNG {session.customerTier}
                    </span>
                  )}
                </div>
              )}

              {/* Order Items Table */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    MÓN ĐÃ GỌI ({session.orders?.length || 0})
                  </span>

                  <button
                    onClick={() => onOpenOrderModal(table)}
                    className="px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 text-xs font-mono font-bold border border-charcoal-700 transition-colors"
                  >
                    + THÊM MÓN
                  </button>
                </div>

                {(!session.orders || session.orders.length === 0) ? (
                  <div className="py-5 text-center text-xs text-slate-400 rounded-lg bg-charcoal-850 border border-charcoal-750 font-mono">
                    Chưa có món nào được gọi.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {session.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-2 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-semibold text-white truncate block text-[11px]">{ord.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatVND(ord.price)} / {ord.unit}
                          </span>
                        </div>

                        {/* Inline Stepper */}
                        <div className="flex items-center gap-1 mr-2">
                          <button
                            onClick={() => onUpdateOrderItemQty(table.id, ord.id, -1)}
                            className="w-5 h-5 rounded bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-center text-slate-200 font-mono font-bold text-xs"
                          >
                            −
                          </button>
                          <span className="font-mono font-bold text-white px-1 text-xs">{ord.quantity}</span>
                          <button
                            onClick={() => onUpdateOrderItemQty(table.id, ord.id, 1)}
                            className="w-5 h-5 rounded bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-center text-slate-200 font-mono font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-200 text-xs">
                            {formatVND(ord.price * ord.quantity)}
                          </span>
                          <button
                            onClick={() => onRemoveOrderItem(table.id, ord.id)}
                            className="text-slate-400 hover:text-rose-400 text-xs font-mono p-1 rounded"
                            title="Xóa món"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal Calculations Card */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs font-mono flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>TIỀN GIỜ:</span>
                  <span className="text-white">{formatVND(feeCalc.tableFee)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TIỀN F&B:</span>
                  <span className="text-white">{formatVND(feeCalc.fnbFee)}</span>
                </div>
                {feeCalc.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>ƯU ĐÃI VIP:</span>
                    <span>-{formatVND(feeCalc.discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-charcoal-750 flex justify-between items-baseline font-black">
                  <span className="text-slate-300">TỔNG TẠM TÍNH:</span>
                  <span className="text-gold-400 text-base">{formatVND(feeCalc.grandTotal)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              Bàn này hiện đang trống.
            </div>
          )}
        </div>

        {/* Drawer Action Buttons Footer */}
        {session && (
          <div className="p-3.5 bg-charcoal-850 border-t border-charcoal-750 flex flex-col gap-2 font-mono">
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              {isPaused ? (
                <button
                  onClick={() => onResumeTable(table)}
                  className="p-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-center"
                >
                  TIẾP TỤC
                </button>
              ) : (
                <button
                  onClick={() => onPauseTable(table)}
                  className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-amber-400 border border-charcoal-700 text-center"
                >
                  TẠM DỪNG
                </button>
              )}

              <button
                onClick={() => onOpenTransferModal(table)}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-center"
              >
                ĐỔI BÀN
              </button>

              <button
                onClick={() => onOpenMergeModal(table)}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-purple-300 border border-charcoal-700 text-center"
              >
                GỘP BÀN
              </button>
            </div>

            <button
              onClick={() => onCheckoutTable(table, session)}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center tracking-wider"
            >
              <span>THANH TOÁN HÓA ĐƠN</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
