import React, { useState } from 'react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  verifyPassword: (password: string) => boolean;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  verifyPassword,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Xác thực Quản trị viên
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Yêu cầu mật khẩu để truy cập doanh thu và cài đặt quán
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white px-2.5 py-1 text-xs rounded-lg hover:bg-slate-800 transition-colors"
          >
            Đóng
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

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 text-[11px] text-slate-400 leading-relaxed">
            Mật khẩu được lưu trữ an toàn trong Biến môi trường Vercel (<strong className="text-slate-300">VITE_ADMIN_PASSWORD</strong>).
            Mặc định ban đầu nếu chưa đổi trên Vercel là: <code className="text-amber-300 font-mono">thanhlong2026</code>.
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
