import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { formatVND } from '../../services/calculation';

export const MenuView: React.FC = () => {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, importStock, isAdmin } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

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
    if (!newItem.name.trim() || newItem.price <= 0) return;
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

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;
    updateMenuItem(editingItem);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteMenuItem(itemToDelete.id);
    setItemToDelete(null);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    if (!isAdmin) return;
    updateMenuItem({
      ...item,
      isAvailable: !item.isAvailable,
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

  // Profit calculations for Add/Edit modals
  const addProfit = newItem.price - newItem.costPrice;
  const addMarginPercent = newItem.price > 0 ? Math.round((addProfit / newItem.price) * 100) : 0;

  const editProfit = editingItem ? editingItem.price - editingItem.costPrice : 0;
  const editMarginPercent = editingItem && editingItem.price > 0
    ? Math.round((editProfit / editingItem.price) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none pb-24 lg:pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Thực đơn & Dịch vụ F&B
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý danh mục {menu.length} món • Thêm món, xóa món, sửa giá và nhập kho tồn
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
          >
            + Thêm món mới
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
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
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 font-sans"
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
              className={`p-4 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between ${
                !item.isAvailable
                  ? 'border-slate-800/60 opacity-70'
                  : 'border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-white line-clamp-1">
                    {item.name}
                  </span>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    disabled={!isAdmin}
                    title={isAdmin ? "Bấm để đổi trạng thái Còn bán / Hết hàng" : ""}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                      item.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {item.isAvailable ? 'Đang bán' : 'Tạm hết'}
                  </button>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-lg font-black text-amber-300">
                    {formatVND(item.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/{item.unit}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Giá vốn:</span>
                    <span className="text-slate-300 font-medium">{formatVND(item.costPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Lãi gộp:</span>
                    <span className="text-emerald-400 font-bold">+{formatVND(profitMargin)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Tồn kho:</span>
                    <span className={`font-semibold ${
                      isLowStock ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {isLowStock ? `Cảnh báo: ${item.stock} ${item.unit}` : `${item.stock} ${item.unit}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-1.5">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedItemToImport(item);
                        setImportUnitCost(item.costPrice);
                        setIsImportModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                      title="Nhập thêm hàng vào kho"
                    >
                      Nhập kho
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-semibold transition-colors"
                      title="Chỉnh sửa thông tin món"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-colors"
                      title="Xóa món khỏi thực đơn"
                    >
                      Xóa
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-1 text-xs text-slate-400">
                    {item.isAvailable ? 'Sẵn sàng phục vụ' : 'Tạm hết món'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Thêm Món Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Thêm món F&B mới
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tạo món đồ uống hoặc thức ăn nhanh cho quán
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1 text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Tên món / Thức uống:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bia Heineken Silver, Mì trứng xúc xích..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Danh mục:</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500 cursor-pointer"
                  >
                    <option value="BEER">Bia</option>
                    <option value="SOFT_DRINK">Nước ngọt</option>
                    <option value="WATER">Nước suối</option>
                    <option value="COFFEE">Cà phê</option>
                    <option value="SNACK">Ăn vặt</option>
                    <option value="FAST_FOOD">Mì & Cơm</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    required
                    placeholder="Lon, Chai, Dĩa, Ly, Gói..."
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá bán (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-slate-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Profit calculation insight */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-300">Lãi gộp dự kiến:</span>
                <span className="font-bold text-emerald-400">
                  +{formatVND(addProfit)} ({addMarginPercent}% doanh thu)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Số lượng tồn kho ban đầu:</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Cảnh báo khi dưới:</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.minStockAlert}
                    onChange={(e) => setNewItem({ ...newItem, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
                >
                  Lưu món mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sửa Món */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm select-none">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Chỉnh sửa món F&B
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mã món: {editingItem.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white px-2.5 py-1 text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Tên món:</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Danh mục:</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500 cursor-pointer"
                  >
                    <option value="BEER">Bia</option>
                    <option value="SOFT_DRINK">Nước ngọt</option>
                    <option value="WATER">Nước suối</option>
                    <option value="COFFEE">Cà phê</option>
                    <option value="SNACK">Ăn vặt</option>
                    <option value="FAST_FOOD">Mì & Cơm</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá bán (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giá vốn (VNĐ):</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={editingItem.costPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, costPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Profit calculation insight */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-300">Lãi gộp dự kiến:</span>
                <span className="font-bold text-emerald-400">
                  +{formatVND(editProfit)} ({editMarginPercent}% doanh thu)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Tồn kho hiện tại:</label>
                  <input
                    type="number"
                    value={editingItem.stock}
                    onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Cảnh báo khi dưới:</label>
                  <input
                    type="number"
                    value={editingItem.minStockAlert}
                    onChange={(e) => setEditingItem({ ...editingItem, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-300 font-medium">Trạng thái phục vụ:</span>
                <button
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, isAvailable: !editingItem.isAvailable })}
                  className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                    editingItem.isAvailable
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {editingItem.isAvailable ? 'Đang bán' : 'Tạm ngừng bán'}
                </button>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa món */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Xác nhận xóa món
              </h3>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-white px-2.5 py-1 text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 leading-relaxed">
              Bạn có chắc chắn muốn xóa món <strong className="text-white">"{itemToDelete.name}"</strong> khỏi thực đơn của quán?
              <br />
              Món này sẽ không còn hiển thị trong danh sách gọi món của các bàn. Thao tác không thể hoàn tác.
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nhập Kho */}
      {isImportModalOpen && selectedItemToImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Nhập kho: {selectedItemToImport.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tồn kho hiện tại: {selectedItemToImport.stock} {selectedItemToImport.unit}
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Số lượng nhập ({selectedItemToImport.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={importQty}
                  onChange={(e) => setImportQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-slate-600"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-semibold focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Nhà cung cấp / Ghi chú:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đại lý bia nước ngọt..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Tổng chi phí:</span>
                <span className="font-bold text-rose-400 text-sm sm:text-base">
                  {formatVND(importQty * importUnitCost)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
                >
                  Xác nhận nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
