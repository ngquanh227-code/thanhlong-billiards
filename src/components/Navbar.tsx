import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Shield,
  Volume2,
  VolumeX,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onOpenShiftModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShiftModal, onNavigateTab }) => {
  const {
    tables,
    shifts,
    currentStaff,
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

  const getRoleName = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Chủ Quán';
      case 'MANAGER': return 'Quản Lý';
      case 'CASHIER': return 'Thu Ngân';
      case 'WAITER': return 'Phục Vụ';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal-900 border-b border-charcoal-800 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigateTab && onNavigateTab('dashboard')}
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="Thanh Long Billiards Logo"
              className="w-10 h-10 rounded-full border border-amber-500/50 shadow-[0_0_12px_rgba(212,175,55,0.3)] object-cover group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-charcoal-900" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm lg:text-base font-bold tracking-wider text-gold-400 font-brand leading-tight group-hover:text-gold-300 transition-colors">
              THANH LONG
            </span>
            <span className="text-[9px] tracking-[0.25em] text-gold-500/80 font-sans uppercase font-medium leading-tight">
              BILLIARDS CLUB
            </span>
          </div>
        </div>

        {/* Center: Live Counts & Clock (Minimalist) */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span
              onClick={() => onNavigateTab && onNavigateTab('tables')}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Đang chơi: <b className="text-emerald-400 font-mono">{playingCount}</b>
            </span>

            {waitingCount > 0 && (
              <span
                onClick={() => onNavigateTab && onNavigateTab('tables')}
                className="cursor-pointer hover:text-white transition-colors"
              >
                Chờ tính: <b className="text-amber-400 font-mono">{waitingCount}</b>
              </span>
            )}

            <span
              onClick={() => onNavigateTab && onNavigateTab('tables')}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Trống: <b className="text-slate-200 font-mono">{availableCount}</b>
            </span>
          </div>

          <div className="h-4 w-px bg-charcoal-750" />

          {/* Clock */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
            <span className="font-mono text-white font-medium">{formattedTime}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Shift status button */}
          {currentShift ? (
            <button
              onClick={onOpenShiftModal}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-slate-300 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5" />
              {currentShift.shiftName.split(' ')[0]} {currentShift.shiftName.split(' ')[1]}
            </button>
          ) : (
            <button
              onClick={onOpenShiftModal}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-amber-400 transition-colors"
            >
              Mở ca
            </button>
          )}

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-850 transition-colors"
            title={soundEnabled ? 'Tắt âm' : 'Bật âm'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme toggle (Sáng / Tối) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-850 transition-colors"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* User selector with Role Badge */}
          <div className="flex items-center gap-1.5 bg-charcoal-850 px-2 py-1 rounded-lg border border-charcoal-750">
            <span className="text-xs">{currentStaff.role === 'OWNER' || currentStaff.role === 'MANAGER' ? '👑' : '👤'}</span>
            <select
              value={currentStaff.id}
              onChange={(e) => switchCurrentStaff(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer py-0.5 font-medium"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id} className="bg-charcoal-900 text-white">
                  {s.name} ({s.role === 'OWNER' ? '👑 Chủ Quán' : s.role === 'MANAGER' ? '👑 Quản Lý' : `👤 ${getRoleName(s.role)}`})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Demo */}
          <button
            onClick={() => {
              if (window.confirm('Khôi phục dữ liệu ban đầu?')) resetAllDemoData();
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            title="Khôi phục dữ liệu ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
