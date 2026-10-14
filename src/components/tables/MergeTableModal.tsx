import React, { useState } from 'react';
import { TableItem } from '../../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-sm select-none safe-area-pb">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-purple-300 border border-slate-700/60 shrink-0">
              Gộp bàn
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Gộp hóa đơn bàn
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Bàn nguồn: <span className="text-amber-300 font-medium">{sourceTable.code}</span>
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
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
            Toàn bộ các món đã gọi của <b>{sourceTable.code}</b> sẽ được gộp sang bàn đích. Bàn {sourceTable.code} sẽ được kết thúc phiên và chuyển về trạng thái bàn trống.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Chọn bàn đích muốn gộp vào:
            </label>

            {eligibleTables.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center text-xs text-rose-400">
                Không có bàn nào khác đang chơi để gộp vào.
              </div>
            ) : (
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {eligibleTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} ({t.type}) - {t.area}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center justify-center active:scale-98"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={eligibleTables.length === 0}
              className="flex-[2] h-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center active:scale-[0.98] truncate"
            >
              Xác nhận gộp bàn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
