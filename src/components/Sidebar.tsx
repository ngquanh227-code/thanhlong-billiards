import React from 'react';
import { useApp } from '../context/AppContext';

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

  const operationNavItems = [
    { id: 'tables', label: 'Sơ đồ bàn', count: playingCount > 0 ? playingCount : undefined },
    { id: 'pos', label: 'Quầy thu ngân', count: waitingCount > 0 ? waitingCount : undefined },
    { id: 'menu', label: 'Thực đơn & Order' },
    { id: 'members', label: 'Hội viên & Khách' },
    { id: 'dashboard', label: 'Tổng quan quán' },
  ];

  const adminNavItems = [
    { id: 'staff', label: 'Nhân sự & Ca trực' },
    { id: 'inventory', label: 'Kho hàng & Sổ quỹ' },
    { id: 'reports', label: 'Báo cáo doanh thu' },
    { id: 'settings', label: 'Cài đặt hệ thống' },
  ];

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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-60 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none font-sans ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 p-3.5 overflow-y-auto">
          {/* Mobile Close Button Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">
              Danh mục
            </span>
            <button
              onClick={onCloseMobile}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              Đóng
            </button>
          </div>

          {/* User Status Card */}
          <div className="px-3 py-2.5 mb-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-white text-xs truncate">
                {currentStaff.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {isAdmin ? 'Quản trị viên' : 'Nhân viên trực'}
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
            }`}>
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
          </div>

          {/* Operation Navigation */}
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1.5">
            Vận hành
          </div>

          <nav className="flex flex-col gap-1 mb-4">
            {operationNavItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1.5 pt-2 border-t border-slate-800/70">
                Quản lý
              </div>

              <nav className="flex flex-col gap-1">
                {adminNavItems.map((item) => {
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>Hệ thống trực tuyến</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        </div>
      </aside>
    </>
  );
};
