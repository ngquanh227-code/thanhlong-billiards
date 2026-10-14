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
        {/* Top Header Controls */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight whitespace-nowrap">
                Sơ đồ bàn
              </h1>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700/50">
                {tables.length} bàn ({playingCount} đang chơi, {availableCount} trống)
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate">
              Theo dõi thời gian chơi và gọi món thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            {/* Admin Add Table Action */}
            {isAdmin && (
              <button
                onClick={handleOpenAddTable}
                className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
                title="Thêm bàn mới với thông tin chi tiết"
              >
                + Thêm bàn
              </button>
            )}

            {availableTables.length > 0 && !isAdmin && (
              <button
                onClick={() => setActiveOpenModalTable(availableTables[0])}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
              >
                + Mở bàn
              </button>
            )}

            {/* Mobile trigger to view panel */}
            <button
              onClick={() => setIsMobilePanelOpen(true)}
              className="lg:hidden h-10 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center active:scale-[0.98] whitespace-nowrap"
            >
              Bảng điều khiển
            </button>
          </div>
        </div>

        {/* Tables Grid Map */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
          {tables.map((table) => {
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
      </div>

      {/* Right Column: Stationary Inspector Panel on Desktop */}
      <div className="hidden lg:flex w-96 xl:w-[410px] shrink-0 border-l border-slate-800/80 bg-slate-900 h-full flex-col overflow-hidden">
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
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
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
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
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
