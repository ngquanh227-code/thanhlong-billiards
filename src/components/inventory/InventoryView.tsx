import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CashTransaction } from '../../types';
import { formatVND } from '../../services/calculation';
import {
  Boxes,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Package,
  DollarSign,
  X,
} from 'lucide-react';

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
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Kho hàng & Sổ quỹ thu chi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi tồn kho F&B, quản lý chi phí vận hành (điện, nước, mặt bằng, bảo trì)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTxType('EXPENSE');
              setIsCashTxModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-rose-400 border border-charcoal-700 text-xs font-medium transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Tạo Phiếu Chi</span>
          </button>
          <button
            onClick={() => {
              setTxType('INCOME');
              setIsCashTxModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Tạo Phiếu Thu</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'INVENTORY'
              ? 'bg-charcoal-700 text-white font-semibold'
              : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-750'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Tồn Kho Mặt Hàng ({menu.length})</span>
          {lowStockItems.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {lowStockItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CASHFLOW')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'CASHFLOW'
              ? 'bg-charcoal-700 text-white font-semibold'
              : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-750'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Sổ Quỹ Thu - Chi ({transactions.length})</span>
        </button>
      </div>

      {/* Tab Content: INVENTORY */}
      {activeTab === 'INVENTORY' && (
        <div className="flex flex-col gap-4">
          {/* Low stock warning banner */}
          {lowStockItems.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Có <b>{lowStockItems.length} mặt hàng</b> đã chạm mức báo động tồn kho. Vui lòng nhập hàng thêm!
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">
                {lowStockItems.map((i) => i.name).join(', ')}
              </span>
            </div>
          )}

          {/* Inventory Table */}
          <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[11px] bg-charcoal-900/40">
                    <th className="py-2.5 px-3.5">Mặt Hàng</th>
                    <th className="py-2.5 px-3.5">Danh Mục</th>
                    <th className="py-2.5 px-3.5">Đơn Vị</th>
                    <th className="py-2.5 px-3.5">Giá Vốn</th>
                    <th className="py-2.5 px-3.5">Giá Bán</th>
                    <th className="py-2.5 px-3.5">Tồn Kho Hiện Tại</th>
                    <th className="py-2.5 px-3.5">Giá Trị Tồn Kho</th>
                    <th className="py-2.5 px-3.5 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {menu.map((item) => {
                    const isLow = item.stock <= item.minStockAlert;
                    const stockValue = item.stock * item.costPrice;

                    return (
                      <tr key={item.id} className="hover:bg-charcoal-800/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-300">
                          {formatVND(item.costPrice)}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-medium text-gold-400">
                          {formatVND(item.price)}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-semibold">
                          <span className={isLow ? 'text-amber-400' : 'text-slate-200'}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-300">
                          {formatVND(stockValue)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-charcoal-800 text-slate-400">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                Tổng Thu
              </span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {formatVND(totalIncome)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                Tổng Chi
              </span>
              <div className="text-xl font-bold text-rose-400 font-mono">
                {formatVND(totalExpense)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-gold-400" />
                Dòng Tiền Ròng
              </span>
              <div className="text-xl font-bold text-gold-400 font-mono">
                {formatVND(netCashFlow)}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[11px] bg-charcoal-900/40">
                    <th className="py-2.5 px-3.5">Thời Gian</th>
                    <th className="py-2.5 px-3.5">Loại Phiếu</th>
                    <th className="py-2.5 px-3.5">Khoản Mục</th>
                    <th className="py-2.5 px-3.5">Nội Dung</th>
                    <th className="py-2.5 px-3.5">Số Tiền</th>
                    <th className="py-2.5 px-3.5 text-right">Người Lập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-charcoal-800/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-400">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          tx.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {tx.type === 'INCOME' ? 'Phiếu Thu' : 'Phiếu Chi'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-300 font-medium">
                        {tx.category}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-400">
                        {tx.description}
                      </td>
                      <td className={`py-2.5 px-3.5 font-mono font-semibold ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatVND(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-400 text-right">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">
                Tạo {txType === 'INCOME' ? 'Phiếu Thu Tiền' : 'Phiếu Chi Vận Hành'}
              </h3>
              <button
                onClick={() => setIsCashTxModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Khoản mục:</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCashTxModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                    txType === 'INCOME'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Lưu Phiếu {txType === 'INCOME' ? 'Thu' : 'Chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
