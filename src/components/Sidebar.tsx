import React from 'react';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/logo.png';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { tables, currentStaff, isAdmin } = useApp();
  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;

  const allNavItems = [
    { id: 'tables', num: '01', code: 'TAB', label: 'Sơ Đồ Bàn', hotkey: 'F4', count: playingCount > 0 ? playingCount : undefined, adminOnly: false },
    { id: 'pos', num: '02', code: 'POS', label: 'Quầy Thu Ngân', hotkey: 'F8', count: waitingCount > 0 ? waitingCount : undefined, adminOnly: false },
    { id: 'menu', num: '03', code: 'ORD', label: 'Menu & Order', hotkey: 'F2', adminOnly: false },
    { id: 'members', num: '04', code: 'VIP', label: 'Hội Viên & Thẻ', adminOnly: false },
    { id: 'dashboard', num: '05', code: 'DSH', label: 'Tổng Quan', hotkey: 'F1', adminOnly: false },
    { id: 'staff', num: '06', code: 'STF', label: 'Nhân Sự & Ca Trực', adminOnly: true },
    { id: 'inventory', num: '07', code: 'KHO', label: 'Kho & Sổ Quỹ Thu Chi', adminOnly: true },
    { id: 'reports', num: '08', code: 'RPT', label: 'Báo Cáo Doanh Thu', adminOnly: true },
    { id: 'settings', num: '09', code: 'SET', label: 'Cài Đặt Hệ Thống', adminOnly: true },
  ];

  const visibleNavItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0b0f17] border-r border-charcoal-750 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 p-3">
          {/* Mobile Close Button Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-charcoal-750">
            <span className="font-mono text-xs font-bold text-gold-400 tracking-wider">
              DANH MỤC HỆ THỐNG
            </span>
            <button
              onClick={onCloseMobile}
              className="text-xs font-mono font-bold px-2 py-1 bg-charcoal-850 hover:bg-charcoal-750 text-slate-300 rounded border border-charcoal-700"
            >
              ✕ ĐÓNG
            </button>
          </div>

          {/* Active Role Indicator Card */}
          <div className="px-3 py-2.5 mb-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs truncate">
                  {currentStaff.name}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-medium ${isAdmin ? 'text-amber-400' : 'text-slate-400'}`}>
                {isAdmin ? 'QUYỀN: QUẢN TRỊ' : 'QUYỀN: NHÂN VIÊN'}
              </span>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isAdmin ? 'ADMIN' : 'STAFF'}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2 pb-1.5 font-bold">
            CHỨC NĂNG VẬN HÀNH
          </div>

          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-0.5">
            {visibleNavItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs transition-all group text-left ${
                    isActive
                      ? 'bg-emerald-950/60 text-white font-bold border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-charcoal-850/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-charcoal-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      {item.num}
                    </span>
                    <span className="truncate tracking-wide">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.hotkey && (
                      <span className="hidden xl:inline-block text-[9px] font-mono px-1 py-0.5 rounded bg-charcoal-800 text-slate-400 border border-charcoal-700">
                        {item.hotkey}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-emerald-500 text-charcoal-950'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Minimal Footer */}
        <div className="p-3 border-t border-charcoal-750 flex items-center justify-between bg-charcoal-900/60">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Thanh Long"
              className="w-7 h-7 rounded-full border border-amber-500/40 object-cover"
            />
            <div className="flex flex-col">
              <span className="font-brand text-gold-400 text-xs font-black tracking-wider leading-none">
                THANH LONG
              </span>
              <span className="text-[9px] font-mono text-slate-400">CLUB CONSOLE</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-400/80 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            ONLINE
          </span>
        </div>
      </aside>
    </>
  );
};
