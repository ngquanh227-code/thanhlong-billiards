import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffRole } from '../../types';
import { formatVND } from '../../services/calculation';
import {
  UserCog,
  Plus,
  Clock,
  Shield,
  History,
  X,
} from 'lucide-react';

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

  const getRoleName = (role: StaffRole) => {
    switch (role) {
      case 'OWNER': return 'Chủ Quán';
      case 'MANAGER': return 'Quản Lý';
      case 'CASHIER': return 'Thu Ngân';
      case 'WAITER': return 'Phục Vụ';
      default: return role;
    }
  };

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'OWNER': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'MANAGER': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CASHIER': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'WAITER': return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
      default: return 'bg-charcoal-800 text-slate-400 border-charcoal-700';
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
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Nhân viên, ca làm & nhật ký
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý vai trò nhân sự, giao nhận ca kiểm két tiền mặt và nhật ký thao tác
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentOpenShift ? (
            <button
              onClick={() => {
                setActualEndingCash((currentOpenShift.initialCash || 0) + (currentOpenShift.totalRevenue || 0));
                setIsCloseShiftModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold text-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Kết Thúc Ca (Kiểm Két)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsStartShiftModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Mở Ca Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Card (if active) */}
      {currentOpenShift && (
        <div className="p-4 rounded-xl bg-charcoal-850 border border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Ca Làm Việc Đang Mở
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-heading mt-0.5">
                {currentOpenShift.shiftName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhân viên phụ trách: <b className="text-slate-200">{currentOpenShift.staffName}</b> • Bắt đầu lúc: {new Date(currentOpenShift.startTime).toLocaleTimeString('vi-VN')}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-charcoal-900 px-3 py-2 rounded-lg border border-charcoal-800">
                <div className="text-slate-400 text-[11px]">Tiền đầu ca:</div>
                <div className="text-sm font-mono font-medium text-white">{formatVND(currentOpenShift.initialCash)}</div>
              </div>
              <div className="bg-charcoal-900 px-3 py-2 rounded-lg border border-charcoal-800">
                <div className="text-slate-400 text-[11px]">Doanh thu trong ca:</div>
                <div className="text-sm font-mono font-medium text-gold-400">+{formatVND(currentOpenShift.totalRevenue || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Roster & Roles */}
      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
        <h3 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold-400" />
          Danh Sách Nhân Sự & Vai Trò
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staff.map((s) => (
            <div
              key={s.id}
              className={`p-3.5 rounded-lg border transition-colors ${
                s.id === currentStaff.id
                  ? 'bg-charcoal-800 border-emerald-500/40'
                  : 'bg-charcoal-900/60 border-charcoal-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{s.code}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${getRoleBadge(s.role)}`}>
                  {getRoleName(s.role)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                SĐT: <span className="font-mono text-slate-300">{s.phone}</span>
              </div>
              {s.id === currentStaff.id && (
                <div className="mt-2 pt-2 border-t border-charcoal-750 text-[11px] text-emerald-400 font-medium">
                  ✓ Tài khoản đang đăng nhập
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shift History & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Shift History */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Lịch Sử Các Ca Đã Chốt
            </h3>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  Chưa có ca làm việc nào được ghi nhận
                </div>
              ) : (
                shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{shift.shiftName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        shift.status === 'OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-charcoal-800 text-slate-400'
                      }`}>
                        {shift.status === 'OPEN' ? 'Đang mở' : 'Đã chốt'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Thu ngân: {shift.staffName}</span>
                      <span className="font-mono">
                        {new Date(shift.startTime).toLocaleTimeString('vi-VN')}
                        {shift.endTime ? ` - ${new Date(shift.endTime).toLocaleTimeString('vi-VN')}` : ''}
                      </span>
                    </div>

                    {shift.status === 'CLOSED' && (
                      <div className="pt-2 mt-1 border-t border-charcoal-800 grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Đầu ca:</span>
                          <span className="font-mono text-slate-300">{formatVND(shift.initialCash)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Doanh thu:</span>
                          <span className="font-mono text-gold-400">{formatVND(shift.totalRevenue || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Chênh lệch két:</span>
                          <span className={`font-mono font-medium ${
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
            <h3 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Nhật Ký Vận Hành Hệ Thống
            </h3>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  Chưa có nhật ký hoạt động nào
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-300">{log.action}</span>
                      <span className="text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{log.details}</p>
                    <span className="text-[10px] text-slate-500">Người thực hiện: {log.staffName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Mở Ca Mới */}
      {isStartShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">
                Bắt Đầu Ca Làm Mới
              </h3>
              <button
                onClick={() => setIsStartShiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Ca làm việc:</label>
                <select
                  value={shiftNameInput}
                  onChange={(e) => setShiftNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsStartShiftModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Mở Ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đóng Ca Làm Việc */}
      {isCloseShiftModalOpen && currentOpenShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">
                Kết Ca: {currentOpenShift.shiftName}
              </h3>
              <button
                onClick={() => setIsCloseShiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-700 flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Tiền mặt đầu ca:</span>
                  <span className="font-mono text-white">{formatVND(currentOpenShift.initialCash)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Doanh thu trong ca:</span>
                  <span className="font-mono text-gold-400 font-medium">+{formatVND(currentOpenShift.totalRevenue || 0)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-charcoal-700 font-semibold text-slate-200 text-xs">
                  <span>Tiền két lý thuyết:</span>
                  <span className="font-mono text-emerald-400">
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono font-medium focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú bàn giao ca:</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về chênh lệch hoặc hóa đơn đặc biệt..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold transition-colors"
                >
                  Chốt & Đóng Ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
