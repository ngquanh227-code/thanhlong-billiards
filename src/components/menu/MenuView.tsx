import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { formatVND } from '../../services/calculation';

export const MenuView: React.FC = () => {
  const { menu, addMenuItem, updateMenuItem, importStock, isAdmin } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedItemToImport, setSelectedItemToImport] = useState<MenuItem | null>(null);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'BEER' as MenuItem['category'],
    price: 25000,
    costPrice: 15000,
    unit: 'Lon',
    stock: 24,
    minStockAlert: 10,
    isAvailable: true,
  });

  // Import form state
  const [importQty, setImportQty] = useState<number>(24);
  const [importUnitCost, setImportUnitCost] = useState<number>(0);
  const [supplierNotes, setSupplierNotes] = useState<string>('');

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

  const filteredItems = menu.filter((item) => {
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.price <= 0) return;
    addMenuItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      name: '',
      category: 'BEER',
      price: 25000,
      costPrice: 15000,
      unit: 'Lon',
      stock: 24,
      minStockAlert: 10,
      isAvailable: true,
    });
  };

  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToImport || importQty <= 0) return;
    importStock(
      selectedItemToImport.id,
      importQty,
      importUnitCost || selectedItemToImport.costPrice,
      supplierNotes
    );
    setIsImportModalOpen(false);
    setSelectedItemToImport(null);
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            MENU & DỊCH VỤ ĂN UỐNG
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Danh mục {menu.length} món • Tự động trừ tồn kho và tính doanh thu
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono transition-colors tracking-wider"
          >
            + THÊM MÓN MỚI
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 font-mono">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-charcoal-700 text-white border border-charcoal-600'
                  : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm theo tên món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-charcoal-850 border border-charcoal-750 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredItems.map((item) => {
          const isLowStock = item.stock <= item.minStockAlert;
          const profitMargin = item.price - item.costPrice;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between hover:border-charcoal-600 transition-colors font-mono"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-white line-clamp-1 font-sans">{item.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400 font-bold border border-charcoal-700">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-base font-black text-gold-400">
                    {formatVND(item.price)}
                  </span>
                  <span className="text-xs text-slate-400">/{item.unit}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex flex-col gap-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>GIÁ VỐN:</span>
                    <span className="text-slate-300">{formatVND(item.costPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>LÃI GỘP:</span>
                    <span className="text-emerald-400 font-bold">+{formatVND(profitMargin)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-charcoal-800 text-[11px]">
                    <span className="text-slate-400">TỒN KHO:</span>
                    <span className={`font-bold ${
                      isLowStock ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {isLowStock ? `[CẢNH BÁO: ${item.stock} ${item.unit}]` : `${item.stock} ${item.unit}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-2.5 border-t border-charcoal-800 flex gap-1.5">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedItemToImport(item);
                        setImportUnitCost(item.costPrice);
                        setIsImportModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-bold transition-colors"
                    >
                      NHẬP KHO
                    </button>

                    <button
                      onClick={() => {
                        const newPrice = prompt(`Nhập giá bán mới cho ${item.name}:`, item.price.toString());
                        if (newPrice && !isNaN(Number(newPrice))) {
                          updateMenuItem({ ...item, price: Number(newPrice) });
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-charcoal-700 text-xs font-bold transition-colors"
                      title="Sửa giá bán"
                    >
                      SỬA GIÁ
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-1 text-[11px] text-slate-400 font-mono">
                    {item.isAvailable ? 'SẴN SÀNG PHỤC VỤ' : 'TẠM HẾT HÀNG'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Thêm Món Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-mono">
                THÊM MÓN VÀO MENU
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 font-mono text-xs font-bold rounded-lg hover:bg-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-300 font-bold block mb-1">TÊN MÓN / THỨC UỐNG:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bia Corona Extra, Mì bò trứng..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">DANH MỤC:</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="BEER">BIA</option>
                    <option value="SOFT_DRINK">NƯỚC NGỌT</option>
                    <option value="WATER">NƯỚC SUỐI</option>
                    <option value="COFFEE">CÀ PHÊ</option>
                    <option value="SNACK">ĂN VẶT</option>
                    <option value="FAST_FOOD">MÌ & CƠM</option>
                    <option value="OTHER">KHÁC</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">ĐƠN VỊ TÍNH:</label>
                  <input
                    type="text"
                    required
                    placeholder="Lon, Chai, Dĩa..."
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">GIÁ BÁN (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-black focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">GIÁ VỐN (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newItem.costPrice}
                    onChange={(e) => setNewItem({ ...newItem, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-slate-300 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">TỒN BAN ĐẦU:</label>
                  <input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">BÁO HẾT HÀNG KHI:</label>
                  <input
                    type="number"
                    value={newItem.minStockAlert}
                    onChange={(e) => setNewItem({ ...newItem, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-750 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-colors"
                >
                  LƯU MÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nhập Kho */}
      {isImportModalOpen && selectedItemToImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  NHẬP KHO: {selectedItemToImport.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tồn kho hiện tại: {selectedItemToImport.stock} {selectedItemToImport.unit}
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-bold rounded-lg hover:bg-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  SỐ LƯỢNG NHẬP ({selectedItemToImport.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={importQty}
                  onChange={(e) => setImportQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">ĐƠN GIÁ NHẬP (VNĐ):</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={importUnitCost}
                  onChange={(e) => setImportUnitCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-black focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">NHÀ CUNG CẤP / GHI CHÚ:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đại lý bia nước ngọt..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex justify-between items-center">
                <span className="text-slate-400 font-bold">TỔNG CHI PHÍ:</span>
                <span className="font-black text-rose-400 text-sm sm:text-base">
                  {formatVND(importQty * importUnitCost)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-750 mt-1">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-amber-400 text-charcoal-950 font-black transition-colors"
                >
                  XÁC NHẬN NHẬP KHO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
