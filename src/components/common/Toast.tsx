import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-5 sm:top-14 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderColor = 'border-emerald-500/50 bg-[#0d1514]';
        let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        let badgeText = 'THÀNH CÔNG';

        if (toast.type === 'error') {
          borderColor = 'border-rose-500/50 bg-[#170e10]';
          badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
          badgeText = 'LỖI';
        } else if (toast.type === 'warning') {
          borderColor = 'border-amber-500/50 bg-[#17140e]';
          badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
          badgeText = 'LƯU Ý';
        } else if (toast.type === 'info') {
          borderColor = 'border-sky-500/50 bg-[#0e141a]';
          badgeColor = 'bg-sky-500/20 text-sky-400 border-sky-500/30';
          badgeText = 'THÔNG BÁO';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 transform translate-y-0 ${borderColor}`}
          >
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border tracking-wider flex-shrink-0 mt-0.5 ${badgeColor}`}>
              [{badgeText}]
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-wide">{toast.title}</h4>
              {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 break-words">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors font-mono"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
