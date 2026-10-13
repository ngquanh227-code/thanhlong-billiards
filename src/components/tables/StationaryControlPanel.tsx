import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { TableItem, TableSession, PricingRule, Customer, Staff } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';

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
  onEditTable?: (table: TableItem) => void;
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
  onEditTable,
}) => {
  const [quickCustomerId, setQuickCustomerId] = useState<string>('');
  const [quickStaffId, setQuickStaffId] = useState<string>(currentStaff.id);

  if (!table) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 select-none">
        <img
          src={logoImg}
          alt="Thanh Long Billiards Logo"
          className="w-14 h-14 rounded-full border border-amber-500/30 object-cover mb-3 opacity-60"
        />
        <h4 className="font-brand text-gold-400 font-bold text-xs uppercase tracking-widest">Thanh Long Billiards</h4>
        <p className="text-[11px] font-mono text-slate-400 mt-1">Chọn một bàn bên danh sách để điều khiển</p>
      </div>
    );
  }

  const isPlaying = table.status === 'PLAYING';
  const isWaiting = table.status === 'WAITING_PAYMENT';
  const isAvailable = table.status === 'AVAILABLE';
  const isMaintenance = table.status === 'MAINTENANCE';
  const isPaused = session?.status === 'PAUSED';
  const isAdmin = currentStaff.role === 'ADMIN' || (currentStaff.role as string) === 'OWNER' || (currentStaff.role as string) === 'MANAGER';

  const feeCalc = session ? calculateTableFee(session, pricingRule, currentTime) : null;

  const handleQuickOpen = () => {
    onQuickOpenTable(table.id, quickCustomerId || undefined, quickStaffId || currentStaff.id, table.hourlyRate);
    setQuickCustomerId('');
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f17] border-l border-charcoal-750 overflow-hidden select-none">
      {/* Stationary Header */}
      <div className="p-3 bg-charcoal-850 border-b border-charcoal-750 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs font-black px-2 py-1 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              {table.code}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-300">
                  {table.type}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatVND(table.hourlyRate)}/H
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]">
                {table.area}
              </p>
            </div>
          </div>

          {/* Admin Edit & Status Badge */}
          <div className="flex items-center gap-1.5">
            {isAdmin && onEditTable && (
              <button
                onClick={() => onEditTable(table)}
                className="px-2 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold transition-colors"
                title="Chỉnh sửa thông tin bàn này"
              >
                [SỬA BÀN]
              </button>
            )}
            {isPlaying ? (
              isPaused ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  ■ TẠM DỪNG
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● ĐANG CHƠI
                </span>
              )
            ) : isWaiting ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ▲ CHỜ TÍNH
              </span>
            ) : isMaintenance ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                × BẢO TRÌ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-charcoal-800 text-slate-400 border border-charcoal-700">
                ○ BÀN TRỐNG
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stationary Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {(isPlaying || isWaiting) && session && feeCalc ? (
          <>
            {/* Live Clock & Money Box */}
            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between font-mono">
              <div>
                <div className="text-[10px] text-slate-400 tracking-wider">
                  VÀO LÚC: {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  ĐÃ CHƠI: <b className="text-white">{formatDurationHuman(feeCalc.billedMinutes)}</b>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-white tracking-wider">
                  {formatSecondsToTimer(feeCalc.netSeconds)}
                </div>
                <div className="text-xs font-bold text-gold-400">
                  {formatVND(feeCalc.tableFee)}
                </div>
              </div>
            </div>

            {/* Customer Tag Box */}
            <div className="p-2.5 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  KHÁCH HÀNG:
                </span>
                <span className="font-bold text-white text-xs truncate">
                  {session.customerName || 'Khách Vãng Lai'}
                </span>
                {session.customerPhone && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {session.customerPhone}
                  </span>
                )}
              </div>

              {session.customerTier && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  HẠNG {session.customerTier}
                </span>
              )}
            </div>

            {/* Quick Action Toolbar */}
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold">
              {isPaused ? (
                <button
                  onClick={() => onResumeTable(table)}
                  className="py-2 px-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                >
                  TIẾP TỤC
                </button>
              ) : (
                <button
                  onClick={() => onPauseTable(table)}
                  className="py-2 px-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-amber-400 border border-charcoal-700 transition-colors"
                >
                  TẠM DỪNG
                </button>
              )}

              <button
                onClick={() => onTransferTable(table)}
                className="py-2 px-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 transition-colors"
              >
                ĐỔI BÀN
              </button>

              <button
                onClick={() => onMergeTable(table)}
                className="py-2 px-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-purple-300 border border-charcoal-700 transition-colors"
              >
                GỘP BÀN
              </button>
            </div>

            {/* F&B Ordered Items Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  MÓN ĐÃ GỌI ({session.orders?.length || 0})
                </span>

                <button
                  onClick={() => onOpenOrderModal(table)}
                  className="px-2 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 text-[10px] font-mono font-bold border border-charcoal-700 transition-colors"
                >
                  + THÊM MÓN
                </button>
              </div>

              {(!session.orders || session.orders.length === 0) ? (
                <div className="py-4 text-center text-[11px] text-slate-400 rounded-lg bg-charcoal-850 border border-charcoal-750">
                  Chưa có món nào. Bấm <b>"+ THÊM MÓN"</b> để gọi đồ uống/đồ ăn.
                </div>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
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

                      {/* Stepper +/- */}
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
                        <span className="font-mono font-bold text-slate-200 text-[11px]">
                          {formatVND(ord.price * ord.quantity)}
                        </span>
                        <button
                          onClick={() => onRemoveOrderItem(table.id, ord.id)}
                          className="text-slate-400 hover:text-rose-400 text-[10px] font-mono px-1 py-0.5 rounded hover:bg-white/10"
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

            {/* Calculations Breakdown */}
            <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-[11px] font-mono flex flex-col gap-1">
              <div className="flex justify-between text-slate-400">
                <span>TIỀN GIỜ:</span>
                <span className="text-white">{formatVND(feeCalc.tableFee)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>TIỀN MÓN (F&B):</span>
                <span className="text-white">{formatVND(feeCalc.fnbFee)}</span>
              </div>
              {feeCalc.discountAmount > 0 && (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>ƯU ĐÃI VIP:</span>
                  <span>-{formatVND(feeCalc.discountAmount)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-charcoal-750 flex justify-between items-baseline font-black">
                <span className="text-slate-300">TỔNG TẠM TÍNH:</span>
                <span className="text-gold-400 text-sm sm:text-base">{formatVND(feeCalc.grandTotal)}</span>
              </div>
            </div>
          </>
        ) : isAvailable ? (
          /* Available Table Quick Open Mode */
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center">
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">
                [BÀN ĐANG TRỐNG]
              </span>
              <h4 className="text-sm font-bold text-white">{table.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {table.area} • <span className="text-emerald-400 font-bold">{formatVND(table.hourlyRate)}/H</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2.5 text-xs">
              <div className="font-mono font-bold text-white flex items-center justify-between pb-1.5 border-b border-charcoal-750 text-[11px]">
                <span>MỞ BÀN TRỰC TIẾP</span>
                <span className="text-slate-400 font-normal">1 chạm</span>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1 text-[11px]">Khách hàng:</label>
                <select
                  value={quickCustomerId}
                  onChange={(e) => setQuickCustomerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none text-xs"
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
                <label className="text-slate-300 font-medium block mb-1 text-[11px]">Nhân viên phụ trách:</label>
                <select
                  value={quickStaffId}
                  onChange={(e) => setQuickStaffId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none text-xs"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1.5 flex gap-2">
                <button
                  onClick={() => onOpenTableModal(table)}
                  className="flex-1 py-2 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 border border-charcoal-700 font-mono text-[11px] font-bold transition-colors"
                >
                  TÙY CHỌN
                </button>
                <button
                  onClick={handleQuickOpen}
                  className="flex-1 py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-black transition-colors"
                >
                  + MỞ BÀN
                </button>
              </div>
            </div>
          </div>
        ) : isMaintenance ? (
          <div className="p-5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center space-y-2.5">
            <span className="text-xs font-mono font-bold text-amber-400 block">
              [TRẠNG THÁI: BẢO TRÌ]
            </span>
            <h4 className="text-sm font-bold text-white">Bàn Đang Bảo Trì</h4>
            <p className="text-xs text-slate-400">{table.notes || 'Bàn đang được căn chỉnh băng hoặc thay vải nỉ.'}</p>
            <button
              onClick={() => onToggleMaintenance(table)}
              className="py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-white font-mono text-xs font-bold border border-charcoal-700 transition-colors"
            >
              HOÀN TẤT & MỞ LẠI BÀN
            </button>
          </div>
        ) : null}
      </div>

      {/* Stationary Footer: Thanh Toán Hóa Đơn */}
      {(isPlaying || isWaiting) && session && (
        <div className="p-2.5 bg-charcoal-850 border-t border-charcoal-750 shrink-0">
          <button
            onClick={() => onCheckoutTable(table, session)}
            className="w-full py-2.5 px-3 rounded-xl bg-gold-500 hover:bg-amber-400 text-charcoal-950 font-mono font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg active:scale-98"
          >
            <span>THANH TOÁN HÓA ĐƠN ({feeCalc ? formatVND(feeCalc.grandTotal) : ''})</span>
          </button>
        </div>
      )}
    </div>
  );
};
