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
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 select-none font-sans">
        <img
          src={logoImg}
          alt="Thanh Long Billiards Logo"
          className="w-12 h-12 rounded-full border border-amber-500/30 object-cover mb-3 opacity-60"
        />
        <h4 className="font-semibold text-slate-300 text-sm">Thanh Long Billiards</h4>
        <p className="text-xs text-slate-500 mt-1">Chọn một bàn bên danh sách để điều khiển</p>
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
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800/80 overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="p-3.5 bg-slate-900/70 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="text-sm font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
              {table.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300">
                  {table.type}
                </span>
                <span className="text-xs text-slate-400">
                  {formatVND(table.hourlyRate)} / giờ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                {table.area}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onEditTable && (
              <button
                onClick={() => onEditTable(table)}
                className="text-xs text-amber-300/90 hover:text-amber-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-medium transition-colors"
                title="Sửa thông tin bàn"
              >
                Sửa
              </button>
            )}

            {isPlaying ? (
              isPaused ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-medium">
                  Tạm dừng
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-medium">
                  Đang chơi
                </span>
              )
            ) : isWaiting ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-medium">
                Chờ tính
              </span>
            ) : isMaintenance ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                Bảo trì
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 font-medium">
                Bàn trống
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {(isPlaying || isWaiting) && session && feeCalc ? (
          <>
            {/* Live Clock & Total */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">
                  Vào lúc: {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Đã chơi: <span className="font-semibold text-white">{formatDurationHuman(feeCalc.billedMinutes)}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-white tracking-tight">
                  {formatSecondsToTimer(feeCalc.netSeconds)}
                </div>
                <div className="text-xs font-semibold text-amber-300 mt-0.5">
                  Tiền giờ: {formatVND(feeCalc.tableFee)}
                </div>
              </div>
            </div>

            {/* Customer Box */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-slate-400">Khách hàng</span>
                <span className="font-semibold text-white text-xs truncate mt-0.5">
                  {session.customerName || 'Khách vãng lai'}
                </span>
                {session.customerPhone && (
                  <span className="text-[11px] text-slate-400">
                    {session.customerPhone}
                  </span>
                )}
              </div>

              {session.customerTier && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Hạng {session.customerTier}
                </span>
              )}
            </div>

            {/* Action Toolbar */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {isPaused ? (
                <button
                  onClick={() => onResumeTable(table)}
                  className="h-8.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center transition-colors text-center"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  onClick={() => onPauseTable(table)}
                  className="h-8.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/60 font-medium flex items-center justify-center transition-colors text-center"
                >
                  Tạm dừng
                </button>
              )}

              <button
                onClick={() => onTransferTable(table)}
                className="h-8.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-medium flex items-center justify-center transition-colors text-center"
              >
                Đổi bàn
              </button>

              <button
                onClick={() => onMergeTable(table)}
                className="h-8.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-medium flex items-center justify-center transition-colors text-center"
              >
                Gộp bàn
              </button>
            </div>

            {/* F&B Ordered Items */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Món đã gọi ({session.orders?.length || 0})
                </span>

                <button
                  onClick={() => onOpenOrderModal(table)}
                  className="h-7 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium flex items-center transition-colors border border-slate-700/60"
                >
                  + Thêm món
                </button>
              </div>

              {(!session.orders || session.orders.length === 0) ? (
                <div className="py-4 text-center text-xs text-slate-400 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  Chưa có món nào. Bấm <b>"+ Thêm món"</b> để gọi đồ uống/đồ ăn.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {session.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-medium text-white truncate block text-xs">{ord.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {formatVND(ord.price)} / {ord.unit}
                        </span>
                      </div>

                      {/* Stepper +/- */}
                      <div className="flex items-center gap-1.5 mr-2">
                        <button
                          onClick={() => onUpdateOrderItemQty(table.id, ord.id, -1)}
                          className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-semibold border border-slate-700/50"
                        >
                          −
                        </button>
                        <span className="font-semibold text-white px-1 text-xs">{ord.quantity}</span>
                        <button
                          onClick={() => onUpdateOrderItemQty(table.id, ord.id, 1)}
                          className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-semibold border border-slate-700/50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-xs">
                          {formatVND(ord.price * ord.quantity)}
                        </span>
                        <button
                          onClick={() => onRemoveOrderItem(table.id, ord.id)}
                          className="text-slate-500 hover:text-rose-400 text-xs px-1 py-0.5 rounded transition-colors"
                          title="Xóa món"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Tiền giờ:</span>
                <span className="text-slate-200">{formatVND(feeCalc.tableFee)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tiền món (F&B):</span>
                <span className="text-slate-200">{formatVND(feeCalc.fnbFee)}</span>
              </div>
              {feeCalc.discountAmount > 0 && (
                <div className="flex justify-between text-rose-400 font-medium">
                  <span>Ưu đãi VIP:</span>
                  <span>-{formatVND(feeCalc.discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold">
                <span className="text-slate-300">Tổng tạm tính:</span>
                <span className="text-amber-300 text-base">{formatVND(feeCalc.grandTotal)}</span>
              </div>
            </div>
          </>
        ) : isAvailable ? (
          /* Available Table Quick Open */
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xs font-medium text-emerald-400 block mb-1">
                Bàn đang trống
              </span>
              <h4 className="text-base font-bold text-white">{table.name}</h4>
              <p className="text-xs text-slate-400 mt-1">
                {table.area} • <span className="text-amber-300 font-medium">{formatVND(table.hourlyRate)} / giờ</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <div className="font-semibold text-white flex items-center justify-between pb-2 border-b border-slate-800">
                <span>Mở bàn nhanh</span>
                <span className="text-slate-400 font-normal">Chọn khách & nhân viên</span>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Khách hàng:</label>
                <select
                  value={quickCustomerId}
                  onChange={(e) => setQuickCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none text-xs"
                >
                  <option value="">Khách vãng lai (khách lẻ)</option>
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none text-xs"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role === 'ADMIN' ? 'Admin' : 'Nhân viên'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onOpenTableModal(table)}
                  className="flex-1 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center transition-colors"
                >
                  Tùy chọn
                </button>
                <button
                  onClick={handleQuickOpen}
                  className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center transition-colors shadow-sm"
                >
                  Mở bàn ngay
                </button>
              </div>
            </div>
          </div>
        ) : isMaintenance ? (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <span className="text-xs font-medium text-slate-400 block">
              Trạng thái bảo trì
            </span>
            <h4 className="text-sm font-bold text-white">Bàn đang bảo trì</h4>
            <p className="text-xs text-slate-400">{table.notes || 'Bàn đang được căn chỉnh băng hoặc thay vải nỉ.'}</p>
            <button
              onClick={() => onToggleMaintenance(table)}
              className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center justify-center transition-colors mx-auto"
            >
              Mở lại bàn
            </button>
          </div>
        ) : null}
      </div>

      {/* Footer: Thanh toán */}
      {(isPlaying || isWaiting) && session && (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
          <button
            onClick={() => onCheckoutTable(table, session)}
            className="w-full h-10.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center transition-all shadow-md active:scale-[0.99]"
          >
            Thanh toán ({feeCalc ? formatVND(feeCalc.grandTotal) : ''})
          </button>
        </div>
      )}
    </div>
  );
};
