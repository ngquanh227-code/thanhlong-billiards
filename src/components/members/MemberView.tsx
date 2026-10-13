import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, MemberTier } from '../../types';
import { formatVND } from '../../services/calculation';
import {
  Users,
  Search,
  Plus,
  Wallet,
  Phone,
  X,
  CreditCard,
  Gift,
} from 'lucide-react';

export const MemberView: React.FC = () => {
  const { customers, addCustomer, depositCustomerWallet } = useApp();

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
          label: 'Kim Cương',
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          perk: '-15% Giờ',
        };
      case 'GOLD':
        return {
          label: 'Vàng VIP',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          perk: '-10% Giờ',
        };
      case 'SILVER':
        return {
          label: 'Bạc',
          color: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
          perk: '-5% Giờ',
        };
      default:
        return {
          label: 'Chuẩn',
          color: 'bg-charcoal-800 text-slate-400 border-charcoal-700',
          perk: 'Tích điểm',
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
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Hội viên & Khách hàng
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý xếp hạng thành viên, nạp ví trả trước và ưu đãi giờ chơi
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hội viên</span>
        </button>
      </div>

      {/* Tier Perks Cards strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Hội viên Chuẩn</div>
          <div className="text-sm font-bold text-white mt-1">STANDARD</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tích 1 điểm / 1.000₫</div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Hạng Bạc (SILVER)</div>
          <div className="text-sm font-bold text-slate-300 mt-1">-5% Tiền Giờ</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Từ 500 điểm tích lũy</div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-amber-500/20 bg-amber-500/[0.02]">
          <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Hạng Vàng (GOLD)</div>
          <div className="text-sm font-bold text-amber-400 mt-1">-10% Tiền Giờ</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ưu tiên giữ bàn</div>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-850 border border-cyan-500/20 bg-cyan-500/[0.02]">
          <div className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider">Kim Cương (DIAMOND)</div>
          <div className="text-sm font-bold text-cyan-400 mt-1">-15% Tiền Giờ</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Nước suối miễn phí</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['ALL', 'DIAMOND', 'GOLD', 'SILVER', 'STANDARD'].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tierFilter === t
                  ? 'bg-charcoal-700 text-white font-semibold'
                  : 'bg-charcoal-850 text-slate-400 hover:text-slate-200 border border-charcoal-750'
              }`}
            >
              {t === 'ALL' ? 'Tất Cả' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo SĐT, tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-charcoal-850 border border-charcoal-750 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-750 text-slate-400 uppercase tracking-wider text-[11px] bg-charcoal-900/40">
                <th className="py-2.5 px-3.5">Mã Thẻ</th>
                <th className="py-2.5 px-3.5">Họ Tên</th>
                <th className="py-2.5 px-3.5">Số Điện Thoại</th>
                <th className="py-2.5 px-3.5">Hạng Thẻ</th>
                <th className="py-2.5 px-3.5">Số Dư Ví</th>
                <th className="py-2.5 px-3.5">Tích Lũy</th>
                <th className="py-2.5 px-3.5">Giờ Chơi</th>
                <th className="py-2.5 px-3.5">Chi Tiêu</th>
                <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filteredCustomers.map((cust) => {
                const badge = getTierBadge(cust.tier);

                return (
                  <tr key={cust.id} className="hover:bg-charcoal-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-medium text-slate-300">
                      {cust.code}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-white">
                      {cust.name}
                      {cust.notes && (
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {cust.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">
                      {cust.phone}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-emerald-400">
                      {formatVND(cust.prepaidBalance)}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">
                      {cust.points} pts
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">
                      {cust.totalPlayHours.toFixed(1)} h
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">
                      {formatVND(cust.totalSpent)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustForDeposit(cust);
                          setIsDepositModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 text-xs font-medium transition-colors"
                      >
                        <Wallet className="w-3 h-3 text-gold-400" />
                        <span>Nạp Ví</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-base font-bold text-white font-heading">
                Thêm Hội Viên Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Hạng thành viên:</label>
                  <select
                    value={newMember.tier}
                    onChange={(e) => setNewMember({ ...newMember, tier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-charcoal-600"
                  >
                    <option value="STANDARD">Tiêu chuẩn</option>
                    <option value="SILVER">Bạc (-5% giờ)</option>
                    <option value="GOLD">Vàng (-10% giờ)</option>
                    <option value="DIAMOND">Kim Cương (-15% giờ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Nạp ví ban đầu (VNĐ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={newMember.prepaidBalance}
                    onChange={(e) => setNewMember({ ...newMember, prepaidBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-emerald-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú sở thích:</label>
                <input
                  type="text"
                  placeholder="Bàn quen thuộc, thói quen gọi món..."
                  value={newMember.notes}
                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-charcoal-600"
                />
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
                  Tạo Thẻ Hội Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nạp Tiền Ví Trả Trước */}
      {isDepositModalOpen && selectedCustForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-charcoal-900 border border-charcoal-750 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Nạp Ví: {selectedCustForDeposit.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mã thẻ: {selectedCustForDeposit.code} • Số dư hiện tại: {formatVND(selectedCustForDeposit.prepaidBalance)}
                </p>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-charcoal-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Gói nạp khuyến mãi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => selectDepositPreset(500000, 50000)}
                    className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">500.000 ₫</div>
                    <div className="text-[11px] text-amber-400">+ Tặng 50.000 ₫ (10%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDepositPreset(1000000, 150000)}
                    className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">1.000.000 ₫</div>
                    <div className="text-[11px] text-emerald-400">+ Tặng 150.000 ₫ (15%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDepositPreset(2000000, 400000)}
                    className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">2.000.000 ₫</div>
                    <div className="text-[11px] text-amber-400">+ Tặng 400.000 ₫ (20%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDepositPreset(5000000, 1200000)}
                    className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 text-left transition-colors"
                  >
                    <div className="font-semibold text-white">5.000.000 ₫</div>
                    <div className="text-[11px] text-cyan-400">+ Tặng 1.200.000 ₫</div>
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
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-white font-mono font-medium focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tặng thêm khuyến mãi (VNĐ):</label>
                <input
                  type="number"
                  step="10000"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-amber-400 font-mono font-medium focus:outline-none focus:border-charcoal-600"
                />
              </div>

              <div className="p-3 rounded-lg bg-charcoal-850 border border-charcoal-750 flex justify-between items-center">
                <span className="text-slate-400">Tổng cộng cộng vào ví:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatVND(depositAmount + bonusAmount)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold transition-colors"
                >
                  Xác Nhận Nạp Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
