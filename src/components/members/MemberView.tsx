import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, MemberTier } from '../../types';
import { formatVND } from '../../services/calculation';

export const MemberView: React.FC = () => {
  const { customers, addCustomer, depositCustomerWallet, isAdmin } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [selectedCustForDeposit, setSelectedCustForDeposit] = useState<Customer | null>(null);

  // New member form
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    tier: 'STANDARD' as MemberTier,
    prepaidBalance: 0,
    notes: '',
  });

  // Deposit form
  const [depositAmount, setDepositAmount] = useState<number>(1000000);
  const [bonusAmount, setBonusAmount] = useState<number>(100000);

  const filteredCustomers = customers.filter((cust) => {
    const matchesTier = tierFilter === 'ALL' || cust.tier === tierFilter;
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.includes(searchTerm) ||
      cust.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier: MemberTier) => {
    switch (tier) {
      case 'DIAMOND':
        return {
          label: 'KIM CƯƠNG',
          color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          perk: '-15% GIỜ',
        };
      case 'GOLD':
        return {
          label: 'VÀNG VIP',
          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          perk: '-10% GIỜ',
        };
      case 'SILVER':
        return {
          label: 'BẠC',
          color: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
          perk: '-5% GIỜ',
        };
      default:
        return {
          label: 'CHUẨN',
          color: 'bg-charcoal-800 text-slate-400 border-charcoal-700',
          perk: 'TÍCH ĐIỂM',
        };
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    addCustomer(newMember);
    setIsAddModalOpen(false);
    setNewMember({
      name: '',
      phone: '',
      tier: 'STANDARD',
      prepaidBalance: 0,
      notes: '',
    });
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForDeposit || depositAmount <= 0) return;
    depositCustomerWallet(selectedCustForDeposit.id, depositAmount, bonusAmount);
    setIsDepositModalOpen(false);
    setSelectedCustForDeposit(null);
  };

  const selectDepositPreset = (base: number, bonus: number) => {
    setDepositAmount(base);
    setBonusAmount(bonus);
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            HỘI VIÊN & KHÁCH HÀNG VIP
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Quản lý thẻ thành viên, nạp ví trả trước và ưu đãi giờ chơi
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs transition-colors tracking-wider"
          >
            + THÊM HỘI VIÊN
          </button>
        )}
      </div>

      {/* Tier Perks Cards strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 font-mono">
        <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HẠNG CHUẨN</div>
          <div className="text-sm font-black text-white mt-0.5">STANDARD</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">Tích 1 điểm / 1.000₫</div>
        </div>

        <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HẠNG BẠC</div>
          <div className="text-sm font-black text-slate-300 mt-0.5">-5% TIỀN GIỜ</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">Từ 500 điểm tích lũy</div>
        </div>

        <div className="p-3 rounded-xl bg-charcoal-850 border border-amber-500/30">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">HẠNG VÀNG VIP</div>
          <div className="text-sm font-black text-amber-400 mt-0.5">-10% TIỀN GIỜ</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">Ưu tiên giữ bàn</div>
        </div>

        <div className="p-3 rounded-xl bg-charcoal-850 border border-cyan-500/30">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">KIM CƯƠNG VIP</div>
          <div className="text-sm font-black text-cyan-400 mt-0.5">-15% TIỀN GIỜ</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">Miễn phí nước suối</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 font-mono">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {['ALL', 'DIAMOND', 'GOLD', 'SILVER', 'STANDARD'].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                tierFilter === t
                  ? 'bg-charcoal-700 text-white border border-charcoal-600'
                  : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {t === 'ALL' ? 'TẤT CẢ' : t}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm theo SĐT, tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-charcoal-850 border border-charcoal-750 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[10px] bg-charcoal-900/60">
                <th className="py-2.5 px-3">MÃ THẺ</th>
                <th className="py-2.5 px-3">HỌ TÊN</th>
                <th className="py-2.5 px-3">SỐ ĐIỆN THOẠI</th>
                <th className="py-2.5 px-3">HẠNG THẺ</th>
                <th className="py-2.5 px-3">SỐ DƯ VÍ</th>
                <th className="py-2.5 px-3">TÍCH LŨY</th>
                <th className="py-2.5 px-3">GIỜ CHƠI</th>
                <th className="py-2.5 px-3">CHI TIÊU</th>
                <th className="py-2.5 px-3 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filteredCustomers.map((cust) => {
                const badge = getTierBadge(cust.tier);

                return (
                  <tr key={cust.id} className="hover:bg-charcoal-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">
                      {cust.code}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white font-sans">
                      {cust.name}
                      {cust.notes && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {cust.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {cust.phone}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {formatVND(cust.prepaidBalance)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {cust.points} pts
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {cust.totalPlayHours.toFixed(1)} h
                    </td>
                    <td className="py-2.5 px-3 text-gold-400 font-bold">
                      {formatVND(cust.totalSpent)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustForDeposit(cust);
                          setIsDepositModalOpen(true);
                        }}
                        className="h-8 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 inline-flex items-center justify-center"
                      >
                        NẠP VÍ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm Hội Viên Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Thêm hội viên mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Họ và tên khách:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Hạng thành viên:</label>
                  <select
                    value={newMember.tier}
                    onChange={(e) => setNewMember({ ...newMember, tier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-slate-600 cursor-pointer"
                  >
                    <option value="STANDARD">Tiêu chuẩn</option>
                    <option value="SILVER">Bạc (-5% giờ)</option>
                    <option value="GOLD">Vàng (-10% giờ)</option>
                    <option value="DIAMOND">Kim cương (-15% giờ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Nạp ví ban đầu (VNĐ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={newMember.prepaidBalance}
                    onChange={(e) => setNewMember({ ...newMember, prepaidBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-semibold focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú sở thích:</label>
                <input
                  type="text"
                  placeholder="Bàn quen, thói quen gọi món..."
                  value={newMember.notes}
                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
                >
                  Tạo thẻ hội viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nạp Tiền Ví Trả Trước */}
      {isDepositModalOpen && selectedCustForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Nạp ví: {selectedCustForDeposit.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mã thẻ: {selectedCustForDeposit.code} • Số dư hiện tại: {formatVND(selectedCustForDeposit.prepaidBalance)}
                </p>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded-lg hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Gói nạp khuyến mãi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => selectDepositPreset(500000, 50000)}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">500.000 ₫</div>
                    <div className="text-[11px] text-amber-300 font-medium">+ Tặng 50.000 ₫ (10%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDepositPreset(1000000, 150000)}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">1.000.000 ₫</div>
                    <div className="text-[11px] text-emerald-400 font-medium">+ Tặng 150.000 ₫ (15%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDepositPreset(2000000, 400000)}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">2.000.000 ₫</div>
                    <div className="text-[11px] text-amber-300 font-medium">+ Tặng 400.000 ₫ (20%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDepositPreset(5000000, 1200000)}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">5.000.000 ₫</div>
                    <div className="text-[11px] text-cyan-400 font-medium">+ Tặng 1.200.000 ₫</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Số tiền nạp (VNĐ):</label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tặng thêm khuyến mãi (VNĐ):</label>
                <input
                  type="number"
                  step="10000"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-semibold focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Cộng vào ví:</span>
                <span className="font-bold text-emerald-400 text-sm sm:text-base">
                  {formatVND(depositAmount + bonusAmount)}
                </span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
                >
                  Xác nhận nạp tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
