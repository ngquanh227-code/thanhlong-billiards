import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/common/Toast';
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
    const adminOnlyTabs = ['reports', 'settings', 'staff', 'inventory'];
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
    <div className="h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenShiftModal={() => setCurrentTab('staff')}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Mobile Top Context Strip */}
      <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-[#0e121a] border-b border-charcoal-750 shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-gold-400 bg-charcoal-850 px-2.5 py-1 rounded border border-charcoal-700 active:scale-95 transition-transform"
        >
          <span>[DANH MỤC]</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
            {getTabTitle(currentTab)}
          </span>
          {playingCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              {playingCount} BÀN
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d14] border-t border-charcoal-750 flex items-stretch h-14 select-none safe-area-pb">
        <button
          onClick={() => {
            setCurrentTab('tables');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            currentTab === 'tables' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="font-mono text-xs font-black tracking-widest">[BÀN]</span>
          <span className="text-[10px] uppercase tracking-wider">Sơ Đồ</span>
          {playingCount > 0 && (
            <span className="absolute top-1.5 right-2 font-mono text-[9px] font-bold px-1 rounded-full bg-emerald-500 text-charcoal-950">
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
            currentTab === 'pos' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="font-mono text-xs font-black tracking-widest">[POS]</span>
          <span className="text-[10px] uppercase tracking-wider">Thu Ngân</span>
          {waitingCount > 0 && (
            <span className="absolute top-1.5 right-2 font-mono text-[9px] font-bold px-1 rounded-full bg-amber-500 text-charcoal-950">
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
            currentTab === 'menu' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="font-mono text-xs font-black tracking-widest">[ORD]</span>
          <span className="text-[10px] uppercase tracking-wider">Gọi Món</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('members');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentTab === 'members' ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="font-mono text-xs font-black tracking-widest">[VIP]</span>
          <span className="text-[10px] uppercase tracking-wider">Hội Viên</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-white transition-colors"
        >
          <span className="font-mono text-xs font-black tracking-widest">[THÊM]</span>
          <span className="text-[10px] uppercase tracking-wider">Tất Cả</span>
        </button>
      </nav>

      {/* Toast Notifications Container */}
      <ToastContainer />
    </div>
  );
}
