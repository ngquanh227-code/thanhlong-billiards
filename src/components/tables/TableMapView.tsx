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
      addToast('error', 'Không thể xóa', `Bàn ${tbl.code} đang có phiên chơi hoạt động! Vui lòng thanh toán trước.`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${tbl.code} - ${tbl.name}" khỏi hệ thống quán?`)) {
      deleteTable(tbl.id);
      addToast('info', 'Đã xóa bàn', `Đã xóa ${tbl.code} khỏi danh sách bàn của quán.`);
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
      notes: 'Bàn mới thêm',
    });
    addToast('success', 'Đã thêm bàn mới', `Đã tự động tạo Bàn ${padded} vào hệ thống!`);
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
      addToast('success', 'Cập nhật thành công', `Đã lưu thay đổi cho ${tableForm.code}`);
    } else {
      addTable(tableForm);
      addToast('success', 'Thêm bàn thành công', `Đã tạo ${tableForm.code} vào hệ thống`);
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
    <div className="flex-1 h-full flex flex-col lg:flex-row overflow-hidden w-full select-none">
      {/* Left Column: Tables Grid, Filters & Bar */}
      <div className="flex-1 h-full overflow-y-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-3.5">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
                SƠ ĐỒ BÀN
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
                {tables.length} BÀN
              </span>
              {isAdmin && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  [CHẾ ĐỘ ADMIN: BẬT SỬA BÀN]
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              <span className="text-emerald-400 font-bold">{playingCount} ĐANG CHƠI</span> • <span className="text-slate-300">{availableCount} TRỐNG</span>
              {waitingCount > 0 && <span className="text-amber-400 font-bold"> • {waitingCount} CHỜ TÍNH</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {/* View mode toggle */}
            <div className="flex items-center bg-charcoal-850 p-1 rounded-lg border border-charcoal-750">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                  viewMode === 'GRID' ? 'bg-charcoal-750 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                LƯỚI
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                  viewMode === 'LIST' ? 'bg-charcoal-750 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                DS
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddTable}
                className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-charcoal-700 font-bold text-xs transition-colors"
                title="Thêm bàn mới cho quán"
              >
                + BÀN
              </button>
            )}

            {availableTables.length > 0 && (
              <button
                onClick={() => setActiveOpenModalTable(availableTables[0])}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors"
              >
                + MỞ BÀN
              </button>
            )}

            {/* Mobile trigger to view panel */}
            <button
              onClick={() => setIsMobilePanelOpen(true)}
              className="lg:hidden px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 text-xs font-bold"
            >
              ĐIỀU KHIỂN
            </button>
          </div>
        </div>

        {/* Admin Quick Operations Bar (Chỉ hiển thị khi là Admin) */}
        {isAdmin && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-charcoal-950 font-black text-[11px]">
                [ADMIN: CHỈNH SỬA BÀN]
              </span>
              <span className="text-slate-300">
                Tổng <strong className="text-amber-400 font-bold">{tables.length} bàn</strong> • Bạn có thể bấm <strong className="text-amber-300">[SỬA BÀN]</strong> trên từng bàn để đổi tên, giá giờ, loại bàn hoặc thêm/xóa bàn.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickAddTable}
                className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-charcoal-700 hover:border-gold-500/40 font-bold text-xs transition-colors"
                title="Tự động thêm ngay 1 bàn tiếp theo theo thứ tự"
              >
                +1 TĂNG BÀN NHANH
              </button>
              <button
                onClick={handleOpenAddTable}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black text-xs transition-colors"
                title="Thêm bàn mới với thông tin chi tiết"
              >
                + THÊM BÀN CHI TIẾT
              </button>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar font-mono text-[11px]">
            {[
              { id: 'ALL', label: `TẤT CẢ (${tables.length})` },
              { id: 'POOL', label: `LỖ (${tables.filter((t) => t.type === 'POOL').length})` },
              { id: 'CAROM', label: `CAROM (${tables.filter((t) => t.type === 'CAROM').length})` },
              { id: 'VIP', label: `VIP (${tables.filter((t) => t.type === 'VIP').length})` },
              { id: 'SNOOKER', label: `SNOOKER (${tables.filter((t) => t.type === 'SNOOKER').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-charcoal-750 text-white border border-charcoal-600'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Chips & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-charcoal-850 p-1 rounded-lg border border-charcoal-750 font-mono text-[11px]">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-1 rounded transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-charcoal-750 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TẤT CẢ
              </button>
              <button
                onClick={() => setStatusFilter('PLAYING')}
                className={`px-2 py-1 rounded transition-colors ${
                  statusFilter === 'PLAYING'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CHƠI ({playingCount})
              </button>
              <button
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-2 py-1 rounded transition-colors ${
                  statusFilter === 'AVAILABLE'
                    ? 'bg-charcoal-750 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TRỐNG ({availableCount})
              </button>
              {waitingCount > 0 && (
                <button
                  onClick={() => setStatusFilter('WAITING_PAYMENT')}
                  className={`px-2 py-1 rounded transition-colors ${
                    statusFilter === 'WAITING_PAYMENT'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CHỜ ({waitingCount})
                </button>
              )}
            </div>

            <div className="w-36 sm:w-44">
              <input
                type="text"
                placeholder="Tìm mã bàn..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-charcoal-850 border border-charcoal-750 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Grid or List View Mode */}
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
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
                    // On mobile screens, tapping a card immediately opens control panel
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
          <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">BÀN</th>
                    <th className="py-2.5 px-3">LOẠI</th>
                    <th className="py-2.5 px-3">KHU VỰC</th>
                    <th className="py-2.5 px-3">TRẠNG THÁI</th>
                    <th className="py-2.5 px-3">KHÁCH HÀNG</th>
                    <th className="py-2.5 px-3">THỜI GIAN</th>
                    <th className="py-2.5 px-3">MÓN</th>
                    <th className="py-2.5 px-3">TẠM TÍNH</th>
                    <th className="py-2.5 px-3 text-right">THAO TÁC</th>
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
                        onClick={() => {
                          handleSelectTable(tbl);
                          if (window.innerWidth < 1024) {
                            setIsMobilePanelOpen(true);
                          }
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-charcoal-750 text-white font-medium' : 'hover:bg-charcoal-800'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-gold-400 inline-block" />}
                          {tbl.code}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{tbl.type}</td>
                        <td className="py-3 px-3 text-slate-400 font-sans">{tbl.area}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tbl.status === 'PLAYING'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tbl.status === 'AVAILABLE'
                              ? 'bg-charcoal-800 text-slate-400 border border-charcoal-700'
                              : tbl.status === 'WAITING_PAYMENT'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-charcoal-900 text-slate-500'
                          }`}>
                            {tbl.status === 'PLAYING' ? '● CHƠI' : tbl.status === 'AVAILABLE' ? '○ TRỐNG' : tbl.status === 'WAITING_PAYMENT' ? '▲ CHỜ' : '× BẢO TRÌ'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200 font-sans">
                          {sess?.customerName || (tbl.status === 'PLAYING' ? 'Khách lẻ' : '---')}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {sess?.orders?.length || 0}
                        </td>
                        <td className="py-3 px-3 font-bold text-gold-400">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEditTable(tbl)}
                                  className="px-2 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors"
                                  title="Chỉnh sửa thông tin bàn"
                                >
                                  SỬA
                                </button>
                                {tbl.status === 'AVAILABLE' && (
                                  <button
                                    onClick={() => handleDeleteTable(tbl)}
                                    className="px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-rose-950/70 text-slate-400 hover:text-rose-400 border border-charcoal-700 text-[11px] font-bold transition-colors"
                                    title="Xóa bàn"
                                  >
                                    XÓA
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
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                              >
                                MỞ
                              </button>
                            ) : sess ? (
                              <button
                                onClick={() => {
                                  handleSelectTable(tbl);
                                  setActiveCheckoutData({ table: tbl, session: sess });
                                }}
                                className="px-2.5 py-1 rounded bg-gold-500 hover:bg-amber-400 text-charcoal-950 font-bold text-xs"
                              >
                                TÍNH TIỀN
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
          onEditTable={handleOpenEditTable}
        />
      </div>

      {/* Mobile Drawer (Only on screens < 1024px) */}
      {isMobilePanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b0f17] border-t border-charcoal-750 rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 bg-charcoal-850 flex items-center justify-between border-b border-charcoal-750">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                ĐIỀU KHIỂN • {selectedTable?.code}
              </span>
              <button
                onClick={() => setIsMobilePanelOpen(false)}
                className="px-2.5 py-1 rounded bg-charcoal-800 text-slate-300 font-mono text-xs font-bold hover:text-white"
              >
                ✕ ĐÓNG
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
                  [ADMIN]
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {editingTable ? `SỬA THÔNG TIN: ${editingTable.code}` : 'THÊM BÀN MỚI CHO QUÁN'}
                </h3>
              </div>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 font-mono text-xs font-bold rounded-lg hover:bg-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-mono font-bold block mb-1">Mã bàn:</label>
                  <input
                    type="text"
                    required
                    placeholder="Bàn 01, VIP 02..."
                    value={tableForm.code}
                    onChange={(e) => setTableForm({ ...tableForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono font-bold focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-mono font-bold block mb-1">Loại bàn:</label>
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
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600 font-medium"
                  >
                    <option value="POOL">Pool (Bàn Lỗ)</option>
                    <option value="CAROM">Carom (Pháp / 3C)</option>
                    <option value="VIP">VIP (Phòng Riêng)</option>
                    <option value="SNOOKER">Snooker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-mono font-bold block mb-1">Tên thương hiệu / Model bàn:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Aileex 9020 Silver, Hollywood Pro..."
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-mono font-bold block mb-1">Giá theo giờ (VNĐ):</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={tableForm.hourlyRate}
                    onChange={(e) => setTableForm({ ...tableForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-black focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-mono font-bold block mb-1">Khu vực / Tầng:</label>
                  <input
                    type="text"
                    required
                    placeholder="Khu Sảnh Lỗ, Lầu 1, VIP..."
                    value={tableForm.area}
                    onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-mono font-bold block mb-1">Ghi chú (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Vải Simonis mới thay, cơ Fury..."
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-750 mt-1 font-mono">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-colors"
                >
                  {editingTable ? 'LƯU THAY ĐỔI' : '+ TẠO BÀN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
