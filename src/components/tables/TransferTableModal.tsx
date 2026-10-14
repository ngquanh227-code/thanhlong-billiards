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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700/60">
              Chuyển bàn
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">
                Chuyển bàn chơi
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bàn nguồn: <span className="text-amber-300 font-medium">{sourceTable.code}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 px-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
            Thời gian chơi lũy kế và toàn bộ danh sách đồ ăn/nước uống đã gọi sẽ tự động được chuyển nguyên vẹn sang bàn đích.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Chọn bàn trống muốn chuyển tới:
            </label>

            {availableTables.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center text-xs text-rose-400">
                Hiện tại không có bàn nào còn trống để chuyển.
              </div>
            ) : (
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-slate-500 cursor-pointer"
              >
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} ({t.type}) - {t.area} - {t.hourlyRate.toLocaleString()}đ/h
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={availableTables.length === 0}
              className="flex-[2] h-11 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center active:scale-[0.98] whitespace-nowrap"
            >
              Xác nhận chuyển bàn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
