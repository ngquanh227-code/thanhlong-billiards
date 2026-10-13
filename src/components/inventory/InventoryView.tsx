import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CashTransaction } from '../../types';
import { formatVND } from '../../services/calculation';

export const InventoryView: React.FC = () => {
  const { menu, transactions, addCashTransaction } = useApp();

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'CASHFLOW'>('INVENTORY');
  const [isCashTxModalOpen, setIsCashTxModalOpen] = useState<boolean>(false);
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [txCategory, setTxCategory] = useState<CashTransaction['category']>('ELECTRICITY_WATER');
  const [txAmount, setTxAmount] = useState<number>(500000);
  const [txDescription, setTxDescription] = useState<string>('');

  const lowStockItems = menu.filter((item) => item.stock <= item.minStockAlert);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0 || !txDescription) return;

    addCashTransaction(txType, txCategory, txAmount, txDescription);

    setIsCashTxModalOpen(false);
    setTxAmount(500000);
    setTxDescription('');
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Kho hàng & Sổ quỹ thu chi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi tồn kho F&B, kiểm soát chi phí mặt bằng, điện nước và bảo trì thiết bị
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setTxType('EXPENSE');
              setIsCashTxModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            Tạo phiếu chi
          </button>
          <button
            onClick={() => {
              setTxType('INCOME');
              setIsCashTxModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Tạo phiếu thu
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`px-4 py-2 rounded-xl text-xs transition-all ${
            activeTab === 'INVENTORY'
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium'
          }`}
        >
          Tồn kho mặt hàng ({menu.length})
          {lowStockItems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
              {lowStockItems.length} sắp hết
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CASHFLOW')}
          className={`px-4 py-2 rounded-xl text-xs transition-all ${
            activeTab === 'CASHFLOW'
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium'
          }`}
        >
          Sổ quỹ thu - chi ({transactions.length})
        </button>
      </div>

      {/* Tab Content: INVENTORY */}
      {activeTab === 'INVENTORY' && (
        <div className="flex flex-col gap-4">
          {/* Low stock warning banner */}
          {lowStockItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
              <div>
                Có <b>{lowStockItems.length} mặt hàng</b> sắp hết hàng. Vui lòng kiểm tra nhập thêm.
              </div>
              <span className="text-xs text-amber-300 font-medium hidden sm:inline">
                {lowStockItems.map((i) => i.name).join(', ')}
              </span>
            </div>
          )}

          {/* Inventory Table */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px] bg-slate-900/80">
                    <th className="py-3 px-4">Mặt hàng</th>
                    <th className="py-3 px-4">Danh mục</th>
                    <th className="py-3 px-4">Đơn vị</th>
                    <th className="py-3 px-4">Giá vốn</th>
                    <th className="py-3 px-4">Giá bán</th>
                    <th className="py-3 px-4">Tồn kho</th>
                    <th className="py-3 px-4">Giá trị tồn</th>
                    <th className="py-3 px-4 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {menu.map((item) => {
                    const isLow = item.stock <= item.minStockAlert;
                    const stockValue = item.stock * item.costPrice;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.category}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.unit}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatVND(item.costPrice)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-300">
                          {formatVND(item.price)}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <span className={isLow ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatVND(stockValue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isLow ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Sắp hết
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                              Đủ hàng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: CASHFLOW */}
      {activeTab === 'CASHFLOW' && (
        <div className="flex flex-col gap-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1 font-medium">
                Tổng thu
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                {formatVND(totalIncome)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1 font-medium">
                Tổng chi
              </span>
              <div className="text-2xl font-bold text-rose-400">
                {formatVND(totalExpense)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1 font-medium">
                Dòng tiền ròng
              </span>
              <div className="text-2xl font-bold text-amber-300">
                {formatVND(netCashFlow)}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px] bg-slate-900/80">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Loại phiếu</th>
                    <th className="py-3 px-4">Khoản mục</th>
                    <th className="py-3 px-4">Nội dung</th>
                    <th className="py-3 px-4">Số tiền</th>
                    <th className="py-3 px-4 text-right">Người lập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          tx.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {tx.type === 'INCOME' ? 'Phiếu thu' : 'Phiếu chi'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {tx.description}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatVND(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-right">
                        {tx.staffName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tạo Phiếu Thu / Chi */}
      {isCashTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                Tạo {txType === 'INCOME' ? 'phiếu thu tiền' : 'phiếu chi vận hành'}
              </h3>
              <button
                onClick={() => setIsCashTxModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Khoản mục:</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-slate-500"
                >
                  {txType === 'EXPENSE' ? (
                    <>
                      <option value="ELECTRICITY_WATER">Tiền điện, nước, internet</option>
                      <option value="FNB_IMPORT">Chi nhập hàng F&B</option>
                      <option value="MAINTENANCE">Bảo trì bàn, nỉ, cơ</option>
                      <option value="SALARY">Lương / ứng nhân viên</option>
                      <option value="OTHER">Chi phí khác</option>
                    </>
                  ) : (
                    <>
                      <option value="BILL_COLLECTION">Thu tiền hóa đơn lẻ</option>
                      <option value="WALLET_TOPUP">Khách nạp ví hội viên</option>
                      <option value="OTHER">Thu nhập khác</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Số tiền (VNĐ):</label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-semibold focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Lý do / Diễn giải:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiền điện tháng này..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 mt-1">
                <button
                  type="button"
                  onClick={() => setIsCashTxModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors ${
                    txType === 'INCOME'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Lưu phiếu {txType === 'INCOME' ? 'thu' : 'chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
