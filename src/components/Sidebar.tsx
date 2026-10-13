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
  const { isAdmin } = useApp();

  const operationNavItems = [
    { id: 'tables', label: 'Sơ đồ bàn' },
    { id: 'pos', label: 'Quầy thu ngân' },
    { id: 'menu', label: 'Thực đơn & Order' },
    { id: 'members', label: 'Hội viên & Khách' },
    { id: 'dashboard', label: 'Tổng quan quán' },
    { id: 'settings', label: 'Cài đặt hệ thống' },
  ];

  const adminNavItems = [
    { id: 'staff', label: 'Nhân sự & Ca trực' },
    { id: 'inventory', label: 'Kho hàng & Sổ quỹ' },
    { id: 'reports', label: 'Báo cáo doanh thu' },
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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none font-sans ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 p-3.5 sm:p-4 overflow-y-auto">
          {/* Mobile Close Button Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              Danh mục
            </span>
            <button
              onClick={onCloseMobile}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>

          {/* Operation Navigation */}
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2.5 pb-2 pt-1">
            Vận hành
          </div>

          <nav className="flex flex-col gap-1 mb-3">
            {operationNavItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center justify-between w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold shadow-sm'
                      : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin Navigation */}
          {isAdmin && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2.5 pb-2">
                Quản lý
              </div>

              <nav className="flex flex-col gap-1">
                {adminNavItems.map((item) => {
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`flex items-center justify-between w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold shadow-sm'
                          : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="p-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>Hệ thống trực tuyến</span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Ổn định
          </span>
        </div>
      </aside>
    </>
  );
};
