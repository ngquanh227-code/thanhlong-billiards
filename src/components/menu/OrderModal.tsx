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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0c1018] border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-charcoal-750 bg-charcoal-850">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              {table.code}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-mono">
                GỌI MÓN (F&B ORDER)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {table.name} • {session?.customerName || 'Khách vãng lai'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 font-mono text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Content: 2-Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: Menu Catalog */}
          <div className="flex-1 flex flex-col p-3.5 sm:p-4 border-b md:border-b-0 md:border-r border-charcoal-750 overflow-hidden">
            {/* Search & Filter */}
            <div className="flex flex-col gap-2 mb-3">
              <input
                type="text"
                placeholder="Tìm món, đồ uống, bia, đồ ăn nhẹ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono"
              />

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-charcoal-700 text-white border border-charcoal-600'
                        : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredMenu.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const draftCount = orderDraft[item.id]?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && handleAddItem(item)}
                    className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-charcoal-950/50 border-charcoal-800 opacity-50 cursor-not-allowed'
                        : draftCount > 0
                        ? 'bg-charcoal-800/90 border-amber-500/60 shadow-inner'
                        : 'bg-charcoal-850 hover:bg-charcoal-800 border-charcoal-750 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white line-clamp-1">{item.name}</span>
                        {draftCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-charcoal-950 text-[10px] font-mono font-black">
                            x{draftCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-black text-gold-400">
                        {formatVND(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-750/50 text-[10px] font-mono">
                      <span className={item.stock <= item.minStockAlert ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {isOutOfStock ? '[HẾT HÀNG]' : `CÒN: ${item.stock} ${item.unit}`}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="px-2 py-0.5 rounded bg-charcoal-800 text-gold-400 font-black hover:bg-gold-500 hover:text-charcoal-950 transition-colors border border-charcoal-700"
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
          <div className="w-full md:w-80 flex flex-col bg-charcoal-850/80 p-3.5 sm:p-4 justify-between overflow-hidden font-mono">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                <span>MÓN CHỌN MỚI ({draftList.length})</span>
                {draftTotal > 0 && (
                  <span className="text-gold-400 font-black">{formatVND(draftTotal)}</span>
                )}
              </div>

              {/* Draft List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {draftList.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-charcoal-700 rounded-xl p-3 text-center font-mono">
                    <span>Chưa chọn món mới nào. Nhấp vào các món bên trái để thêm vào bàn.</span>
                  </div>
                ) : (
                  draftList.map(({ item, quantity, notes }) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[140px] font-sans">
                          {item.name}
                        </span>
                        <span className="text-xs font-black text-gold-400">
                          {formatVND(item.price * quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Ghi chú (ít đá...)"
                          value={notes}
                          onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                          className="text-[11px] px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-700 text-slate-200 placeholder-slate-600 w-28 focus:outline-none focus:border-amber-500 font-sans"
                        />

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDecreaseItem(item.id)}
                            className="w-5 h-5 rounded bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-slate-200 font-black"
                          >
                            −
                          </button>
                          <span className="text-xs font-black text-white px-1">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-5 h-5 rounded bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-slate-200 font-black"
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
                  <div className="mt-3.5 pt-3 border-t border-charcoal-750">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      ĐÃ GỌI TRƯỚC ĐÓ ({session.orders.length} MÓN)
                    </h5>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {session.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-charcoal-900/60 border border-charcoal-800 text-xs"
                        >
                          <div className="flex-1 truncate pr-2">
                            <span className="font-semibold text-slate-300 font-sans">{ord.name}</span>
                            <div className="text-[10px] text-slate-400">
                              {ord.quantity} {ord.unit} × {formatVND(ord.price)}
                              {ord.notes && <span className="text-amber-400 ml-1 font-sans">({ord.notes})</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-300">
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
            <div className="pt-3 border-t border-charcoal-750 mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">TIỀN MÓN MỚI:</span>
                <span className="font-black text-gold-400 text-sm">
                  {formatVND(draftTotal)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
                >
                  ĐÓNG
                </button>
                <button
                  type="button"
                  disabled={draftList.length === 0}
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gold-500 hover:bg-amber-400 disabled:opacity-40 text-charcoal-950 font-black text-xs transition-colors"
                >
                  ✓ XÁC NHẬN ({draftList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
