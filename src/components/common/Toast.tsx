import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-charcoal-850 border-felt-500/40 text-emerald-300';
        let Icon = CheckCircle2;

        if (toast.type === 'error') {
          bgColor = 'bg-charcoal-850 border-rose-500/40 text-rose-300';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-charcoal-850 border-amber-500/40 text-amber-300';
          Icon = AlertTriangle;
        } else if (toast.type === 'info') {
          bgColor = 'bg-charcoal-850 border-sky-500/40 text-sky-300';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgColor}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-wide">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-300 mt-0.5 break-words">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
