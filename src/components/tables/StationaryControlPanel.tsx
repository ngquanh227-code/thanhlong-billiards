import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { TableItem, TableSession, PricingRule, Customer, Staff } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import { useApp } from '../../context/AppContext';
import { AdminPasswordModal } from '../auth/AdminPasswordModal';

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
  onCloseMobile?: () => void;
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
  onCloseMobile,
}) => {
  const { verifyAdminPassword } = useApp();
  const [quickCustomerId, setQuickCustomerId] = useState<string>('');
  const [quickStaffId, setQuickStaffId] = useState<string>(currentStaff.id);
  const [adminAuthModal, setAdminAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onSuccess: () => {},
  });

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

  const hasActiveSession = Boolean(session && (session.status === 'ACTIVE' || session.status === 'WAITING_PAYMENT' || session.status === 'PAUSED'));
  const isPlaying = table.status === 'PLAYING' && hasActiveSession;
  const isWaiting = table.status === 'WAITING_PAYMENT' && hasActiveSession;
  const isMaintenance = table.status === 'MAINTENANCE';
  const isAvailable = table.status === 'AVAILABLE' || (!hasActiveSession && !isMaintenance);
  const isPaused = session?.status === 'PAUSED';
  const isAdmin = currentStaff.role === 'ADMIN' || (currentStaff.role as string) === 'OWNER' || (currentStaff.role as string) === 'MANAGER';

  const feeCalc = session ? calculateTableFee(session, pricingRule, currentTime) : null;

  const handleQuickOpen = () => {
    onQuickOpenTable(table.id, quickCustomerId || undefined, quickStaffId || currentStaff.id, table.hourlyRate);
  };

  const handleDecreaseItem = (orderItemId: string) => {
    if (isAdmin) {
      onUpdateOrderItemQty(table.id, orderItemId, -1);
    } else {
      setAdminAuthModal({
        isOpen: true,
        title: 'Xác thực Quản lý để Giảm số lượng',
        description: 'Chỉ Quản trị viên / Quản lý mới có quyền giảm bớt món đã phục vụ để phòng chống gian lận.',
        onSuccess: () => {
          setAdminAuthModal((prev) => ({ ...prev, isOpen: false }));
          onUpdateOrderItemQty(table.id, orderItemId, -1);
        },
      });
    }
  };

  const handleRemoveItem = (orderItemId: string) => {
    if (isAdmin) {
      onRemoveOrderItem(table.id, orderItemId);
    } else {
      setAdminAuthModal({
        isOpen: true,
        title: 'Xác thực Quản lý để Hủy món',
        description: 'Chỉ Quản trị viên / Quản lý mới có quyền hủy món đã phục vụ để phòng chống gian lận.',
        onSuccess: () => {
          setAdminAuthModal((prev) => ({ ...prev, isOpen: false }));
          onRemoveOrderItem(table.id, orderItemId);
        },
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800/80 overflow-hidden select-none font-sans">
      {/* Mobile Drawer Pull Indicator */}
      {onCloseMobile && (
        <div className="w-12 h-1.5 rounded-full bg-slate-700/80 mx-auto my-2 shrink-0 lg:hidden cursor-pointer" onClick={onCloseMobile} />
      )}

      {/* Header */}
      <div className="p-3 sm:p-3.5 bg-slate-900/80 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-sm font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
              {table.code}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">
                  {table.type}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-amber-300 font-medium truncate">
                  {formatVND(table.hourlyRate)}/h
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {table.area}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onEditTable && (
              <button
                onClick={() => onEditTable(table)}
                className="text-xs text-amber-300 hover:text-amber-200 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 font-medium transition-colors border border-slate-700/60"
                title="Sửa thông tin bàn"
              >
                Sửa
              </button>
            )}

            {isPlaying ? (
              isPaused ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-medium border border-amber-500/25">
                  Tạm dừng
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25">
                  Đang chơi
                </span>
              )
            ) : isWaiting ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-medium border border-amber-500/25">
                Chờ tính
              </span>
            ) : isMaintenance ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
                Bảo trì
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 font-medium border border-slate-700/60">
                Bàn trống
              </span>
            )}

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors lg:hidden active:scale-95"
                title="Đóng bảng điều khiển"
              >
                ✕
              </button>
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
                  className="h-11 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center transition-all shadow-sm active:scale-[0.98] truncate"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  onClick={() => onPauseTable(table)}
                  className="h-11 px-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700/60 font-semibold text-xs flex items-center justify-center transition-all active:scale-[0.98] truncate"
                >
                  Tạm dừng
                </button>
              )}

              <button
                onClick={() => onTransferTable(table)}
                className="h-11 px-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-xs flex items-center justify-center transition-all active:scale-[0.98] truncate"
              >
                Đổi bàn
              </button>

              <button
                onClick={() => onMergeTable(table)}
                className="h-11 px-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-xs flex items-center justify-center transition-all active:scale-[0.98] truncate"
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
                  className="h-8 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center transition-all border border-amber-500/30 active:scale-[0.98]"
                >
                  + Thêm món
                </button>
              </div>

              {(!session.orders || session.orders.length === 0) ? (
                <div className="py-4 text-center text-xs text-slate-400 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  Chưa có món nào. Bấm <b>"+ Thêm món"</b> để gọi đồ uống/đồ ăn.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {session.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-white truncate block text-xs">{ord.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {formatVND(ord.price)} / {ord.unit}
                        </span>
                      </div>

                      {/* Stepper +/- */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDecreaseItem(ord.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all active:scale-95 ${
                            isAdmin
                              ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700/60'
                              : 'bg-slate-800/60 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border-slate-700/40'
                          }`}
                          title={isAdmin ? 'Giảm số lượng' : 'Yêu cầu mật khẩu Quản lý để giảm món'}
                        >
                          −
                        </button>
                        <span className="font-bold text-white px-1 text-xs font-mono min-w-[16px] text-center">{ord.quantity}</span>
                        <button
                          onClick={() => onUpdateOrderItemQty(table.id, ord.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-750 flex items-center justify-center text-slate-200 text-xs font-bold border border-slate-700/60 active:scale-95 transition-all"
                          title="Thêm số lượng món"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-slate-200 text-xs font-mono">
                          {formatVND(ord.price * ord.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(ord.id)}
                          className={`text-xs p-1 rounded transition-colors ml-0.5 ${
                            isAdmin
                              ? 'text-slate-400 hover:text-rose-400'
                              : 'text-slate-500 hover:text-amber-400'
                          }`}
                          title={isAdmin ? 'Xóa món' : 'Yêu cầu mật khẩu Quản lý để xóa món'}
                        >
                          ✕
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


              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onOpenTableModal(table)}
                  className="flex-1 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center transition-colors whitespace-nowrap"
                >
                  Tùy chọn
                </button>
                <button
                  onClick={handleQuickOpen}
                  className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center transition-colors shadow-sm whitespace-nowrap"
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
              className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center justify-center transition-colors mx-auto whitespace-nowrap"
            >
              Mở lại bàn
            </button>
          </div>
        ) : null}
      </div>

      {/* Footer: Thanh toán */}
      {(isPlaying || isWaiting) && session && (
        <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 shrink-0 safe-area-pb">
          <button
            onClick={() => onCheckoutTable(table, session)}
            className="w-full h-13 sm:h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center justify-between px-4 sm:px-5 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99]"
          >
            <span className="font-bold tracking-tight">Thanh toán</span>
            <span className="font-extrabold text-base sm:text-lg bg-black/20 px-3 py-1 rounded-xl">
              {feeCalc ? formatVND(feeCalc.grandTotal) : ''}
            </span>
          </button>
        </div>
      )}
      {/* Admin Auth Modal for item decrease/cancellation */}
      <AdminPasswordModal
        isOpen={adminAuthModal.isOpen}
        onClose={() => setAdminAuthModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={adminAuthModal.onSuccess}
        verifyPassword={verifyAdminPassword}
        title={adminAuthModal.title}
        description={adminAuthModal.description}
      />
    </div>
  );
};
