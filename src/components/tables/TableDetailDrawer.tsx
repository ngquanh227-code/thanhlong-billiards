import React from 'react';
import { TableItem, TableSession, PricingRule, Customer } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import {
  X,
  Clock,
  User,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  ArrowRightLeft,
  Layers,
  Pause,
  Play,
  Printer,
  Receipt,
} from 'lucide-react';

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
  customer,
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

  const handlePrePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-md bg-charcoal-900 border-l border-charcoal-750 shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 bg-charcoal-850 border-b border-charcoal-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-white font-bold text-xs">
              🎱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{table.code}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-400 font-medium">
                  {table.type}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                  isPlaying
                    ? isPaused
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-charcoal-800 text-slate-400'
                }`}>
                  {isPlaying ? (isPaused ? 'Tạm dừng' : 'Đang chơi') : 'Trống'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{table.area} • {formatVND(table.hourlyRate)}/h</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {session && feeCalc ? (
            <>
              {/* Session Time & Rate Pill */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Giờ vào: {new Date(session.startTime).toLocaleTimeString('vi-VN')}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Thời gian: <b className="text-white font-medium">{formatDurationHuman(feeCalc.billedMinutes)}</b>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-white tracking-wider">
                    {formatSecondsToTimer(feeCalc.netSeconds)}
                  </div>
                  <div className="text-xs font-mono font-bold text-gold-400">
                    {formatVND(feeCalc.tableFee)}
                  </div>
                </div>
              </div>

              {/* Customer Info Card if tagged */}
              {session.customerName && (
                <div className="p-2.5 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-white">{session.customerName}</span>
                      {session.customerPhone && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {session.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {session.customerTier && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-charcoal-800 text-slate-300">
                      Hạng {session.customerTier}
                    </span>
                  )}
                </div>
              )}

              {/* Order Items Table in Sapo FnB style */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                    Món đã gọi ({session.orders?.length || 0})
                  </span>

                  <button
                    onClick={() => onOpenOrderModal(table)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 text-xs font-medium border border-charcoal-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm món</span>
                  </button>
                </div>

                {(!session.orders || session.orders.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-500 rounded-lg bg-charcoal-850 border border-charcoal-750">
                    Chưa có món nào được gọi.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                    {session.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-2 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-medium text-white truncate block">{ord.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatVND(ord.price)} / {ord.unit}
                          </span>
                        </div>

                        {/* Inline Stepper */}
                        <div className="flex items-center gap-1 mr-2">
                          <button
                            onClick={() => onUpdateOrderItemQty(table.id, ord.id, -1)}
                            className="w-5 h-5 rounded bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-center text-slate-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-white px-1">{ord.quantity}</span>
                          <button
                            onClick={() => onUpdateOrderItemQty(table.id, ord.id, 1)}
                            className="w-5 h-5 rounded bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-center text-slate-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <span className="font-mono font-medium text-slate-200">
                            {formatVND(ord.price * ord.quantity)}
                          </span>
                          <button
                            onClick={() => onRemoveOrderItem(table.id, ord.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5"
                            title="Xóa món"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal Calculations Card */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Tiền giờ chơi:</span>
                  <span className="font-mono text-white">{formatVND(feeCalc.tableFee)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tiền đồ ăn, nước uống:</span>
                  <span className="font-mono text-white">{formatVND(feeCalc.fnbFee)}</span>
                </div>
                {feeCalc.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400 font-medium">
                    <span>Ưu đãi:</span>
                    <span className="font-mono">-{formatVND(feeCalc.discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-charcoal-750 flex justify-between items-baseline font-bold">
                  <span className="text-slate-300">TỔNG TẠM TÍNH:</span>
                  <span className="font-mono text-gold-400 text-base">{formatVND(feeCalc.grandTotal)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              Bàn này hiện đang trống.
            </div>
          )}
        </div>

        {/* Drawer Action Buttons Footer */}
        {session && (
          <div className="p-4 bg-charcoal-850 border-t border-charcoal-750 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-1.5">
              {isPaused ? (
                <button
                  onClick={() => onResumeTable(table)}
                  className="p-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium text-center"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  onClick={() => onPauseTable(table)}
                  className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 text-[11px] font-medium text-center"
                >
                  Tạm dừng
                </button>
              )}

              <button
                onClick={() => onOpenTransferModal(table)}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 text-[11px] font-medium text-center"
              >
                Đổi bàn
              </button>

              <button
                onClick={() => onOpenMergeModal(table)}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 text-[11px] font-medium text-center"
              >
                Gộp bàn
              </button>
            </div>

            <button
              onClick={() => onCheckoutTable(table, session)}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Thanh toán hóa đơn</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
