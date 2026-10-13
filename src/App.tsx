import React, { useState, useEffect } from 'react';
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
import { Menu as MenuIcon } from 'lucide-react';
import { sounds } from './services/sound';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('tables');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const { addToast, currentStaff } = useApp();

  const isAdmin = currentStaff.role === 'OWNER' || currentStaff.role === 'MANAGER';

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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#080a0e] text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenShiftModal={() => setCurrentTab('staff')}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Mobile Top Sub-bar with Hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-charcoal-900 border-b border-charcoal-800 shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-charcoal-800 px-3 py-1.5 rounded-lg border border-charcoal-750"
        >
          <MenuIcon className="w-4 h-4 text-gold-400" />
          <span>Danh Mục Quản Lý</span>
        </button>

        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          {currentTab === 'tables' && 'Sơ Đồ Bàn'}
          {currentTab === 'dashboard' && 'Tổng Quan'}
          {currentTab === 'pos' && 'Thu Ngân'}
          {currentTab === 'menu' && 'Menu & Order'}
          {currentTab === 'members' && 'Hội Viên'}
          {currentTab === 'staff' && 'Nhân Viên & Ca'}
          {currentTab === 'inventory' && 'Kho & Thu Chi'}
          {currentTab === 'reports' && 'Báo Cáo'}
          {currentTab === 'settings' && 'Cài Đặt'}
        </span>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-hidden h-full flex flex-col">
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

      {/* Toast Notifications Container */}
      <ToastContainer />
    </div>
  );
}
