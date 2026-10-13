import React, { useState } from 'react';
import { TableItem } from '../../types';

interface TransferTableModalProps {
  sourceTable: TableItem | null;
  availableTables: TableItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fromTableId: string, toTableId: string) => void;
}

export const TransferTableModal: React.FC<TransferTableModalProps> = ({
  sourceTable,
  availableTables,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !sourceTable) return null;

  const [targetTableId, setTargetTableId] = useState<string>(
    availableTables.length > 0 ? availableTables[0].id : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTableId) return;
    onConfirm(sourceTable.id, targetTableId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c1018] border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-charcoal-750 bg-charcoal-850">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              CHUYỂN
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                CHUYỂN BÀN CHƠI
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Từ bàn: <span className="text-gold-400 font-bold">{sourceTable.code}</span>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            Thời gian chơi lũy kế và toàn bộ danh sách đồ ăn/nước uống đã gọi sẽ tự động được chuyển nguyên vẹn sang bàn đích.
          </div>

          <div className="flex flex-col gap-1.5 font-mono">
            <label className="text-xs font-bold text-slate-300">
              CHỌN BÀN ĐÍCH (CÁC BÀN TRỐNG):
            </label>

            {availableTables.length === 0 ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700 text-center text-xs text-rose-400 font-sans">
                Hiện tại không có bàn nào còn trống để chuyển!
              </div>
            ) : (
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} ({t.type}) - {t.area} - {t.hourlyRate.toLocaleString()}đ/h
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-charcoal-750 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
            >
              HỦY
            </button>
            <button
              type="submit"
              disabled={availableTables.length === 0}
              className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-amber-400 disabled:opacity-50 text-charcoal-950 font-black text-xs transition-colors"
            >
              ✓ XÁC NHẬN CHUYỂN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
