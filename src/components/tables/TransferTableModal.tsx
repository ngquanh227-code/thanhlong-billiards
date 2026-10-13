import React, { useState } from 'react';
import { TableItem } from '../../types';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700/80 bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-gold-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                CHUYỂN BÀN CHƠI
              </h3>
              <p className="text-xs text-slate-400">
                Từ bàn: <span className="text-gold-400 font-bold">{sourceTable.code}</span>
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
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              Thời gian chơi lũy kế và toàn bộ danh sách đồ ăn/nước uống đã order sẽ được tự động chuyển nguyên vẹn sang bàn mới.
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Chọn bàn đích muốn chuyển đến (Chỉ hiện các bàn trống):
            </label>

            {availableTables.length === 0 ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700 text-center text-xs text-rose-400">
                Hiện tại không có bàn nào còn trống để chuyển!
              </div>
            ) : (
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-felt-500 cursor-pointer"
              >
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} ({t.type}) - {t.area} - {t.hourlyRate.toLocaleString()}đ/h
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-charcoal-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={availableTables.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-charcoal-950 font-bold text-xs transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Xác Nhận Chuyển</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
