import React from 'react';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/logo.png';

interface NavbarProps {
  onOpenShiftModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShiftModal, onNavigateTab }) => {
  const {
    tables,
    shifts,
    currentStaff,
    isAdmin,
    toggleRole,
    staff,
    switchCurrentStaff,
    currentTime,
    resetAllDemoData,
    soundEnabled,
    toggleSound,
    theme,
    toggleTheme,
  } = useApp();

  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

  const currentShift = shifts.find((s) => s.status === 'OPEN');

  const formattedDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

  const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const getRoleShort = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'OWNER':
      case 'MANAGER':
        return 'ADMIN';
      case 'STAFF':
      case 'CASHIER':
      case 'WAITER':
      default:
        return 'NHÂN VIÊN';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0e14] border-b border-charcoal-750 px-3 sm:px-4 lg:px-6 py-2 select-none">
      <div className="flex items-center justify-between gap-2 max-w-full mx-auto">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          onClick={() => onNavigateTab && onNavigateTab('dashboard')}
          title="Về Trang Tổng Quan"
        >
          <img
            src={logoImg}
            alt="Thanh Long Billiards Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-amber-500/50 object-cover group-hover:scale-105 transition-transform"
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-widest text-gold-400 font-brand leading-none group-hover:text-amber-300 transition-colors">
                THANH LONG
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                PRO
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-slate-400 font-mono uppercase font-semibold leading-tight">
              BILLIARDS CLUB
            </span>
          </div>
        </div>

        {/* Center: Live Counts & Clock (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-charcoal-850 px-3 py-1 rounded-lg border border-charcoal-750 font-mono">
            <button
              onClick={() => onNavigateTab && onNavigateTab('tables')}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="text-emerald-400 font-bold">● CHƠI</span>
              <span className="text-white font-bold">{playingCount}</span>
            </button>

            <span className="text-slate-600">|</span>

            {waitingCount > 0 && (
              <>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('tables')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-amber-400 font-bold">▲ CHỜ</span>
                  <span className="text-white font-bold">{waitingCount}</span>
                </button>
                <span className="text-slate-600">|</span>
              </>
            )}

            <button
              onClick={() => onNavigateTab && onNavigateTab('tables')}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="text-slate-400">○ TRỐNG</span>
              <span className="text-slate-200 font-bold">{availableCount}</span>
            </button>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 bg-charcoal-850 px-2.5 py-1 rounded-lg border border-charcoal-750">
            <span>{formattedDate}</span>
            <span className="text-gold-400 font-bold">{formattedTime}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Shift status button */}
          {currentShift ? (
            <button
              onClick={onOpenShiftModal}
              className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-emerald-400 font-mono font-bold transition-colors"
              title="Xem thông tin ca trực hiện tại"
            >
              [CA: {currentShift.shiftName.split(' ')[0]}]
            </button>
          ) : (
            <button
              onClick={onOpenShiftModal}
              className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold transition-colors"
            >
              [MỞ CA]
            </button>
          )}

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-charcoal-850 text-emerald-400 border-charcoal-700 hover:border-emerald-500/50'
                : 'bg-charcoal-850 text-slate-400 border-charcoal-750 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {soundEnabled ? 'ÂM: ON' : 'ÂM: OFF'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-charcoal-850 text-slate-300 border border-charcoal-750 hover:border-slate-500 transition-colors"
            title="Đổi chế độ Sáng / Tối"
          >
            {theme === 'dark' ? 'TỐI' : 'SÁNG'}
          </button>

          {/* Admin / Staff Quick Toggle Button & Selector */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleRole}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
              }`}
              title="Bấm để chuyển nhanh giữa chế độ ADMIN (chỉnh sửa) và NHÂN VIÊN (vận hành)"
            >
              <span>{isAdmin ? '[QUYỀN: ADMIN]' : '[QUYỀN: NHÂN VIÊN]'}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-black ${
                isAdmin ? 'bg-amber-400 text-charcoal-950' : 'bg-charcoal-800 text-slate-300'
              }`}>
                {isAdmin ? 'CHỈNH SỬA' : 'VẬN HÀNH'}
              </span>
            </button>

            <div className="hidden md:flex items-center bg-charcoal-850 px-2 py-0.5 rounded-lg border border-charcoal-750">
              <select
                value={currentStaff.id}
                onChange={(e) => switchCurrentStaff(e.target.value)}
                className="bg-transparent text-[11px] text-slate-200 focus:outline-none cursor-pointer py-0.5 font-medium"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id} className="bg-charcoal-900 text-white">
                    {s.name} ({getRoleShort(s.role)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu?')) resetAllDemoData();
            }}
            className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
            title="Khôi phục dữ liệu ban đầu"
          >
            RESET
          </button>
        </div>
      </div>
    </header>
  );
};
