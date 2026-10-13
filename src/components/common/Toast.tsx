import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast) => {
        let dotColor = 'bg-emerald-400';
        let borderColor = 'border-slate-800 bg-[#121622]/95';

        if (toast.type === 'error') {
          dotColor = 'bg-rose-400';
          borderColor = 'border-rose-900/40 bg-[#171116]/95';
        } else if (toast.type === 'warning') {
          dotColor = 'bg-amber-400';
          borderColor = 'border-amber-900/40 bg-[#181512]/95';
        } else if (toast.type === 'info') {
          dotColor = 'bg-sky-400';
          borderColor = 'border-sky-900/40 bg-[#121722]/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 ${borderColor}`}
          >
            <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0 mt-1.5`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-300 mt-0.5 break-words">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded transition-colors"
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
