import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TableCard } from './TableCard';
import { OpenTableModal } from './OpenTableModal';
import { TransferTableModal } from './TransferTableModal';
import { MergeTableModal } from './MergeTableModal';
import { StationaryControlPanel } from './StationaryControlPanel';
import { OrderModal } from '../menu/OrderModal';
import { CashierModal } from '../pos/CashierModal';
import { TableItem, TableSession, TableType, MenuItem } from '../../types';
import { formatVND, formatSecondsToTimer, calculateTableFee } from '../../services/calculation';

export const TableMapView: React.FC = () => {
  const {
    tables,
    customers,
    staff,
    menu,
    pricingRules,
    settings,
    currentStaff,
    isAdmin,
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
    updateTable,
    deleteTable,
    addToast,
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

  // Admin Table Edit/Add Modal
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [tableForm, setTableForm] = useState({
    code: '',
    name: '',
    type: 'POOL' as TableType,
    hourlyRate: 60000,
    area: 'Khu Sảnh Lỗ',
    notes: '',
  });

  const handleOpenAddTable = () => {
    setEditingTable(null);
    const nextIdx = tables.length + 1;
    const padded = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
    setTableForm({
      code: `Bàn ${padded}`,
      name: 'Bàn Bida Tiêu Chuẩn',
      type: 'POOL',
      hourlyRate: 60000,
      area: 'Khu Sảnh Lỗ',
      notes: '',
    });
    setIsTableModalOpen(true);
  };

  const handleOpenEditTable = (tbl: TableItem) => {
    setEditingTable(tbl);
    setTableForm({
      code: tbl.code,
      name: tbl.name,
      type: tbl.type,
      hourlyRate: tbl.hourlyRate,
      area: tbl.area,
      notes: tbl.notes || '',
    });
    setIsTableModalOpen(true);
  };

  const handleDeleteTable = (tbl: TableItem) => {
    if (tbl.status === 'PLAYING' || tbl.status === 'WAITING_PAYMENT') {
      addToast('error', 'Không thể xóa', `Bàn ${tbl.code} đang có khách chơi. Vui lòng thanh toán trước.`);
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa "${tbl.code} - ${tbl.name}"?`)) {
      deleteTable(tbl.id);
      addToast('info', 'Đã xóa bàn', `Đã xóa ${tbl.code} khỏi hệ thống.`);
    }
  };

  const handleQuickAddTable = () => {
    const nextIdx = tables.length + 1;
    const padded = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
    addTable({
      code: `Bàn ${padded}`,
      name: 'Bàn Bida Tiêu Chuẩn',
      type: 'POOL',
      hourlyRate: 60000,
      area: 'Khu Sảnh Lỗ',
      notes: '',
    });
    addToast('success', 'Thêm bàn thành công', `Đã tạo Bàn ${padded}`);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.code || !tableForm.name) return;

    if (editingTable) {
      updateTable({
        ...editingTable,
        code: tableForm.code,
        name: tableForm.name,
        type: tableForm.type,
        hourlyRate: tableForm.hourlyRate,
        area: tableForm.area,
        notes: tableForm.notes,
      });
      addToast('success', 'Đã lưu thay đổi', `Đã cập nhật ${tableForm.code}`);
    } else {
      addTable(tableForm);
      addToast('success', 'Thêm bàn thành công', `Đã tạo ${tableForm.code}`);
    }
    setIsTableModalOpen(false);
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
  const activePlayingTables = tables.filter((t) => t.status === 'PLAYING' || t.status === 'WAITING_PAYMENT');

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];
  const selectedSession = selectedTable ? getActiveSessionForTable(selectedTable.id) : undefined;
  const selectedPricingRule = selectedTable ? pricingRules.find((r) => r.type === selectedTable.type) : undefined;
  const selectedCustomer = selectedSession?.customerId
    ? customers.find((c) => c.id === selectedSession.customerId)
    : undefined;

  const handleConfirmOrder = (
    tableId: string,
    itemsToAdd: { item: MenuItem; quantity: number; notes?: string }[]
  ) => {
    itemsToAdd.forEach(({ item, quantity, notes }) => {
      addOrderToTable(tableId, item, quantity, notes);
    });
    setActiveOrderModalTable(null);
  };

  const handleSelectTable = (tbl: TableItem) => {
    setSelectedTableId(tbl.id);
  };

  return (
    <div className="flex-1 h-full flex flex-col lg:flex-row overflow-hidden w-full select-none font-sans">
      {/* Left Column: Tables Grid, Filters & Bar */}
      <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Sơ đồ bàn
              </h1>
              <span className="text-xs text-slate-400 font-medium">
                {tables.length} bàn ({playingCount} đang chơi, {availableCount} trống)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi thời gian chơi và gọi món thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* View mode toggle */}
            <div className="flex items-center bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'GRID' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lưới
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'LIST' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Danh sách
              </button>
            </div>

            {/* Admin Add Table Actions */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleQuickAddTable}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-medium transition-colors"
                  title="Thêm nhanh 1 bàn tiếp theo"
                >
                  + Tạo nhanh
                </button>
                <button
                  onClick={handleOpenAddTable}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
                  title="Thêm bàn mới với thông tin chi tiết"
                >
                  + Thêm bàn
                </button>
              </div>
            )}

            {availableTables.length > 0 && !isAdmin && (
              <button
                onClick={() => setActiveOpenModalTable(availableTables[0])}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                + Mở bàn
              </button>
            )}

            {/* Mobile trigger to view panel */}
            <button
              onClick={() => setIsMobilePanelOpen(true)}
              className="lg:hidden px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium"
            >
              Điều khiển
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
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
                className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Chips & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900/60 p-0.5 rounded-full border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('PLAYING')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === 'PLAYING'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đang chơi ({playingCount})
              </button>
              <button
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === 'AVAILABLE'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Trống ({availableCount})
              </button>
              {waitingCount > 0 && (
                <button
                  onClick={() => setStatusFilter('WAITING_PAYMENT')}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    statusFilter === 'WAITING_PAYMENT'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chờ ({waitingCount})
                </button>
              )}
            </div>

            <div className="w-36 sm:w-48">
              <input
                type="text"
                placeholder="Tìm mã hoặc tên bàn..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Grid or List View Mode */}
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
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
                  isAdmin={isAdmin}
                  onEditTable={handleOpenEditTable}
                  onDeleteTable={handleDeleteTable}
                  onSelectTable={(tbl) => {
                    handleSelectTable(tbl);
                    if (window.innerWidth < 1024) {
                      setIsMobilePanelOpen(true);
                    }
                  }}
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
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden mb-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                    <th className="py-3 px-4">Bàn</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Khu vực</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Món gọi</th>
                    <th className="py-3 px-4">Tạm tính</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTables.map((tbl) => {
                    const sess = getActiveSessionForTable(tbl.id);
                    const rule = pricingRules.find((r) => r.type === tbl.type);
                    const fee = sess ? calculateTableFee(sess, rule, currentTime) : null;
                    const isSelected = selectedTableId === tbl.id;

                    return (
                      <tr
                        key={tbl.id}
                        onClick={() => {
                          handleSelectTable(tbl);
                          if (window.innerWidth < 1024) {
                            setIsMobilePanelOpen(true);
                          }
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-800/80 text-white font-medium' : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-white">
                          {tbl.code}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{tbl.type}</td>
                        <td className="py-3 px-4 text-slate-400">{tbl.area}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            tbl.status === 'PLAYING'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : tbl.status === 'AVAILABLE'
                              ? 'bg-slate-800 text-slate-400'
                              : tbl.status === 'WAITING_PAYMENT'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-slate-800/60 text-slate-500'
                          }`}>
                            {tbl.status === 'PLAYING' ? 'Đang chơi' : tbl.status === 'AVAILABLE' ? 'Bàn trống' : tbl.status === 'WAITING_PAYMENT' ? 'Chờ tính' : 'Bảo trì'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {sess?.customerName || (tbl.status === 'PLAYING' ? 'Khách lẻ' : '---')}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {sess?.orders?.length || 0}
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-300">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEditTable(tbl)}
                                  className="px-2 py-1 rounded-md text-amber-300 hover:text-amber-200 hover:bg-slate-800 text-xs font-medium transition-colors"
                                  title="Sửa thông tin bàn"
                                >
                                  Sửa
                                </button>
                                {tbl.status === 'AVAILABLE' && (
                                  <button
                                    onClick={() => handleDeleteTable(tbl)}
                                    className="px-2 py-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs font-medium transition-colors"
                                    title="Xóa bàn"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </>
                            )}
                            {tbl.status === 'AVAILABLE' ? (
                              <button
                                onClick={() => {
                                  handleSelectTable(tbl);
                                  setActiveOpenModalTable(tbl);
                                }}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                              >
                                Mở bàn
                              </button>
                            ) : sess ? (
                              <button
                                onClick={() => {
                                  handleSelectTable(tbl);
                                  setActiveCheckoutData({ table: tbl, session: sess });
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors"
                              >
                                Thanh toán
                              </button>
                            ) : null}
                          </div>
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

      {/* Right Column: Stationary Inspector Panel on Desktop */}
      <div className="hidden lg:flex w-96 xl:w-[410px] shrink-0 border-l border-slate-800/80 bg-[#0e121b] h-full flex-col overflow-hidden">
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
          onEditTable={handleOpenEditTable}
        />
      </div>

      {/* Mobile Drawer (Only on screens < 1024px) */}
      {isMobilePanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e121b] border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 bg-slate-900/90 flex items-center justify-between border-b border-slate-800">
              <span className="text-sm font-semibold text-white">
                Điều khiển • {selectedTable?.code}
              </span>
              <button
                onClick={() => setIsMobilePanelOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:text-white"
              >
                Đóng
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
                onEditTable={(tbl) => {
                  setIsMobilePanelOpen(false);
                  handleOpenEditTable(tbl);
                }}
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

      {/* Modal: Thêm / Sửa Bàn (Admin) */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
          <div className="w-full max-w-md rounded-2xl bg-[#111520] border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTable ? `Sửa thông tin ${editingTable.code}` : 'Thêm bàn mới cho quán'}
              </h3>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Mã bàn:</label>
                  <input
                    type="text"
                    required
                    placeholder="Bàn 01, VIP 02..."
                    value={tableForm.code}
                    onChange={(e) => setTableForm({ ...tableForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Loại bàn:</label>
                  <select
                    value={tableForm.type}
                    onChange={(e) => {
                      const newType = e.target.value as TableType;
                      const matchedRule = pricingRules.find((r) => r.type === newType);
                      setTableForm({
                        ...tableForm,
                        type: newType,
                        hourlyRate: matchedRule ? matchedRule.defaultHourlyRate : tableForm.hourlyRate,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-700 font-medium"
                  >
                    <option value="POOL">Bàn Lỗ (Pool)</option>
                    <option value="CAROM">Carom (Pháp / 3C)</option>
                    <option value="VIP">Phòng VIP</option>
                    <option value="SNOOKER">Snooker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tên thương hiệu / Model:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Aileex 9020 Silver, Hollywood Pro..."
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá theo giờ (VNĐ):</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={tableForm.hourlyRate}
                    onChange={(e) => setTableForm({ ...tableForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-semibold focus:outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Khu vực / Tầng:</label>
                  <input
                    type="text"
                    required
                    placeholder="Sảnh chính, Lầu 1, Khu VIP..."
                    value={tableForm.area}
                    onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Vải mới thay, cơ mới..."
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-slate-700 placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 mt-1">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm"
                >
                  {editingTable ? 'Lưu thay đổi' : 'Thêm bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
