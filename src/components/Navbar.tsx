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
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d111a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 select-none transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-full mx-auto">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => onNavigateTab && onNavigateTab('dashboard')}
          title="Về trang tổng quan"
        >
          <img
            src={logoImg}
            alt="Thanh Long Billiards"
            className="w-9 h-9 rounded-full ring-1 ring-amber-500/40 object-cover group-hover:ring-amber-400 transition-all shadow-sm"
          />

          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wider text-amber-300/90 font-brand leading-none">
              THANH LONG BILLIARDS
            </span>
            <span className="text-[11px] text-slate-400 font-sans mt-0.5">
              Hệ thống quản lý câu lạc bộ
            </span>
          </div>
        </div>

        {/* Center: Live Status Summary & Clock */}
        <div className="hidden md:flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-3 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800">
            <button
              onClick={() => onNavigateTab && onNavigateTab('tables')}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span className="text-slate-300 font-medium">Đang chơi:</span>
              <span className="text-emerald-400 font-semibold">{playingCount}</span>
            </button>

            {waitingCount > 0 && (
              <>
                <span className="text-slate-700">•</span>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('tables')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span className="text-slate-300 font-medium">Chờ tính:</span>
                  <span className="text-amber-400 font-semibold">{waitingCount}</span>
                </button>
              </>
            )}

            <span className="text-slate-700">•</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('tables')}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
              <span className="text-slate-400 font-medium">Trống:</span>
              <span className="text-slate-200 font-semibold">{availableCount}</span>
            </button>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>{formattedDate}</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-slate-200">{formattedTime}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 font-sans">
          {/* Shift status button */}
          {currentShift ? (
            <button
              onClick={onOpenShiftModal}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-medium transition-colors"
              title="Xem ca trực hiện tại"
            >
              {currentShift.shiftName.split(' ')[0]}
            </button>
          ) : (
            <button
              onClick={onOpenShiftModal}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-300 font-medium transition-colors"
            >
              Mở ca trực
            </button>
          )}

          {/* Admin / Staff Role Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleRole}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isAdmin
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Chuyển đổi giữa quyền Quản trị (sửa quán) và Nhân viên (vận hành)"
            >
              {isAdmin ? 'Quản trị viên' : 'Nhân viên'}
            </button>

            <div className="hidden lg:flex items-center bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-800">
              <select
                value={currentStaff.id}
                onChange={(e) => switchCurrentStaff(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer py-1 font-medium"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Sound & Theme Controls */}
          <button
            onClick={toggleTheme}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Đổi giao diện Sáng / Tối"
          >
            {theme === 'dark' ? 'Tối' : 'Sáng'}
          </button>

          <button
            onClick={toggleSound}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-900/60 text-emerald-400 border-slate-800 hover:border-slate-700'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? 'Âm thanh' : 'Tắt âm'}
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của quán?')) resetAllDemoData();
            }}
            className="hidden xl:inline-block text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Khôi phục dữ liệu ban đầu"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </header>
  );
};
