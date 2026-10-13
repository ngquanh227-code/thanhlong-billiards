import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TableMapView } from './components/tables/TableMapView';
import { PosCashierView } from './components/pos/PosCashierView';
import { MenuView } from './components/menu/MenuView';
import { MemberView } from './components/members/MemberView';
import { StaffView } from './components/staff/StaffView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { sounds } from './services/sound';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('tables');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const { currentStaff, tables, isAdmin } = useApp();
  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;

  // Guard admin-only tabs
  useEffect(() => {
    const adminOnlyTabs = ['reports', 'staff', 'inventory'];
    if (!isAdmin && adminOnlyTabs.includes(currentTab)) {
      setCurrentTab('tables');
    }
  }, [isAdmin, currentTab]);

  // Sapo POS Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setCurrentTab('dashboard');
        sounds.playClick();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setCurrentTab('menu');
        sounds.playClick();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCurrentTab('tables');
        sounds.playClick();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setCurrentTab('pos');
        sounds.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'tables': return 'Sơ Đồ Bàn';
      case 'pos': return 'Quầy Thu Ngân';
      case 'menu': return 'Menu & Order';
      case 'members': return 'Hội Viên & Thẻ';
      case 'dashboard': return 'Tổng Quan Hoạt Động';
      case 'staff': return 'Nhân Sự & Ca Trực';
      case 'inventory': return 'Kho Hàng & Sổ Quỹ';
      case 'reports': return 'Báo Cáo Doanh Thu';
      case 'settings': return 'Cài Đặt Hệ Thống';
      default: return tab;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenShiftModal={() => setCurrentTab('staff')}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Mobile Top Context Strip */}
      <div className="lg:hidden flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 active:scale-95 transition-transform"
        >
          <span>Chức năng</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">
            {getTabTitle(currentTab)}
          </span>
          {playingCount > 0 && (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {playingCount} bàn đang chơi
            </span>
          )}
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-hidden h-full flex flex-col pb-14 lg:pb-0">
          {currentTab === 'dashboard' && <DashboardView onNavigateTab={setCurrentTab} />}
          {currentTab === 'tables' && <TableMapView />}
          {currentTab === 'pos' && <PosCashierView />}
          {currentTab === 'menu' && <MenuView />}
          {currentTab === 'members' && <MemberView />}
          {currentTab === 'staff' && <StaffView />}
          {currentTab === 'inventory' && <InventoryView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Dedicated Mobile Bottom Navigation Bar (Thumb friendly for phone users) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-stretch h-14 select-none safe-area-pb font-sans">
        <button
          onClick={() => {
            setCurrentTab('tables');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            currentTab === 'tables' ? 'text-amber-300 font-semibold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xs font-medium">Bàn</span>
          <span className="text-[10px] text-slate-400">Sơ đồ</span>
          {playingCount > 0 && (
            <span className="absolute top-1.5 right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
              {playingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentTab('pos');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            currentTab === 'pos' ? 'text-amber-300 font-semibold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xs font-medium">Thu ngân</span>
          <span className="text-[10px] text-slate-400">Hóa đơn</span>
          {waitingCount > 0 && (
            <span className="absolute top-1.5 right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
              {waitingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentTab('menu');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentTab === 'menu' ? 'text-amber-300 font-semibold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xs font-medium">Thực đơn</span>
          <span className="text-[10px] text-slate-400">F&B</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('members');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentTab === 'members' ? 'text-amber-300 font-semibold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-xs font-medium">Hội viên</span>
          <span className="text-[10px] text-slate-400">Ví VIP</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-xs font-medium">Menu</span>
          <span className="text-[10px] text-slate-400">Thêm</span>
        </button>
      </nav>

    </div>
  );
}
