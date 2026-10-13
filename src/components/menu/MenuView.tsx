import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { formatVND } from '../../services/calculation';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Package,
  AlertTriangle,
  X,
} from 'lucide-react';

export const MenuView: React.FC = () => {
  const { menu, addMenuItem, updateMenuItem, importStock } = useApp();

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
    { id: 'ALL', label: 'Tất Cả' },
    { id: 'BEER', label: 'Bia' },
    { id: 'SOFT_DRINK', label: 'Nước Ngọt' },
    { id: 'WATER', label: 'Nước Suối' },
    { id: 'COFFEE', label: 'Cà Phê' },
    { id: 'SNACK', label: 'Món Ăn Vặt' },
    { id: 'FAST_FOOD', label: 'Mì & Cơm' },
    { id: 'OTHER', label: 'Khác' },
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
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Menu & Đồ Ăn Uống (F&B)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Danh mục {menu.length} món • Tự động trừ tồn kho và tính doanh thu
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món mới</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-charcoal-700 text-white font-semibold'
                  : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-750'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-charcoal-850 border border-charcoal-750 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
          />
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredItems.map((item) => {
          const isLowStock = item.stock <= item.minStockAlert;
          const profitMargin = item.price - item.costPrice;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between hover:border-charcoal-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold text-white line-clamp-1">{item.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-400 font-medium">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-base font-bold text-gold-400 font-mono">
                    {formatVND(item.price)}
                  </span>
                  <span className="text-xs text-slate-400">/{item.unit}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex flex-col gap-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Giá vốn:</span>
                    <span className="font-mono text-slate-300">{formatVND(item.costPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Lãi gộp:</span>
                    <span className="font-mono text-emerald-400 font-medium">+{formatVND(profitMargin)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-charcoal-800 text-[11px]">
                    <span className="text-slate-400">Tồn kho:</span>
                    <span className={`font-mono font-medium flex items-center gap-1 ${
                      isLowStock ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {item.stock} {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-2.5 border-t border-charcoal-800 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedItemToImport(item);
                    setImportUnitCost(item.costPrice);
                    setIsImportModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nhập Kho</span>
                </button>

                <button
                  onClick={() => {
                    const newPrice = prompt(`Nhập giá bán mới cho ${item.name}:`, item.price.toString());
                    if (newPrice && !isNaN(Number(newPrice))) {
                      updateMenuItem({ ...item, price: Number(newPrice) });
                    }
                  }}
                  className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-400 hover:text-white border border-charcoal-700 transition-colors"
                  title="Sửa giá bán"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Thêm Món Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">Thêm Món Vào Menu</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Tên món / Thức uống:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bia Corona Extra, Mì bò trứng..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Danh mục:</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  >
                    <option value="BEER">Bia</option>
                    <option value="SOFT_DRINK">Nước Ngọt</option>
                    <option value="WATER">Nước Suối</option>
                    <option value="COFFEE">Cà Phê</option>
                    <option value="SNACK">Món Ăn Vặt</option>
                    <option value="FAST_FOOD">Mì & Cơm</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    required
                    placeholder="Lon, Chai, Dĩa..."
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá bán niêm yết (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá vốn nhập (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newItem.costPrice}
                    onChange={(e) => setNewItem({ ...newItem, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-slate-300 font-mono focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Số lượng tồn ban đầu:</label>
                  <input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Mức cảnh báo hết hàng:</label>
                  <input
                    type="number"
                    value={newItem.minStockAlert}
                    onChange={(e) => setNewItem({ ...newItem, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Lưu Món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nhập Kho */}
      {isImportModalOpen && selectedItemToImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Nhập Kho: {selectedItemToImport.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tồn kho hiện tại: {selectedItemToImport.stock} {selectedItemToImport.unit}
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Số lượng nhập thêm ({selectedItemToImport.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={importQty}
                  onChange={(e) => setImportQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono font-medium focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Đơn giá nhập (VNĐ):</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={importUnitCost}
                  onChange={(e) => setImportUnitCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Nhà cung cấp / Ghi chú:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đại lý bia nước ngọt..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="p-3 rounded-lg bg-charcoal-850 border border-charcoal-750 flex justify-between">
                <span className="text-slate-400">Tổng chi phí nhập:</span>
                <span className="font-mono font-semibold text-rose-400 text-sm">
                  {formatVND(importQty * importUnitCost)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold transition-colors"
                >
                  Xác Nhận Nhập Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
