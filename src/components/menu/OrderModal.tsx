import React, { useState } from 'react';
import { TableItem, MenuItem, TableSession } from '../../types';
import { formatVND } from '../../services/calculation';

interface OrderModalProps {
  table: TableItem | null;
  session?: TableSession;
  menu: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (tableId: string, itemsToAdd: { item: MenuItem; quantity: number; notes?: string }[]) => void;
  onRemoveExistingOrder?: (tableId: string, orderItemId: string) => void;
  onUpdateExistingQty?: (tableId: string, orderItemId: string, delta: number) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  table,
  session,
  menu,
  isOpen,
  onClose,
  onConfirmOrder,
  onRemoveExistingOrder,
}) => {
  if (!isOpen || !table) return null;

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderDraft, setOrderDraft] = useState<{ [menuId: string]: { item: MenuItem; quantity: number; notes: string } }>({});

  const categories = [
    { id: 'ALL', label: 'TẤT CẢ' },
    { id: 'BEER', label: 'BIA' },
    { id: 'SOFT_DRINK', label: 'NƯỚC NGỌT' },
    { id: 'WATER', label: 'NƯỚC SUỐI' },
    { id: 'COFFEE', label: 'CÀ PHÊ' },
    { id: 'SNACK', label: 'ĂN VẶT' },
    { id: 'FAST_FOOD', label: 'MÌ & CƠM' },
    { id: 'OTHER', label: 'KHÁC' },
  ];

  const filteredMenu = menu.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddItem = (item: MenuItem) => {
    if (item.stock <= 0) return;
    setOrderDraft((prev) => {
      const current = prev[item.id];
      const newQty = current ? current.quantity + 1 : 1;
      if (newQty > item.stock) return prev;
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: newQty,
          notes: current?.notes || '',
        },
      };
    });
  };

  const handleDecreaseItem = (itemId: string) => {
    setOrderDraft((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...current, quantity: current.quantity - 1 },
      };
    });
  };

  const handleRemoveDraftItem = (itemId: string) => {
    setOrderDraft((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setOrderDraft((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      return {
        ...prev,
        [itemId]: { ...current, notes },
      };
    });
  };

  const draftList = Object.values(orderDraft);
  const draftTotal = draftList.reduce((sum, d) => sum + d.item.price * d.quantity, 0);

  const handleConfirm = () => {
    if (draftList.length === 0) return;
    onConfirmOrder(table.id, draftList);
    setOrderDraft({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700/60">
              {table.code}
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">
                Gọi món & Dịch vụ F&B
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {table.name} • {session?.customerName || 'Khách vãng lai'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 px-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Content: 2-Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: Menu Catalog */}
          <div className="flex-1 flex flex-col p-4 border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden">
            {/* Search & Filter */}
            <div className="flex flex-col gap-2.5 mb-3.5">
              <input
                type="text"
                placeholder="Tìm món, đồ uống, thức ăn nhẹ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {cat.label === 'ALL' ? 'Tất cả' :
                     cat.label === 'BEER' ? 'Bia' :
                     cat.label === 'SOFT_DRINK' ? 'Nước ngọt' :
                     cat.label === 'WATER' ? 'Nước suối' :
                     cat.label === 'COFFEE' ? 'Cà phê' :
                     cat.label === 'SNACK' ? 'Ăn vặt' :
                     cat.label === 'FAST_FOOD' ? 'Mì & Cơm' : 'Khác'}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMenu.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const draftCount = orderDraft[item.id]?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && handleAddItem(item)}
                    className={`relative p-3.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-40 cursor-not-allowed'
                        : draftCount > 0
                        ? 'bg-slate-800/90 border-amber-500/50 shadow-sm'
                        : 'bg-slate-850 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-white line-clamp-1">{item.name}</span>
                        {draftCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                            x{draftCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-amber-300">
                        {formatVND(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className={item.stock <= item.minStockAlert ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                        {isOutOfStock ? 'Hết hàng' : `Còn: ${item.stock} ${item.unit}`}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center transition-colors border border-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active & Draft Cart */}
          <div className="w-full md:w-80 flex flex-col bg-slate-900/60 p-4 justify-between overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
                <span>Món vừa chọn ({draftList.length})</span>
                {draftTotal > 0 && (
                  <span className="text-amber-300 font-bold">{formatVND(draftTotal)}</span>
                )}
              </div>

              {/* Draft List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {draftList.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl p-4 text-center">
                    <span>Chưa chọn món mới nào. Nhấp vào các món bên trái để thêm vào bàn.</span>
                  </div>
                ) : (
                  draftList.map(({ item, quantity, notes }) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-750 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-amber-300">
                          {formatVND(item.price * quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Ghi chú (ít đá...)"
                          value={notes}
                          onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 w-28 focus:outline-none focus:border-slate-500"
                        />

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDecreaseItem(item.id)}
                            className="w-5 h-5 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200 font-semibold"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold text-white px-1">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-5 h-5 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200 font-semibold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveDraftItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Already Ordered Items on Table */}
                {session && session.orders && session.orders.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800">
                    <h5 className="text-[11px] font-semibold text-slate-400 mb-2">
                      Đã phục vụ ({session.orders.length} món)
                    </h5>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {session.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs"
                        >
                          <div className="flex-1 truncate pr-2">
                            <span className="font-medium text-slate-200">{ord.name}</span>
                            <div className="text-[10px] text-slate-400">
                              {ord.quantity} {ord.unit} × {formatVND(ord.price)}
                              {ord.notes && <span className="text-amber-400 ml-1">({ord.notes})</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-300">
                              {formatVND(ord.price * ord.quantity)}
                            </span>
                            {onRemoveExistingOrder && (
                              <button
                                onClick={() => onRemoveExistingOrder(table.id, ord.id)}
                                className="text-slate-400 hover:text-rose-400 p-0.5 text-xs"
                                title="Hủy món đã gọi"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3.5 border-t border-slate-800 mt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tiền món chọn mới:</span>
                <span className="font-bold text-amber-300 text-sm">
                  {formatVND(draftTotal)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={draftList.length === 0}
                  onClick={handleConfirm}
                  className="flex-1 h-11 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
                >
                  Xác nhận gọi món ({draftList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
