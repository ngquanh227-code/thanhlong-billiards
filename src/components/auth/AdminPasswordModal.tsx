import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  verifyPassword: (password: string) => boolean;
  title?: string;
  description?: string;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  verifyPassword,
  title,
  description,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    const isValid = verifyPassword(passwordInput);
    if (isValid) {
      setErrorMsg('');
      setPasswordInput('');
      onSuccess();
    } else {
      setErrorMsg('Mật khẩu quản trị viên không chính xác. Vui lòng kiểm tra lại!');
      setPasswordInput('');
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setPasswordInput('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-md select-none font-sans safe-area-pb">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {title || 'Xác thực Quản trị viên'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {description || 'Nhập mật khẩu để truy cập doanh thu và cài đặt'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all active:scale-95 shrink-0"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">
              Mật khẩu / Mã PIN Quản trị:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                placeholder="Nhập mật khẩu quản trị..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono tracking-wider pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 rounded bg-slate-750"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-800 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all active:scale-95 border border-slate-700/60"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-[2] h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
