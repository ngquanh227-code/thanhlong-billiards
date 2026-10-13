import React, { useState } from 'react';
import { TableItem, MenuItem, TableSession } from '../../types';
import { formatVND } from '../../services/calculation';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  Check,
  Package,
} from 'lucide-react';

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
  onUpdateExistingQty,
}) => {
  if (!isOpen || !table) return null;

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderDraft, setOrderDraft] = useState<{ [menuId: string]: { item: MenuItem; quantity: number; notes: string } }>({});

  const categories = [
    { id: 'ALL', label: 'Tất Cả' },
    { id: 'BEER', label: 'Bia' },
    { id: 'SOFT_DRINK', label: 'Nước Ngọt' },
    { id: 'WATER', label: 'Nước Suối' },
    { id: 'COFFEE', label: 'Cà Phê' },
    { id: 'SNACK', label: 'Món Ăn Vặt' },
    { id: 'FAST_FOOD', label: 'Mì & Cơm' },
    { id: 'OTHER', label: 'Khác' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700/80 bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                ORDER ĐỒ ĂN & NƯỚC UỐNG - {table.code}
              </h3>
              <p className="text-xs text-slate-400">
                {table.name} • {session?.customerName || 'Khách vãng lai'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: 2-Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: Menu Catalog */}
          <div className="flex-1 flex flex-col p-4 border-b md:border-b-0 md:border-r border-charcoal-700/80 overflow-hidden">
            {/* Search & Filter */}
            <div className="flex flex-col gap-2.5 mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm món, đồ uống, bia, đồ ăn nhẹ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-charcoal-700 text-white font-semibold'
                        : 'bg-charcoal-800 text-slate-400 hover:text-slate-200 border border-charcoal-750'
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
                        : 'bg-charcoal-850 hover:bg-charcoal-800 border-charcoal-700/70 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white line-clamp-1">{item.name}</span>
                        {draftCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-charcoal-950 text-[10px] font-black">
                            x{draftCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold text-gold-400">
                        {formatVND(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-700/50 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Còn: <b className={item.stock <= item.minStockAlert ? 'text-rose-400' : 'text-slate-200'}>{item.stock}</b> {item.unit}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="p-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-charcoal-950 transition-colors font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active & Draft Cart */}
          <div className="w-full md:w-80 flex flex-col bg-charcoal-850/80 p-4 justify-between overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                <span>Món Đang Chọn Mới ({draftList.length})</span>
                {draftTotal > 0 && (
                  <span className="text-gold-400 font-mono font-bold">{formatVND(draftTotal)}</span>
                )}
              </h4>

              {/* Draft List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {draftList.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-charcoal-700 rounded-xl p-3 text-center">
                    <span>Chưa chọn món mới nào. Nhấp vào các món bên trái để thêm vào bàn.</span>
                  </div>
                ) : (
                  draftList.map(({ item, quantity, notes }) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-gold-400">
                          {formatVND(item.price * quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Ghi chú (ít đá, mang nóng...)"
                          value={notes}
                          onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                          className="text-[11px] px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-700 text-slate-200 placeholder-slate-600 w-32 focus:outline-none focus:border-amber-500"
                        />

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDecreaseItem(item.id)}
                            className="w-5 h-5 rounded bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-slate-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-white px-1">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-5 h-5 rounded bg-charcoal-700 hover:bg-charcoal-600 flex items-center justify-center text-slate-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveDraftItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Already Ordered Items on Table */}
                {session && session.orders && session.orders.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-charcoal-700">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Đã Gọi Trước Đó ({session.orders.length} món)
                    </h5>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {session.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-charcoal-900/60 border border-charcoal-800 text-xs"
                        >
                          <div className="flex-1 truncate pr-2">
                            <span className="font-medium text-slate-300">{ord.name}</span>
                            <div className="text-[10px] text-slate-500">
                              {ord.quantity} {ord.unit} × {formatVND(ord.price)}
                              {ord.notes && <span className="text-amber-400 ml-1">({ord.notes})</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-300">
                              {formatVND(ord.price * ord.quantity)}
                            </span>
                            {onRemoveExistingOrder && (
                              <button
                                onClick={() => onRemoveExistingOrder(table.id, ord.id)}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                                title="Hủy món đã gọi"
                              >
                                <Trash2 className="w-3 h-3" />
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
            <div className="pt-3 border-t border-charcoal-700/80 mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tiền món thêm mới:</span>
                <span className="font-mono font-bold text-gold-400 text-sm">
                  {formatVND(draftTotal)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={draftList.length === 0}
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Xác Nhận Gọi ({draftList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
