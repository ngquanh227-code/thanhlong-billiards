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
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Nhân sự & Ca trực
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý vai trò nhân viên, giao nhận ca kiểm két tiền mặt và nhật ký hoạt động
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentOpenShift ? (
            <button
              onClick={() => {
                setActualEndingCash((currentOpenShift.initialCash || 0) + (currentOpenShift.totalRevenue || 0));
                setIsCloseShiftModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              Kết thúc ca & Kiểm két
            </button>
          ) : (
            <button
              onClick={() => setIsStartShiftModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              + Mở ca mới
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Card */}
      {currentOpenShift && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-medium text-emerald-400 block mb-1">
                Ca làm việc đang hoạt động
              </span>
              <h3 className="text-base font-semibold text-white">
                {currentOpenShift.shiftName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Phụ trách: <b className="text-slate-200">{currentOpenShift.staffName}</b> • Bắt đầu lúc {new Date(currentOpenShift.startTime).toLocaleTimeString('vi-VN')}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 text-[11px]">Tiền đầu ca</div>
                <div className="text-sm font-semibold text-white">{formatVND(currentOpenShift.initialCash)}</div>
              </div>
              <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 text-[11px]">Doanh thu trong ca</div>
                <div className="text-sm font-semibold text-amber-300">+{formatVND(currentOpenShift.totalRevenue || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Roster & Roles */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <h3 className="text-sm font-semibold text-white mb-4">
          Danh sách nhân sự & Phân quyền
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {staff.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-xl border transition-all ${
                s.id === currentStaff.id
                  ? 'bg-slate-800/80 border-slate-700 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                  <span className="text-[11px] text-slate-400">{s.code}</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${getRoleBadge(s.role)}`}>
                  {getRoleName(s.role)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Số điện thoại: <span className="text-slate-300 font-medium">{s.phone}</span>
              </div>
              {s.id === currentStaff.id && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                  Đang đăng nhập
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shift History & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Shift History */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Lịch sử ca làm việc đã chốt
            </h3>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Chưa có ca làm việc nào được ghi nhận
                </div>
              ) : (
                shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{shift.shiftName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        shift.status === 'OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}>
                        {shift.status === 'OPEN' ? 'Đang mở' : 'Đã chốt'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Thu ngân: {shift.staffName}</span>
                      <span>
                        {new Date(shift.startTime).toLocaleTimeString('vi-VN')}
                        {shift.endTime ? ` - ${new Date(shift.endTime).toLocaleTimeString('vi-VN')}` : ''}
                      </span>
                    </div>

                    {shift.status === 'CLOSED' && (
                      <div className="pt-2 mt-1 border-t border-slate-800 grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Đầu ca</span>
                          <span className="text-slate-300 font-medium">{formatVND(shift.initialCash)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Doanh thu</span>
                          <span className="text-amber-300 font-medium">{formatVND(shift.totalRevenue || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Lệch két</span>
                          <span className={`font-semibold ${
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
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Nhật ký vận hành hệ thống
            </h3>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Chưa có nhật ký hoạt động nào
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-amber-300">{log.action}</span>
                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{log.details}</p>
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
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                Bắt đầu ca làm mới
              </h3>
              <button
                onClick={() => setIsStartShiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Ca làm việc:</label>
                <select
                  value={shiftNameInput}
                  onChange={(e) => setShiftNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                >
                  <option value="Ca Sáng (08:00 - 15:00)">Ca Sáng (08:00 - 15:00)</option>
                  <option value="Ca Chiều (15:00 - 22:00)">Ca Chiều (15:00 - 22:00)</option>
                  <option value="Ca Đêm (22:00 - 04:00)">Ca Đêm (22:00 - 04:00)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Tiền mặt đầu ca (tiền thối lẻ):
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-semibold focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-1">
                <button
                  type="button"
                  onClick={() => setIsStartShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Mở ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đóng Ca Làm Việc */}
      {isCloseShiftModalOpen && currentOpenShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                Kết ca: {currentOpenShift.shiftName}
              </h3>
              <button
                onClick={() => setIsCloseShiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Tiền mặt đầu ca:</span>
                  <span className="text-white font-medium">{formatVND(currentOpenShift.initialCash)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Doanh thu trong ca:</span>
                  <span className="text-amber-300 font-medium">+{formatVND(currentOpenShift.totalRevenue || 0)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-700 font-semibold text-slate-200 text-xs">
                  <span>Tiền két lý thuyết:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatVND((currentOpenShift.initialCash || 0) + (currentOpenShift.totalRevenue || 0))}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Tiền mặt thực tế đếm trong két (VNĐ):
                </label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={actualEndingCash}
                  onChange={(e) => setActualEndingCash(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-semibold focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú bàn giao ca:</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về chênh lệch hoặc hóa đơn đặc biệt..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-1">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
                >
                  Chốt & Đóng ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
