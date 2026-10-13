import React, { useState } from 'react';
import { TableItem, Customer, Staff, PricingRule } from '../../types';
import { formatVND } from '../../services/calculation';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c1018] border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-charcoal-750 bg-charcoal-850">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              {table.code}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                MỞ BÀN CHƠI
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {table.name} • {table.area}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 font-mono text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto">
          {/* Base Rate Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono">
            <span className="text-xs text-slate-300">GIÁ NIÊM YẾT:</span>
            <span className="text-sm font-black text-gold-400">
              {formatVND(defaultRate)}/GIỜ
            </span>
          </div>

          {/* Select Customer / Member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>KHÁCH HÀNG / HỘI VIÊN:</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Tùy chọn)
              </span>
            </label>

            <input
              type="text"
              placeholder="Tìm theo số điện thoại hoặc tên hội viên..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer mt-1"
            >
              <option value="">-- Khách vãng lai (Chưa đăng ký) --</option>
              {filteredCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.phone}) - Hạng {cust.tier} - Ví: {formatVND(cust.prepaidBalance)}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-1 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-bold">
                  HỘI VIÊN HẠNG {selectedCustomer.tier}
                </span>
                <span className="text-[11px] text-gold-400 font-black">
                  {selectedCustomer.tier === 'DIAMOND' && '-15% TIỀN GIỜ'}
                  {selectedCustomer.tier === 'GOLD' && '-10% TIỀN GIỜ'}
                  {selectedCustomer.tier === 'SILVER' && '-5% TIỀN GIỜ'}
                  {selectedCustomer.tier === 'STANDARD' && 'TÍCH ĐIỂM 1:1'}
                </span>
              </div>
            )}
          </div>

          {/* Assigned Staff */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-slate-300">
              NHÂN VIÊN PHỤ TRÁCH BÀN:
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Hourly Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>ĐƠN GIÁ GIỜ ÁP DỤNG:</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Chốt cho phiên chơi)
              </span>
            </label>
            <input
              type="number"
              step="5000"
              value={customHourlyRate}
              onChange={(e) => setCustomHourlyRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-black focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-charcoal-750 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors"
            >
              ✓ BẮT ĐẦU TÍNH GIỜ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
