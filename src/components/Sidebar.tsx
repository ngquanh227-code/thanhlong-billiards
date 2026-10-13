import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  Receipt,
  UtensilsCrossed,
  Users,
  UserCog,
  Boxes,
  BarChart3,
  Settings,
} from 'lucide-react';
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
  const { tables, menu, currentStaff } = useApp();

  const isAdmin = currentStaff.role === 'OWNER' || currentStaff.role === 'MANAGER';
  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;

  const allNavItems = [
    { id: 'tables', label: 'Sơ Đồ Bàn', icon: Grid3X3, count: playingCount > 0 ? playingCount : undefined, adminOnly: false },
    { id: 'pos', label: 'Thu Ngân', icon: Receipt, count: waitingCount > 0 ? waitingCount : undefined, adminOnly: false },
    { id: 'menu', label: 'Menu & Order', icon: UtensilsCrossed, adminOnly: false },
    { id: 'members', label: 'Hội Viên', icon: Users, adminOnly: false },
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, adminOnly: false },
    { id: 'staff', label: 'Nhân Viên & Ca', icon: UserCog, adminOnly: true },
    { id: 'inventory', label: 'Kho & Thu Chi', icon: Boxes, adminOnly: true },
    { id: 'reports', label: 'Báo Cáo Doanh Thu', icon: BarChart3, adminOnly: true },
    { id: 'settings', label: 'Cài Đặt Hệ Thống', icon: Settings, adminOnly: true },
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-56 bg-charcoal-900 border-r border-charcoal-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 p-2.5">
          {/* Active Role Indicator Card */}
          <div className="px-2.5 py-2 mx-0.5 mb-2 rounded-lg bg-charcoal-850 border border-charcoal-750 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0">{isAdmin ? '👑' : '👤'}</span>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white text-[11px] truncate">
                  {currentStaff.name}
                </span>
                <span className={`text-[9px] font-medium leading-tight ${isAdmin ? 'text-gold-400' : 'text-slate-400'}`}>
                  {isAdmin ? 'Quản Trị Viên' : 'Nhân Viên Ca'}
                </span>
              </div>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
              isAdmin
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg font-medium text-xs transition-colors group text-left ${
                    isActive
                      ? 'bg-charcoal-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-charcoal-750 text-slate-300">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Minimal Footer */}
        <div className="p-3 border-t border-charcoal-800 flex items-center gap-2.5 bg-charcoal-900/50">
          <img
            src="/logo.png"
            alt="Thanh Long"
            className="w-7 h-7 rounded-full border border-amber-500/40 object-cover"
          />
          <div className="flex flex-col">
            <span className="font-brand text-gold-400 text-xs font-bold leading-tight">
              THANH LONG
            </span>
            <span className="text-[9px] text-slate-500 font-medium">Billiards Management</span>
          </div>
        </div>
      </aside>
    </>
  );
};
