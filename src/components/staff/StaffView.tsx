import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffRole } from '../../types';
import { formatVND } from '../../services/calculation';

export const StaffView: React.FC = () => {
  const {
    staff,
    currentStaff,
    shifts,
    auditLogs,
    startNewShift,
    closeCurrentShift,
  } = useApp();

  const [isStartShiftModalOpen, setIsStartShiftModalOpen] = useState<boolean>(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState<boolean>(false);
  const [initialCash, setInitialCash] = useState<number>(2000000);
  const [shiftNameInput, setShiftNameInput] = useState<string>('Ca Sáng (08:00 - 15:00)');
  const [actualEndingCash, setActualEndingCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState<string>('');

  const currentOpenShift = shifts.find((s) => s.status === 'OPEN');

  const getRoleName = (role: StaffRole | string) => {
    switch (role) {
      case 'ADMIN':
      case 'OWNER':
      case 'MANAGER':
        return 'ADMIN (QUẢN TRỊ)';
      case 'STAFF':
      case 'CASHIER':
      case 'WAITER':
      default:
        return 'NHÂN VIÊN (VẬN HÀNH)';
    }
  };

  const getRoleBadge = (role: StaffRole | string) => {
    switch (role) {
      case 'ADMIN':
      case 'OWNER':
      case 'MANAGER':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'STAFF':
      case 'CASHIER':
      case 'WAITER':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const handleStartShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startNewShift(shiftNameInput, initialCash);
    setIsStartShiftModalOpen(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOpenShift) return;
    closeCurrentShift(actualEndingCash, closingNotes);
    setIsCloseShiftModalOpen(false);
    setClosingNotes('');
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            NHÂN SỰ, CA TRỰC & NHẬT KÝ
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Quản lý vai trò nhân sự, giao nhận ca kiểm két tiền mặt và nhật ký thao tác
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          {currentOpenShift ? (
            <button
              onClick={() => {
                setActualEndingCash((currentOpenShift.initialCash || 0) + (currentOpenShift.totalRevenue || 0));
                setIsCloseShiftModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black text-xs transition-colors"
            >
              KẾT THÚC CA (KIỂM KÉT)
            </button>
          ) : (
            <button
              onClick={() => setIsStartShiftModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors tracking-wider"
            >
              + MỞ CA MỚI
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Card */}
      {currentOpenShift && (
        <div className="p-4 rounded-xl bg-charcoal-850 border border-emerald-500/30 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                [CA LÀM VIỆC ĐANG HOẠT ĐỘNG]
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {currentOpenShift.shiftName}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                Phụ trách: <b className="text-slate-200">{currentOpenShift.staffName}</b> • Bắt đầu lúc: {new Date(currentOpenShift.startTime).toLocaleTimeString('vi-VN')}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-charcoal-900 px-3 py-2 rounded-lg border border-charcoal-750">
                <div className="text-slate-400 text-[10px]">TIỀN ĐẦU CA:</div>
                <div className="text-sm font-bold text-white">{formatVND(currentOpenShift.initialCash)}</div>
              </div>
              <div className="bg-charcoal-900 px-3 py-2 rounded-lg border border-charcoal-750">
                <div className="text-slate-400 text-[10px]">DOANH THU TRONG CA:</div>
                <div className="text-sm font-bold text-gold-400">+{formatVND(currentOpenShift.totalRevenue || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Roster & Roles */}
      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          DANH SÁCH NHÂN SỰ & VAI TRÒ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staff.map((s) => (
            <div
              key={s.id}
              className={`p-3.5 rounded-lg border transition-colors ${
                s.id === currentStaff.id
                  ? 'bg-charcoal-800 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-charcoal-900/60 border-charcoal-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">{s.name}</h4>
                  <span className="text-[10px] text-slate-400">{s.code}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getRoleBadge(s.role)}`}>
                  {getRoleName(s.role)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                SĐT: <span className="text-slate-300 font-bold">{s.phone}</span>
              </div>
              {s.id === currentStaff.id && (
                <div className="mt-2 pt-2 border-t border-charcoal-750 text-[10px] text-emerald-400 font-bold">
                  ● ĐANG ĐĂNG NHẬP
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shift History & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 font-mono">
        {/* Left: Shift History */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              LỊCH SỬ CÁC CA ĐÃ CHỐT
            </h3>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-sans">
                  Chưa có ca làm việc nào được ghi nhận
                </div>
              ) : (
                shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{shift.shiftName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        shift.status === 'OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-charcoal-800 text-slate-400 border border-charcoal-700'
                      }`}>
                        {shift.status === 'OPEN' ? 'ĐANG MỞ' : 'ĐÃ CHỐT'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="font-sans">Thu ngân: {shift.staffName}</span>
                      <span>
                        {new Date(shift.startTime).toLocaleTimeString('vi-VN')}
                        {shift.endTime ? ` - ${new Date(shift.endTime).toLocaleTimeString('vi-VN')}` : ''}
                      </span>
                    </div>

                    {shift.status === 'CLOSED' && (
                      <div className="pt-2 mt-1 border-t border-charcoal-800 grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">ĐẦU CA:</span>
                          <span className="text-slate-300 font-bold">{formatVND(shift.initialCash)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">DOANH THU:</span>
                          <span className="text-gold-400 font-bold">{formatVND(shift.totalRevenue || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">LỆCH KÉT:</span>
                          <span className={`font-bold ${
                            (shift.cashDifference || 0) === 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}>
                            {(shift.cashDifference || 0) > 0 ? '+' : ''}
                            {formatVND(shift.cashDifference || 0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Operational Audit Trail */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              NHẬT KÝ VẬN HÀNH HỆ THỐNG
            </h3>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-sans">
                  Chưa có nhật ký hoạt động nào
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gold-400">{log.action}</span>
                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">{log.details}</p>
                    <span className="text-[10px] text-slate-400">Thực hiện: {log.staffName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Mở Ca Mới */}
      {isStartShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                BẮT ĐẦU CA LÀM MỚI
              </h3>
              <button
                onClick={() => setIsStartShiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-bold rounded-lg hover:bg-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">CA LÀM VIỆC:</label>
                <select
                  value={shiftNameInput}
                  onChange={(e) => setShiftNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="Ca Sáng (08:00 - 15:00)">Ca Sáng (08:00 - 15:00)</option>
                  <option value="Ca Chiều (15:00 - 22:00)">Ca Chiều (15:00 - 22:00)</option>
                  <option value="Ca Đêm (22:00 - 04:00)">Ca Đêm (22:00 - 04:00)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  TIỀN MẶT ĐẦU CA (TIỀN THỐI LẺ):
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-750 mt-1">
                <button
                  type="button"
                  onClick={() => setIsStartShiftModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-colors"
                >
                  MỞ CA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đóng Ca Làm Việc */}
      {isCloseShiftModalOpen && currentOpenShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                KẾT CA: {currentOpenShift.shiftName}
              </h3>
              <button
                onClick={() => setIsCloseShiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-bold rounded-lg hover:bg-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-700 flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>TIỀN MẶT ĐẦU CA:</span>
                  <span className="text-white font-bold">{formatVND(currentOpenShift.initialCash)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>DOANH THU TRONG CA:</span>
                  <span className="text-gold-400 font-bold">+{formatVND(currentOpenShift.totalRevenue || 0)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-charcoal-700 font-bold text-slate-200 text-xs">
                  <span>TIỀN KÉT LÝ THUYẾT:</span>
                  <span className="text-emerald-400 font-black">
                    {formatVND((currentOpenShift.initialCash || 0) + (currentOpenShift.totalRevenue || 0))}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  TIỀN MẶT THỰC TẾ ĐẾM TRONG KÉT (VNĐ):
                </label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={actualEndingCash}
                  onChange={(e) => setActualEndingCash(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">GHI CHÚ BÀN GIAO CA:</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về chênh lệch hoặc hóa đơn đặc biệt..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-750 mt-1">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black transition-colors"
                >
                  CHỐT & ĐÓNG CA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
