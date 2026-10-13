import React, { useState } from 'react';
import { TableItem } from '../../types';
import { X, Layers, AlertCircle } from 'lucide-react';

interface MergeTableModalProps {
  sourceTable: TableItem | null;
  activePlayingTables: TableItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sourceTableId: string, targetTableId: string) => void;
}

export const MergeTableModal: React.FC<MergeTableModalProps> = ({
  sourceTable,
  activePlayingTables,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !sourceTable) return null;

  // Tables eligible to merge into (other playing tables)
  const eligibleTables = activePlayingTables.filter((t) => t.id !== sourceTable.id);

  const [targetTableId, setTargetTableId] = useState<string>(
    eligibleTables.length > 0 ? eligibleTables[0].id : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTableId) return;
    onConfirm(sourceTable.id, targetTableId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700/80 bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                GỘP HÓA ĐƠN BÀN
              </h3>
              <p className="text-xs text-slate-400">
                Gộp từ bàn: <span className="text-gold-400 font-bold">{sourceTable.code}</span>
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
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-2.5 text-xs text-purple-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-400" />
            <div>
              Toàn bộ các món ăn và đồ uống của <b>{sourceTable.code}</b> sẽ được gộp sang bàn đích. Bàn {sourceTable.code} sẽ được kết thúc và chuyển về trạng thái TRỐNG.
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Chọn bàn đích muốn gộp vào (Các bàn đang chơi):
            </label>

            {eligibleTables.length === 0 ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700 text-center text-xs text-rose-400">
                Không có bàn nào khác đang chơi để gộp vào!
              </div>
            ) : (
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {eligibleTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} ({t.type}) - {t.area}
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
              disabled={eligibleTables.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              XÁC NHẬN GỘP BÀN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
