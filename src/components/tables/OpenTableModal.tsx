import React, { useState } from 'react';
import { TableItem, Customer, Staff, PricingRule } from '../../types';
import { formatVND } from '../../services/calculation';
import { X, Play, User, ShieldCheck, DollarSign, Sparkles } from 'lucide-react';

interface OpenTableModalProps {
  table: TableItem | null;
  customers: Customer[];
  staff: Staff[];
  pricingRules: PricingRule[];
  currentStaff: Staff;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tableId: string, customerId?: string, staffId?: string, customRate?: number) => void;
}

export const OpenTableModal: React.FC<OpenTableModalProps> = ({
  table,
  customers,
  staff,
  pricingRules,
  currentStaff,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !table) return null;

  const rule = pricingRules.find((r) => r.type === table.type);
  const defaultRate = table.hourlyRate || rule?.defaultHourlyRate || 60000;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentStaff.id);
  const [customHourlyRate, setCustomHourlyRate] = useState<number>(defaultRate);
  const [searchPhone, setSearchPhone] = useState<string>('');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Filter customers by phone or name
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchPhone.toLowerCase()) ||
      c.phone.includes(searchPhone) ||
      c.code.toLowerCase().includes(searchPhone.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      table.id,
      selectedCustomerId || undefined,
      selectedStaffId || currentStaff.id,
      customHourlyRate
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700/80 bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-felt-900 border border-felt-500/40 flex items-center justify-center text-felt-400 font-black">
              🎱
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                MỞ BÀN: {table.code}
              </h3>
              <p className="text-xs text-slate-400">
                {table.name} • {table.area}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Base Rate Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-850 border border-charcoal-700/60">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <DollarSign className="w-4 h-4 text-gold-400" />
              <span>Giá chơi niêm yết:</span>
            </div>
            <div className="text-sm font-bold text-gold-400 font-mono">
              {formatVND(defaultRate)}/giờ
            </div>
          </div>

          {/* Select Customer / Member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-felt-400" />
                Khách hàng / Hội viên
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                (Không bắt buộc nếu khách vãng lai)
              </span>
            </label>

            {/* Quick search phone/name input */}
            <input
              type="text"
              placeholder="Tìm theo số điện thoại hoặc tên hội viên..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-felt-500"
            />

            {/* Dropdown Select */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-felt-500 cursor-pointer mt-1"
            >
              <option value="">-- Khách vãng lai (Chưa đăng ký) --</option>
              {filteredCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.phone}) - Hạng {cust.tier} - Ví: {formatVND(cust.prepaidBalance)}
                </option>
              ))}
            </select>

            {/* If Member is selected, show perks badge */}
            {selectedCustomer && (
              <div className="mt-1 p-2.5 rounded-xl bg-gold-950/40 border border-gold-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-300 font-medium">
                    Hội viên Hạng {selectedCustomer.tier}
                  </span>
                </div>
                <div className="text-[11px] text-gold-400 font-bold">
                  {selectedCustomer.tier === 'DIAMOND' && 'Ưu đãi -15% tiền giờ'}
                  {selectedCustomer.tier === 'GOLD' && 'Ưu đãi -10% tiền giờ'}
                  {selectedCustomer.tier === 'SILVER' && 'Ưu đãi -5% tiền giờ'}
                  {selectedCustomer.tier === 'STANDARD' && 'Tích lũy điểm 1:1'}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Staff */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Nhân viên phục vụ phụ trách bàn
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-felt-500 cursor-pointer"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Hourly Rate (if authorized) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Đơn giá giờ áp dụng cho lượt chơi này:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                (Được chốt cố định cho phiên này)
              </span>
            </label>
            <input
              type="number"
              step="5000"
              value={customHourlyRate}
              onChange={(e) => setCustomHourlyRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-bold focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-charcoal-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Bắt Đầu Tính Giờ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
