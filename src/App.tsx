import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TableMapView } from './components/tables/TableMapView';
import { PosCashierView } from './components/pos/PosCashierView';
import { MenuView } from './components/menu/MenuView';
import { MemberView } from './components/members/MemberView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { sounds } from './services/sound';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('tables');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const { currentStaff, tables, isAdmin } = useApp();
  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;

  // Guard admin-only tabs
  useEffect(() => {
    const adminOnlyTabs = ['dashboard', 'members', 'reports', 'inventory'];
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
        if (isAdmin) {
          setCurrentTab('dashboard');
          sounds.playClick();
        }
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
      } else if (e.key === 'F9') {
        e.preventDefault();
        setIsAiModalOpen((prev) => !prev);
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
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className={`flex-1 ${currentTab === 'tables' ? 'overflow-hidden' : 'overflow-y-auto'} h-full flex flex-col pb-20 lg:pb-0`}>
          {currentTab === 'dashboard' && <DashboardView onNavigateTab={setCurrentTab} />}
          {currentTab === 'tables' && <TableMapView />}
          {currentTab === 'pos' && <PosCashierView />}
          {currentTab === 'menu' && <MenuView />}
          {currentTab === 'members' && <MemberView />}
          {currentTab === 'inventory' && <InventoryView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Dedicated Mobile Bottom Navigation Bar (Thumb friendly for phone users) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-stretch h-15 select-none safe-area-pb font-sans shadow-lg">
        <button
          onClick={() => {
            setCurrentTab('tables');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 relative ${
            currentTab === 'tables' ? 'text-amber-300 font-bold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base leading-none mb-0.5">🎱</span>
          <span className="text-[11px] font-medium leading-none">Bàn</span>
          {playingCount > 0 && (
            <span className="absolute top-1 right-2 sm:right-4 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
              {playingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentTab('pos');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 relative ${
            currentTab === 'pos' ? 'text-amber-300 font-bold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base leading-none mb-0.5">💵</span>
          <span className="text-[11px] font-medium leading-none">Thu ngân</span>
          {waitingCount > 0 && (
            <span className="absolute top-1 right-2 sm:right-4 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 shadow-sm animate-pulse">
              {waitingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentTab('menu');
            sounds.playClick();
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentTab === 'menu' ? 'text-amber-300 font-bold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base leading-none mb-0.5">🍹</span>
          <span className="text-[11px] font-medium leading-none">Thực đơn</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              setCurrentTab('reports');
              sounds.playClick();
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              currentTab === 'reports' ? 'text-amber-300 font-bold bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base leading-none mb-0.5">📊</span>
            <span className="text-[11px] font-medium leading-none">Báo cáo</span>
          </button>
        )}

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <span className="text-base leading-none mb-0.5">☰</span>
          <span className="text-[11px] font-medium leading-none">Chức năng</span>
        </button>
      </nav>


      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}
