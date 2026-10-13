import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TableSession, PaymentMethod } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import { getVietQRUrl } from '../../services/vietqr';
import { ThermalReceipt } from './ThermalReceipt';

export const PosCashierView: React.FC = () => {
  const {
    tables,
    sessions,
    pricingRules,
    settings,
    currentTime,
    completeCheckout,
    getActiveSessionForTable,
  } = useApp();

  const activeTables = tables.filter((t) => t.status === 'PLAYING' || t.status === 'WAITING_PAYMENT');
  const completedToday = sessions.filter((s) => s.status === 'COMPLETED');

  const [selectedTableId, setSelectedTableId] = useState<string>(
    activeTables.length > 0 ? activeTables[0].id : ''
  );
  const [selectedCompletedSession, setSelectedCompletedSession] = useState<TableSession | null>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const selectedSession = selectedTable ? getActiveSessionForTable(selectedTable.id) : undefined;
  const currentRule = selectedTable ? pricingRules.find((r) => r.type === selectedTable.type) : undefined;

  const feeCalc = selectedSession ? calculateTableFee(selectedSession, currentRule, currentTime) : null;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [customSurcharge, setCustomSurcharge] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [bankRef] = useState<string>('');
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  React.useEffect(() => {
    if (feeCalc) {
      setCustomDiscount(feeCalc.discountAmount);
    }
  }, [selectedTableId, feeCalc?.discountAmount]);

  const grandTotal = feeCalc
    ? Math.max(0, feeCalc.tableFee - customDiscount + feeCalc.fnbFee + customSurcharge)
    : 0;

  const cashChange = Math.max(0, cashReceived - grandTotal);

  const handleCheckout = (shouldPrint: boolean) => {
    if (!selectedSession || !selectedTable) return;
    if (shouldPrint) {
      window.print();
    }
    completeCheckout(
      selectedSession.id,
      paymentMethod,
      customDiscount,
      customSurcharge,
      cashReceived || grandTotal,
      cashChange,
      bankRef
    );
    const remaining = activeTables.filter((t) => t.id !== selectedTable.id);
    if (remaining.length > 0) {
      setSelectedTableId(remaining[0].id);
    } else {
      setSelectedTableId('');
    }
  };

  const vietQrUrl = selectedTable && selectedSession
    ? getVietQRUrl(
        settings.bankName,
        settings.bankAccountNo,
        settings.bankAccountName,
        grandTotal,
        `TL ${selectedTable.code} ${selectedSession.id.slice(-4)}`
      )
    : '';

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Quầy thu ngân
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tính tiền giờ, dịch vụ F&B, quét mã VietQR và xuất biên lai
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300">
            Chờ tính: <strong className="text-amber-400">{tables.filter((t) => t.status === 'WAITING_PAYMENT').length}</strong>
          </span>
          <span className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300">
            Đang chơi: <strong className="text-emerald-400">{tables.filter((t) => t.status === 'PLAYING').length}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Left List (4 cols) & Right Terminal (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Tables list */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-xs font-semibold text-slate-300 mb-3 block">
              Danh sách bàn có khách ({activeTables.length})
            </span>

            {activeTables.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tất cả các bàn hiện đang trống.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
                {activeTables.map((t) => {
                  const sess = getActiveSessionForTable(t.id);
                  const isSelected = selectedTableId === t.id && !selectedCompletedSession;
                  const rule = pricingRules.find((r) => r.type === t.type);
                  const fee = sess ? calculateTableFee(sess, rule, currentTime) : null;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTableId(t.id);
                        setSelectedCompletedSession(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400/80 shadow-md'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{t.code}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {t.type}
                          </span>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          t.status === 'WAITING_PAYMENT'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}>
                          {t.status === 'WAITING_PAYMENT' ? 'Chờ tính' : 'Đang chơi'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </span>
                        <span className="font-semibold text-amber-300">
                          {fee ? formatVND(fee.grandTotal) : '---'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent bills list */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-xs font-semibold text-slate-400 mb-2.5 block">
              Đã thanh toán hôm nay ({completedToday.length})
            </span>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {completedToday.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedCompletedSession(s)}
                  className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <span className="font-medium text-white">{s.tableCode}</span>
                  <span className="text-amber-300 font-semibold">{formatVND(s.finalTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Terminal */}
        <div className="lg:col-span-8 flex flex-col">
          {selectedCompletedSession ? (
            /* Completed Receipt Review */
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-sm font-semibold text-white">
                  Chi tiết hóa đơn: {selectedCompletedSession.tableCode}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="h-8.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center transition-colors"
                  >
                    In lại hóa đơn
                  </button>
                  <button
                    onClick={() => setSelectedCompletedSession(null)}
                    className="h-8.5 px-3.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center hover:text-white transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              <ThermalReceipt
                session={selectedCompletedSession}
                settings={settings}
                durationMinutes={selectedCompletedSession.playedMinutes || 0}
                tableFee={selectedCompletedSession.tableFee || 0}
                fnbFee={selectedCompletedSession.ordersFee || 0}
                discountAmount={selectedCompletedSession.discountAmount || 0}
                surcharge={selectedCompletedSession.surcharge || 0}
                finalTotal={selectedCompletedSession.finalTotal || 0}
                cashReceived={selectedCompletedSession.paymentDetails?.cashReceived}
                cashChange={selectedCompletedSession.paymentDetails?.cashChange}
              />
            </div>
          ) : selectedTable && selectedSession && feeCalc ? (
            /* Live Terminal */
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Thanh toán: {selectedTable.code} ({selectedTable.type})
                    </h2>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Giờ vào: {new Date(selectedSession.startTime).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowPrintPreview(!showPrintPreview)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    {showPrintPreview ? 'Ẩn mẫu in' : 'Xem mẫu in'}
                  </button>
                </div>

                {showPrintPreview ? (
                  <div className="flex justify-center p-4 bg-slate-950 rounded-2xl mb-4 border border-slate-800">
                    <ThermalReceipt
                      session={selectedSession}
                      settings={settings}
                      durationMinutes={feeCalc.billedMinutes}
                      tableFee={feeCalc.tableFee}
                      fnbFee={feeCalc.fnbFee}
                      discountAmount={customDiscount}
                      surcharge={customSurcharge}
                      finalTotal={grandTotal}
                      cashReceived={cashReceived}
                      cashChange={cashChange}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Itemized Info */}
                    <div className="flex flex-col gap-3">
                      {/* Timer */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Thời gian chơi</span>
                          <span className="text-white font-semibold text-sm">
                            {formatSecondsToTimer(feeCalc.netSeconds)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-slate-800/80">
                          <span className="text-slate-300">
                            {formatDurationHuman(feeCalc.billedMinutes)} ({formatVND(selectedSession.appliedHourlyRate)}/h)
                          </span>
                          <span className="font-semibold text-white">
                            {formatVND(feeCalc.tableFee)}
                          </span>
                        </div>
                      </div>

                      {/* Orders */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                          <span>Dịch vụ ăn uống ({selectedSession.orders?.length || 0})</span>
                          <span className="text-white">{formatVND(feeCalc.fnbFee)}</span>
                        </div>

                        {(!selectedSession.orders || selectedSession.orders.length === 0) ? (
                          <span className="text-xs text-slate-500 italic">Không gọi món</span>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
                            {selectedSession.orders.map((ord) => (
                              <div key={ord.id} className="flex justify-between text-slate-300 py-0.5">
                                <span>{ord.name} x{ord.quantity}</span>
                                <span className="text-slate-400">{formatVND(ord.price * ord.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Discount & Surcharge */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Giảm giá:</span>
                          <input
                            type="number"
                            step="5000"
                            value={customDiscount}
                            onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value)))}
                            className="w-28 px-2.5 py-1 text-right rounded-lg bg-slate-950 border border-slate-800 text-rose-400 font-semibold"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Phụ thu:</span>
                          <input
                            type="number"
                            step="5000"
                            value={customSurcharge}
                            onChange={(e) => setCustomSurcharge(Math.max(0, Number(e.target.value)))}
                            className="w-28 px-2.5 py-1 text-right rounded-lg bg-slate-950 border border-slate-800 text-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Terminal */}
                    <div className="flex flex-col justify-between gap-3.5">
                      {/* Total Box */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                        <span className="text-xs text-slate-400 font-medium">
                          Tổng tiền thanh toán
                        </span>
                        <div className="text-2xl font-bold text-amber-300 mt-1">
                          {formatVND(grandTotal)}
                        </div>
                      </div>

                      {/* Methods */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CASH')}
                          className={`h-11 rounded-xl border text-center transition-all font-semibold flex items-center justify-center ${
                            paymentMethod === 'CASH'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          Tiền mặt
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('BANK_TRANSFER')}
                          className={`h-11 rounded-xl border text-center transition-all font-semibold flex items-center justify-center ${
                            paymentMethod === 'BANK_TRANSFER'
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          VietQR
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('MEMBER_WALLET')}
                          className={`h-11 rounded-xl border text-center transition-all font-semibold flex items-center justify-center ${
                            paymentMethod === 'MEMBER_WALLET'
                              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          Ví VIP
                        </button>
                      </div>

                      {paymentMethod === 'CASH' && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Khách đưa:</span>
                            <input
                              type="number"
                              step="10000"
                              value={cashReceived || ''}
                              onChange={(e) => setCashReceived(Number(e.target.value))}
                              placeholder="0"
                              className="w-32 px-2.5 py-1 text-right rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                            />
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 font-semibold">
                            <span className="text-slate-400">Tiền thối:</span>
                            <span className="text-emerald-400">{formatVND(cashChange)}</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'BANK_TRANSFER' && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                          <img src={vietQrUrl} alt="VietQR" className="w-16 h-16 bg-white p-1 rounded-lg object-contain shadow-sm" />
                          <div className="text-xs text-slate-300">
                            <p className="font-semibold text-white">{settings.bankName}</p>
                            <p className="text-amber-300 font-bold">{settings.bankAccountNo}</p>
                            <p className="text-slate-400">{settings.bankAccountName}</p>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'MEMBER_WALLET' && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                          {selectedSession.customerName ? (
                            <p>Hội viên: <b>{selectedSession.customerName}</b> ({selectedSession.customerTier})</p>
                          ) : (
                            <p className="text-amber-400">Bàn này chưa gắn thẻ hội viên!</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3.5 border-t border-slate-800 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCheckout(true)}
                  className="flex-1 h-13 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center transition-all shadow-md active:scale-[0.99]"
                >
                  In hóa đơn & Trả bàn
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckout(false)}
                  className="flex-1 h-13 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center transition-colors active:scale-[0.99]"
                >
                  Chốt không in
                </button>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center text-slate-400 text-xs">
              <span className="text-amber-300 font-semibold mb-1">Quầy thu ngân</span>
              <span>Chọn một bàn bên danh sách để bắt đầu thanh toán</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
