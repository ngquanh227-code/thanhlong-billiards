import React, { useState } from 'react';
import { TableItem, TableSession, PricingRule, Customer, Staff } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import {
  Clock,
  User,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  Pause,
  Play,
  Printer,
  Receipt,
  ArrowRightLeft,
  Layers,
  Wrench,
  ShieldAlert,
} from 'lucide-react';

interface StationaryControlPanelProps {
  table: TableItem | null;
  session?: TableSession;
  pricingRule?: PricingRule;
  customer?: Customer;
  currentTime: Date;
  customers: Customer[];
  staff: Staff[];
  currentStaff: Staff;
  onOpenTableModal: (table: TableItem) => void;
  onQuickOpenTable: (tableId: string, customerId?: string, staffId?: string, customRate?: number) => void;
  onPauseTable: (table: TableItem) => void;
  onResumeTable: (table: TableItem) => void;
  onTransferTable: (table: TableItem) => void;
  onMergeTable: (table: TableItem) => void;
  onOpenOrderModal: (table: TableItem) => void;
  onCheckoutTable: (table: TableItem, session: TableSession) => void;
  onUpdateOrderItemQty: (tableId: string, orderItemId: string, delta: number) => void;
  onRemoveOrderItem: (tableId: string, orderItemId: string) => void;
  onToggleMaintenance: (table: TableItem) => void;
}

export const StationaryControlPanel: React.FC<StationaryControlPanelProps> = ({
  table,
  session,
  pricingRule,
  currentTime,
  customers,
  staff,
  currentStaff,
  onOpenTableModal,
  onQuickOpenTable,
  onPauseTable,
  onResumeTable,
  onTransferTable,
  onMergeTable,
  onOpenOrderModal,
  onCheckoutTable,
  onUpdateOrderItemQty,
  onRemoveOrderItem,
  onToggleMaintenance,
}) => {
  const [quickCustomerId, setQuickCustomerId] = useState<string>('');
  const [quickStaffId, setQuickStaffId] = useState<string>(currentStaff.id);

  if (!table) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <img
          src="/logo.png"
          alt="Thanh Long Billiards Logo"
          className="w-16 h-16 rounded-full border border-amber-500/30 object-cover mb-3 opacity-60"
        />
        <h4 className="font-brand text-gold-400 font-bold text-sm uppercase">Thanh Long Billiards</h4>
        <p className="text-xs text-slate-400 mt-1">Chọn một bàn bên trái để điều khiển</p>
      </div>
    );
  }

  const isPlaying = table.status === 'PLAYING';
  const isWaiting = table.status === 'WAITING_PAYMENT';
  const isAvailable = table.status === 'AVAILABLE';
  const isMaintenance = table.status === 'MAINTENANCE';
  const isPaused = session?.status === 'PAUSED';

  const feeCalc = session ? calculateTableFee(session, pricingRule, currentTime) : null;

  const handlePrePrint = () => {
    window.print();
  };

  const handleQuickOpen = () => {
    onQuickOpenTable(table.id, quickCustomerId || undefined, quickStaffId || currentStaff.id, table.hourlyRate);
    setQuickCustomerId('');
  };

  return (
    <div className="h-full flex flex-col bg-charcoal-900 overflow-hidden">
      {/* Stationary Header */}
      <div className="p-3.5 bg-charcoal-850 border-b border-charcoal-750 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-9 h-9 rounded-full border border-amber-500/50 object-cover shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white tracking-tight font-heading">
                  {table.code}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-charcoal-800 text-slate-300">
                  {table.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {table.area} • <span className="font-mono text-gold-400">{formatVND(table.hourlyRate)}/h</span>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {isPlaying ? (
              isPaused ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Tạm dừng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  Đang chơi
                </span>
              )
            ) : isWaiting ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Chờ tính
              </span>
            ) : isMaintenance ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                <Wrench className="w-3 h-3" />
                Bảo trì
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-charcoal-800 text-slate-400 border border-charcoal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Bàn trống
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stationary Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {(isPlaying || isWaiting) && session && feeCalc ? (
          <>
            {/* Live Clock & Money Box */}
            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vào lúc: {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Đã chơi: <b className="text-white font-medium">{formatDurationHuman(feeCalc.billedMinutes)}</b>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xl font-bold text-white tracking-wider">
                  {formatSecondsToTimer(feeCalc.netSeconds)}
                </div>
                <div className="text-xs font-mono font-bold text-gold-400">
                  {formatVND(feeCalc.tableFee)}
                </div>
              </div>
            </div>

            {/* Customer Tag Box */}
            <div className="p-2.5 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-slate-300">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white">
                    {session.customerName || 'Khách Vãng Lai'}
                  </span>
                  {session.customerPhone && (
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {session.customerPhone}
                    </span>
                  )}
                </div>
              </div>

              {session.customerTier && (
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  Hạng {session.customerTier}
                </span>
              )}
            </div>

            {/* Quick Action Toolbar */}
            <div className="grid grid-cols-3 gap-2">
              {isPaused ? (
                <button
                  onClick={() => onResumeTable(table)}
                  className="p-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex flex-col items-center justify-center gap-1 hover:bg-emerald-600/30 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Tiếp tục</span>
                </button>
              ) : (
                <button
                  onClick={() => onPauseTable(table)}
                  className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tạm dừng</span>
                </button>
              )}

              <button
                onClick={() => onTransferTable(table)}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                <span>Đổi bàn</span>
              </button>

              <button
                onClick={() => onMergeTable(table)}
                className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Gộp bàn</span>
              </button>
            </div>

            {/* F&B Ordered Items Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  Món đã gọi ({session.orders?.length || 0})
                </span>

                <button
                  onClick={() => onOpenOrderModal(table)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 text-xs font-medium border border-charcoal-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gold-400" />
                  <span>Thêm món</span>
                </button>
              </div>

              {(!session.orders || session.orders.length === 0) ? (
                <div className="py-5 text-center text-xs text-slate-500 rounded-lg bg-charcoal-850 border border-charcoal-750">
                  Chưa có món nào. Bấm <b className="text-slate-400">"Thêm món"</b> để gọi đồ uống/đồ ăn.
                </div>
              ) : (
                <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
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

                      {/* Stepper +/- */}
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          onClick={() => onUpdateOrderItemQty(table.id, ord.id, -1)}
                          className="w-5 h-5 rounded bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-center text-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-white px-1 text-xs">{ord.quantity}</span>
                        <button
                          onClick={() => onUpdateOrderItemQty(table.id, ord.id, 1)}
                          className="w-5 h-5 rounded bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-center text-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-200 text-xs">
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

            {/* Calculations Breakdown */}
            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Tiền giờ chơi:</span>
                <span className="font-mono text-white">{formatVND(feeCalc.tableFee)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tiền món đã gọi:</span>
                <span className="font-mono text-white">{formatVND(feeCalc.fnbFee)}</span>
              </div>
              {feeCalc.discountAmount > 0 && (
                <div className="flex justify-between text-rose-400 font-medium">
                  <span>Ưu đãi VIP:</span>
                  <span className="font-mono">-{formatVND(feeCalc.discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-charcoal-750 flex justify-between items-baseline font-bold">
                <span className="text-slate-300">TỔNG TẠM TÍNH:</span>
                <span className="font-mono text-gold-400 text-base">{formatVND(feeCalc.grandTotal)}</span>
              </div>
            </div>
          </>
        ) : isAvailable ? (
          /* Available Table Quick Open Mode */
          <div className="space-y-3.5">
            <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <h4 className="text-sm font-bold text-white">{table.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {table.area} • <span className="text-emerald-400 font-semibold">{formatVND(table.hourlyRate)}/h</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-3 text-xs">
              <div className="font-bold text-white flex items-center justify-between pb-2 border-b border-charcoal-750">
                <span>Mở Bàn Trực Tiếp</span>
                <span className="text-[10px] text-slate-400 font-normal">Nhanh 1 chạm</span>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Khách hàng:</label>
                <select
                  value={quickCustomerId}
                  onChange={(e) => setQuickCustomerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                >
                  <option value="">Khách Vãng Lai (Khách Lẻ)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Nhân viên phục vụ:</label>
                <select
                  value={quickStaffId}
                  onChange={(e) => setQuickStaffId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onOpenTableModal(table)}
                  className="flex-1 py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 font-medium transition-colors"
                >
                  Tùy chọn khác
                </button>
                <button
                  onClick={handleQuickOpen}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>MỞ BÀN</span>
                </button>
              </div>
            </div>
          </div>
        ) : isMaintenance ? (
          <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Bàn Đang Bảo Trì</h4>
            <p className="text-xs text-slate-400">{table.notes || 'Bàn đang được căn chỉnh băng hoặc bảo dưỡng vải nỉ.'}</p>
            <button
              onClick={() => onToggleMaintenance(table)}
              className="py-2 px-4 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-white font-semibold text-xs border border-charcoal-700"
            >
              Hoàn Tất & Mở Lại Bàn
            </button>
          </div>
        ) : null}
      </div>

      {/* Stationary Footer: Thanh Toán Hóa Đơn */}
      {(isPlaying || isWaiting) && session && (
        <div className="p-3 bg-charcoal-850 border-t border-charcoal-750 shrink-0">
          <button
            onClick={() => onCheckoutTable(table, session)}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <Receipt className="w-4 h-4" />
            <span>Thanh Toán Hóa Đơn ({feeCalc ? formatVND(feeCalc.grandTotal) : ''})</span>
          </button>
        </div>
      )}
    </div>
  );
};
