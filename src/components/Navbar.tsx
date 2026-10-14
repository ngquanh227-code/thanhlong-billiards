import React from 'react';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/logo.png';

interface NavbarProps {
  onNavigateTab?: (tab: string) => void;
  onOpenAiModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab, onOpenAiModal }) => {
  const {
    tables,
    isAdmin,
    toggleRole,
    currentTime,
  } = useApp();

  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

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
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 select-none transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-full mx-auto">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => onNavigateTab && onNavigateTab(isAdmin ? 'dashboard' : 'tables')}
          title={isAdmin ? "Về trang tổng quan" : "Về sơ đồ bàn"}
        >
          <img
            src={logoImg}
            alt="Thanh Long Billiards"
            className="w-9 h-9 rounded-full ring-1 ring-amber-500/40 object-cover group-hover:ring-amber-400 transition-all shadow-sm"
          />

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-amber-300/90 font-brand leading-none">
              THANH LONG BILLIARDS
            </span>
            <span className="hidden sm:block text-[11px] text-slate-400 font-sans mt-0.5">
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
          {/* AI Chatbot Assistant Button */}
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 shadow-sm active:scale-95"
              title="Mở Trợ lý AI vận hành quán"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
              <span>Trợ lý AI</span>
            </button>
          )}

          {/* Admin / Staff Role Switcher */}
          <button
            onClick={toggleRole}
            className={`h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center whitespace-nowrap transition-all border active:scale-95 ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Chuyển đổi giữa quyền Quản trị và Nhân viên"
          >
            {isAdmin ? 'Quản trị' : 'Nhân viên'}
          </button>
        </div>
      </div>
    </header>
  );
};
