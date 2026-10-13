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
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            KHO HÀNG & SỔ QUỸ THU CHI
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Theo dõi tồn kho F&B, quản lý chi phí vận hành (điện, nước, mặt bằng, bảo trì)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => {
              setTxType('EXPENSE');
              setIsCashTxModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-rose-400 border border-charcoal-700 text-xs font-bold transition-colors"
          >
            - TẠO PHIẾU CHI
          </button>
          <button
            onClick={() => {
              setTxType('INCOME');
              setIsCashTxModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors"
          >
            + TẠO PHIẾU THU
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 font-mono">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'INVENTORY'
              ? 'bg-charcoal-700 text-white border border-charcoal-600'
              : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-750'
          }`}
        >
          TỒN KHO MẶT HÀNG ({menu.length})
          {lowStockItems.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
              {lowStockItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CASHFLOW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'CASHFLOW'
              ? 'bg-charcoal-700 text-white border border-charcoal-600'
              : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-750'
          }`}
        >
          SỔ QUỸ THU - CHI ({transactions.length})
        </button>
      </div>

      {/* Tab Content: INVENTORY */}
      {activeTab === 'INVENTORY' && (
        <div className="flex flex-col gap-3 font-mono">
          {/* Low stock warning banner */}
          {lowStockItems.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
              <div>
                Có <b>{lowStockItems.length} mặt hàng</b> đã chạm mức báo động tồn kho. Vui lòng nhập hàng thêm!
              </div>
              <span className="text-[11px] text-amber-400 font-bold hidden sm:inline">
                {lowStockItems.map((i) => i.name).join(', ')}
              </span>
            </div>
          )}

          {/* Inventory Table */}
          <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px] bg-charcoal-900/60">
                    <th className="py-2.5 px-3.5">MẶT HÀNG</th>
                    <th className="py-2.5 px-3.5">DANH MỤC</th>
                    <th className="py-2.5 px-3.5">ĐƠN VỊ</th>
                    <th className="py-2.5 px-3.5">GIÁ VỐN</th>
                    <th className="py-2.5 px-3.5">GIÁ BÁN</th>
                    <th className="py-2.5 px-3.5">TỒN KHO</th>
                    <th className="py-2.5 px-3.5">GIÁ TRỊ TỒN</th>
                    <th className="py-2.5 px-3.5 text-right">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {menu.map((item) => {
                    const isLow = item.stock <= item.minStockAlert;
                    const stockValue = item.stock * item.costPrice;

                    return (
                      <tr key={item.id} className="hover:bg-charcoal-800/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-white font-sans">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-300">
                          {formatVND(item.costPrice)}
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-gold-400">
                          {formatVND(item.price)}
                        </td>
                        <td className="py-2.5 px-3.5 font-bold">
                          <span className={isLow ? 'text-amber-400' : 'text-slate-200'}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-300">
                          {formatVND(stockValue)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              SẮP HẾT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-charcoal-800 text-slate-400 border border-charcoal-700">
                              ĐỦ HÀNG
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
        <div className="flex flex-col gap-3 font-mono">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">
                TỔNG THU
              </span>
              <div className="text-xl font-black text-emerald-400">
                {formatVND(totalIncome)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">
                TỔNG CHI
              </span>
              <div className="text-xl font-black text-rose-400">
                {formatVND(totalExpense)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">
                DÒNG TIỀN RÒNG
              </span>
              <div className="text-xl font-black text-gold-400">
                {formatVND(netCashFlow)}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px] bg-charcoal-900/60">
                    <th className="py-2.5 px-3.5">THỜI GIAN</th>
                    <th className="py-2.5 px-3.5">LOẠI PHIẾU</th>
                    <th className="py-2.5 px-3.5">KHOẢN MỤC</th>
                    <th className="py-2.5 px-3.5">NỘI DUNG</th>
                    <th className="py-2.5 px-3.5">SỐ TIỀN</th>
                    <th className="py-2.5 px-3.5 text-right">NGƯỜI LẬP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-charcoal-800/40 transition-colors">
                      <td className="py-2.5 px-3.5 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {tx.type === 'INCOME' ? 'PHIẾU THU' : 'PHIẾU CHI'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-300 font-bold">
                        {tx.category}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-300 font-sans">
                        {tx.description}
                      </td>
                      <td className={`py-2.5 px-3.5 font-black ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatVND(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-400 text-right font-sans">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                TẠO {txType === 'INCOME' ? 'PHIẾU THU TIỀN' : 'PHIẾU CHI VẬN HÀNH'}
              </h3>
              <button
                onClick={() => setIsCashTxModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 px-2.5 text-xs font-bold rounded-lg hover:bg-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">KHOẢN MỤC:</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-gold-500"
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
                <label className="text-slate-300 font-bold block mb-1">SỐ TIỀN (VNĐ):</label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gold-400 font-black focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">LÝ DO / DIỄN GIẢI:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiền điện tháng này..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-750 mt-1">
                <button
                  type="button"
                  onClick={() => setIsCashTxModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-bold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-black text-white transition-colors ${
                    txType === 'INCOME'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  LƯU PHIẾU {txType === 'INCOME' ? 'THU' : 'CHI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
