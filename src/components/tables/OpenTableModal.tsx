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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-sm select-none safe-area-pb">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700/60 shrink-0">
              {table.code}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Mở bàn chơi
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {table.name} • {table.area}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors shrink-0 active:scale-95"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Base Rate Notice */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <span className="text-slate-300 font-medium">Giá giờ niêm yết:</span>
            <span className="text-sm font-bold text-amber-300">
              {formatVND(defaultRate)}/giờ
            </span>
          </div>

          {/* Select Customer / Member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Khách hàng / Hội viên:</span>
              <span className="text-[11px] text-slate-400">
                (Tùy chọn)
              </span>
            </label>

            <input
              type="text"
              placeholder="Tìm theo số điện thoại hoặc tên hội viên..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-slate-500 cursor-pointer mt-1"
            >
              <option value="">Khách vãng lai (Chưa đăng ký)</option>
              {filteredCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.phone}) - Hạng {cust.tier} - Ví: {formatVND(cust.prepaidBalance)}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-medium">
                  Hội viên hạng {selectedCustomer.tier}
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  {selectedCustomer.tier === 'DIAMOND' && '-15% tiền giờ'}
                  {selectedCustomer.tier === 'GOLD' && '-10% tiền giờ'}
                  {selectedCustomer.tier === 'SILVER' && '-5% tiền giờ'}
                  {selectedCustomer.tier === 'STANDARD' && 'Tích điểm thưởng'}
                </span>
              </div>
            )}
          </div>


          {/* Custom Hourly Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Đơn giá giờ áp dụng:</span>
              <span className="text-[11px] text-slate-400">
                (Có thể chỉnh theo thỏa thuận)
              </span>
            </label>
            <input
              type="number"
              step="5000"
              value={customHourlyRate}
              onChange={(e) => setCustomHourlyRate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-semibold focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center justify-center active:scale-98"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-[2] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center active:scale-[0.98] truncate"
            >
              Bắt đầu tính giờ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
