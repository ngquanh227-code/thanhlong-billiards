import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TableCard } from './TableCard';
import { OpenTableModal } from './OpenTableModal';
import { TransferTableModal } from './TransferTableModal';
import { MergeTableModal } from './MergeTableModal';
import { StationaryControlPanel } from './StationaryControlPanel';
import { OrderModal } from '../menu/OrderModal';
import { CashierModal } from '../pos/CashierModal';
import { TableItem, TableSession, TableType } from '../../types';
import { formatVND, formatSecondsToTimer, calculateTableFee } from '../../services/calculation';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const TableMapView: React.FC = () => {
  const {
    tables,
    customers,
    staff,
    menu,
    pricingRules,
    settings,
    currentStaff,
    currentTime,
    openTable,
    pauseTable,
    resumeTable,
    transferTable,
    mergeTables,
    addOrderToTable,
    removeOrderItem,
    updateOrderItemQty,
    completeCheckout,
    setTableMaintenance,
    getActiveSessionForTable,
    addTable,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchCode, setSearchCode] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Currently selected table for the stationary panel
  const [selectedTableId, setSelectedTableId] = useState<string>(() => {
    const firstPlaying = tables.find((t) => t.status === 'PLAYING');
    return firstPlaying?.id || tables[0]?.id || '';
  });

  // Mobile drawer toggle
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false);

  // Modals
  const [activeOpenModalTable, setActiveOpenModalTable] = useState<TableItem | null>(null);
  const [activeTransferModalTable, setActiveTransferModalTable] = useState<TableItem | null>(null);
  const [activeMergeModalTable, setActiveMergeModalTable] = useState<TableItem | null>(null);
  const [activeOrderModalTable, setActiveOrderModalTable] = useState<TableItem | null>(null);
  const [activeCheckoutData, setActiveCheckoutData] = useState<{ table: TableItem; session: TableSession } | null>(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState<boolean>(false);
  const [addTableForm, setAddTableForm] = useState({
    code: '',
    name: '',
    type: 'POOL' as TableType,
    hourlyRate: 60000,
    area: 'Khu Sảnh Lỗ',
    notes: '',
  });

  const handleOpenAddTable = () => {
    const nextIdx = tables.length + 1;
    const padded = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
    setAddTableForm({
      code: `Bàn ${padded}`,
      name: 'Bàn Bida Tiêu Chuẩn',
      type: 'POOL',
      hourlyRate: 60000,
      area: 'Khu Sảnh Lỗ',
      notes: '',
    });
    setIsAddTableModalOpen(true);
  };

  const handleSaveNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTableForm.code || !addTableForm.name) return;
    addTable(addTableForm);
    setIsAddTableModalOpen(false);
  };

  // Filter logic
  const filteredTables = tables.filter((table) => {
    const matchesType = typeFilter === 'ALL' || table.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter;
    const matchesSearch =
      table.code.toLowerCase().includes(searchCode.toLowerCase()) ||
      table.name.toLowerCase().includes(searchCode.toLowerCase()) ||
      table.area.toLowerCase().includes(searchCode.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const playingCount = tables.filter((t) => t.status === 'PLAYING').length;
  const waitingCount = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');
  const activePlayingTables = tables.filter((t) => t.status === 'PLAYING');

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0] || null;
  const selectedSession = selectedTable ? getActiveSessionForTable(selectedTable.id) : undefined;
  const selectedPricingRule = selectedTable ? pricingRules.find((r) => r.type === selectedTable.type) : undefined;
  const selectedCustomer = customers.find((c) => c.id === selectedSession?.customerId);

  const handleConfirmOrder = (
    tableId: string,
    itemsToAdd: { item: any; quantity: number; notes?: string }[]
  ) => {
    itemsToAdd.forEach(({ item, quantity, notes }) => {
      addOrderToTable(tableId, item, quantity, notes);
    });
  };

  const handleSelectTable = (tbl: TableItem) => {
    setSelectedTableId(tbl.id);
  };

  return (
    <div className="flex-1 h-full flex flex-col lg:flex-row overflow-hidden w-full">
      {/* Left Column: Tables Grid, Filters & Bar */}
      <div className="flex-1 h-full overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">
        {/* Top Controls: Clean, spacious */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-heading">
              Sơ đồ bàn
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {tables.length} bàn quán có • <span className="text-emerald-400 font-medium">{playingCount} đang chơi</span> • <span className="text-slate-300">{availableCount} bàn trống</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View mode toggle */}
            <div className="flex items-center bg-charcoal-850 p-1 rounded-lg border border-charcoal-750">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'GRID' ? 'bg-charcoal-750 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Xem dạng lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'LIST' ? 'bg-charcoal-750 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Xem dạng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {currentStaff.role === 'OWNER' || currentStaff.role === 'MANAGER' ? (
              <button
                onClick={handleOpenAddTable}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 font-medium text-xs transition-colors"
                title="Thêm bàn mới cho quán (Quản Trị Viên)"
              >
                <Plus className="w-3.5 h-3.5 text-gold-400" />
                <span>Thêm Bàn</span>
              </button>
            ) : null}

            {availableTables.length > 0 && (
              <button
                onClick={() => setActiveOpenModalTable(availableTables[0])}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Mở bàn</span>
              </button>
            )}

            {/* Mobile trigger to view panel */}
            <button
              onClick={() => setIsMobilePanelOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-750 text-gold-400 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Điều khiển</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'ALL', label: `Tất cả (${tables.length})` },
              { id: 'POOL', label: `Bàn Lỗ (${tables.filter((t) => t.type === 'POOL').length})` },
              { id: 'CAROM', label: `Carom (${tables.filter((t) => t.type === 'CAROM').length})` },
              { id: 'VIP', label: `Phòng VIP (${tables.filter((t) => t.type === 'VIP').length})` },
              { id: 'SNOOKER', label: `Snooker (${tables.filter((t) => t.type === 'SNOOKER').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-charcoal-750 text-white border border-charcoal-600'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Chips & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-charcoal-850 p-1 rounded-lg border border-charcoal-750 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'ALL' ? 'bg-charcoal-750 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('PLAYING')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'PLAYING'
                    ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đang chơi ({playingCount})
              </button>
              <button
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'AVAILABLE'
                    ? 'bg-charcoal-750 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Trống ({availableCount})
              </button>
              {waitingCount > 0 && (
                <button
                  onClick={() => setStatusFilter('WAITING_PAYMENT')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === 'WAITING_PAYMENT'
                      ? 'bg-amber-500/20 text-amber-300 font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chờ tính ({waitingCount})
                </button>
              )}
            </div>

            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm bàn..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-charcoal-850 border border-charcoal-750 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Grid or List View Mode */}
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pb-6">
            {filteredTables.map((table) => {
              const activeSession = getActiveSessionForTable(table.id);
              const rule = pricingRules.find((r) => r.type === table.type);

              return (
                <TableCard
                  key={table.id}
                  table={table}
                  session={activeSession}
                  pricingRule={rule}
                  currentTime={currentTime}
                  isSelected={selectedTableId === table.id}
                  onSelectTable={(tbl) => handleSelectTable(tbl)}
                  onOpenTable={(tbl) => {
                    handleSelectTable(tbl);
                    setActiveOpenModalTable(tbl);
                  }}
                  onPauseTable={(tbl) => pauseTable(tbl.id)}
                  onResumeTable={(tbl) => resumeTable(tbl.id)}
                  onTransferTable={(tbl) => {
                    handleSelectTable(tbl);
                    setActiveTransferModalTable(tbl);
                  }}
                  onOrderMenu={(tbl) => {
                    handleSelectTable(tbl);
                    setActiveOrderModalTable(tbl);
                  }}
                  onCheckout={(tbl, sess) => {
                    handleSelectTable(tbl);
                    setActiveCheckoutData({ table: tbl, session: sess });
                  }}
                  onToggleMaintenance={(tbl) =>
                    setTableMaintenance(tbl.id, tbl.status !== 'MAINTENANCE')
                  }
                />
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Bàn</th>
                    <th className="py-2.5 px-3">Loại</th>
                    <th className="py-2.5 px-3">Khu Vực</th>
                    <th className="py-2.5 px-3">Trạng Thái</th>
                    <th className="py-2.5 px-3">Khách Hàng</th>
                    <th className="py-2.5 px-3">Thời Gian</th>
                    <th className="py-2.5 px-3">Món</th>
                    <th className="py-2.5 px-3">Tạm Tính</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {filteredTables.map((tbl) => {
                    const sess = getActiveSessionForTable(tbl.id);
                    const rule = pricingRules.find((r) => r.type === tbl.type);
                    const fee = sess ? calculateTableFee(sess, rule, currentTime) : null;
                    const isSelected = selectedTableId === tbl.id;

                    return (
                      <tr
                        key={tbl.id}
                        onClick={() => handleSelectTable(tbl)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-charcoal-750 text-white font-medium' : 'hover:bg-charcoal-800'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-gold-400 inline-block" />}
                          {tbl.code}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{tbl.type}</td>
                        <td className="py-3 px-3 text-slate-400">{tbl.area}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            tbl.status === 'PLAYING'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : tbl.status === 'AVAILABLE'
                              ? 'bg-charcoal-800 text-slate-400'
                              : tbl.status === 'WAITING_PAYMENT'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-charcoal-900 text-slate-500'
                          }`}>
                            {tbl.status === 'PLAYING' ? 'Đang chơi' : tbl.status === 'AVAILABLE' ? 'Trống' : tbl.status === 'WAITING_PAYMENT' ? 'Chờ tính' : 'Bảo trì'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {sess?.customerName || (tbl.status === 'PLAYING' ? 'Khách lẻ' : '---')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {sess?.orders?.length || 0} món
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-gold-400">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {tbl.status === 'AVAILABLE' ? (
                            <button
                              onClick={() => {
                                handleSelectTable(tbl);
                                setActiveOpenModalTable(tbl);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
                            >
                              Mở
                            </button>
                          ) : sess ? (
                            <button
                              onClick={() => {
                                handleSelectTable(tbl);
                                setActiveCheckoutData({ table: tbl, session: sess });
                              }}
                              className="px-2.5 py-1 rounded bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs"
                            >
                              Tính tiền
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: BẢNG ĐIỀU KHIỂN ĐỨNG IM (Stationary Inspector Panel on Desktop) */}
      <div className="hidden lg:flex w-96 xl:w-[410px] shrink-0 border-l border-charcoal-750 bg-charcoal-900 h-full flex-col overflow-hidden">
        <StationaryControlPanel
          table={selectedTable}
          session={selectedSession}
          pricingRule={selectedPricingRule}
          customer={selectedCustomer}
          currentTime={currentTime}
          customers={customers}
          staff={staff}
          currentStaff={currentStaff}
          onOpenTableModal={(tbl) => setActiveOpenModalTable(tbl)}
          onQuickOpenTable={(tblId, custId, stfId, customRate) => openTable(tblId, custId, stfId, customRate)}
          onPauseTable={(tbl) => pauseTable(tbl.id)}
          onResumeTable={(tbl) => resumeTable(tbl.id)}
          onTransferTable={(tbl) => setActiveTransferModalTable(tbl)}
          onMergeTable={(tbl) => setActiveMergeModalTable(tbl)}
          onOpenOrderModal={(tbl) => setActiveOrderModalTable(tbl)}
          onCheckoutTable={(tbl, sess) => setActiveCheckoutData({ table: tbl, session: sess })}
          onUpdateOrderItemQty={updateOrderItemQty}
          onRemoveOrderItem={removeOrderItem}
          onToggleMaintenance={(tbl) => setTableMaintenance(tbl.id, tbl.status !== 'MAINTENANCE')}
        />
      </div>

      {/* Mobile Drawer (Only on screens < 1024px) */}
      {isMobilePanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-charcoal-900 border-t border-charcoal-750 rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-3 bg-charcoal-850 flex items-center justify-between border-b border-charcoal-750">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Bảng Điều Khiển • {selectedTable?.code}
              </span>
              <button
                onClick={() => setIsMobilePanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <StationaryControlPanel
                table={selectedTable}
                session={selectedSession}
                pricingRule={selectedPricingRule}
                customer={selectedCustomer}
                currentTime={currentTime}
                customers={customers}
                staff={staff}
                currentStaff={currentStaff}
                onOpenTableModal={(tbl) => {
                  setIsMobilePanelOpen(false);
                  setActiveOpenModalTable(tbl);
                }}
                onQuickOpenTable={(tblId, custId, stfId, customRate) => {
                  openTable(tblId, custId, stfId, customRate);
                  setIsMobilePanelOpen(false);
                }}
                onPauseTable={(tbl) => pauseTable(tbl.id)}
                onResumeTable={(tbl) => resumeTable(tbl.id)}
                onTransferTable={(tbl) => {
                  setIsMobilePanelOpen(false);
                  setActiveTransferModalTable(tbl);
                }}
                onMergeTable={(tbl) => {
                  setIsMobilePanelOpen(false);
                  setActiveMergeModalTable(tbl);
                }}
                onOpenOrderModal={(tbl) => {
                  setIsMobilePanelOpen(false);
                  setActiveOrderModalTable(tbl);
                }}
                onCheckoutTable={(tbl, sess) => {
                  setIsMobilePanelOpen(false);
                  setActiveCheckoutData({ table: tbl, session: sess });
                }}
                onUpdateOrderItemQty={updateOrderItemQty}
                onRemoveOrderItem={removeOrderItem}
                onToggleMaintenance={(tbl) => setTableMaintenance(tbl.id, tbl.status !== 'MAINTENANCE')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <OpenTableModal
        isOpen={Boolean(activeOpenModalTable)}
        table={activeOpenModalTable}
        customers={customers}
        staff={staff}
        pricingRules={pricingRules}
        currentStaff={currentStaff}
        onClose={() => setActiveOpenModalTable(null)}
        onConfirm={(tableId, customerId, staffId, customRate) => {
          openTable(tableId, customerId, staffId, customRate);
        }}
      />

      <TransferTableModal
        isOpen={Boolean(activeTransferModalTable)}
        sourceTable={activeTransferModalTable}
        availableTables={availableTables.filter((t) => t.id !== activeTransferModalTable?.id)}
        onClose={() => setActiveTransferModalTable(null)}
        onConfirm={(fromId, toId) => {
          transferTable(fromId, toId);
        }}
      />

      <MergeTableModal
        isOpen={Boolean(activeMergeModalTable)}
        sourceTable={activeMergeModalTable}
        activePlayingTables={activePlayingTables}
        onClose={() => setActiveMergeModalTable(null)}
        onConfirm={(fromId, toId) => {
          mergeTables(fromId, toId);
        }}
      />

      <OrderModal
        isOpen={Boolean(activeOrderModalTable)}
        table={activeOrderModalTable}
        session={activeOrderModalTable ? getActiveSessionForTable(activeOrderModalTable.id) : undefined}
        menu={menu}
        onClose={() => setActiveOrderModalTable(null)}
        onConfirmOrder={handleConfirmOrder}
        onRemoveExistingOrder={removeOrderItem}
        onUpdateExistingQty={updateOrderItemQty}
      />

      {activeCheckoutData && (
        <CashierModal
          isOpen={Boolean(activeCheckoutData)}
          table={activeCheckoutData.table}
          session={activeCheckoutData.session}
          pricingRule={pricingRules.find((r) => r.type === activeCheckoutData.table.type)}
          settings={settings}
          customers={customers}
          onClose={() => setActiveCheckoutData(null)}
          onConfirmCheckout={(sessionId, method, discount, surcharge, cashRec, change, ref) => {
            completeCheckout(sessionId, method, discount, surcharge, cashRec, change, ref);
          }}
        />
      )}

      {/* Modal: Thêm Bàn Mới Nhanh */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">
                Thêm Bàn Mới Cho Quán
              </h3>
              <button
                onClick={() => setIsAddTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTable} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Mã bàn:</label>
                  <input
                    type="text"
                    required
                    placeholder="Bàn 07, VIP 02..."
                    value={addTableForm.code}
                    onChange={(e) => setAddTableForm({ ...addTableForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-medium focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Loại bàn:</label>
                  <select
                    value={addTableForm.type}
                    onChange={(e) => {
                      const newType = e.target.value as TableType;
                      const matchedRule = pricingRules.find((r) => r.type === newType);
                      setAddTableForm({
                        ...addTableForm,
                        type: newType,
                        hourlyRate: matchedRule ? matchedRule.defaultHourlyRate : addTableForm.hourlyRate,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  >
                    <option value="POOL">Pool (Bàn Lỗ)</option>
                    <option value="CAROM">Carom (Pháp / 3C)</option>
                    <option value="VIP">VIP (Phòng Riêng)</option>
                    <option value="SNOOKER">Snooker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tên thương hiệu / Model:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Aileex 9020 Silver..."
                  value={addTableForm.name}
                  onChange={(e) => setAddTableForm({ ...addTableForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá theo giờ (VNĐ):</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={addTableForm.hourlyRate}
                    onChange={(e) => setAddTableForm({ ...addTableForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Khu vực / Tầng:</label>
                  <input
                    type="text"
                    required
                    placeholder="Khu Sảnh Lỗ, Lầu 1..."
                    value={addTableForm.area}
                    onChange={(e) => setAddTableForm({ ...addTableForm, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Tạo Bàn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
