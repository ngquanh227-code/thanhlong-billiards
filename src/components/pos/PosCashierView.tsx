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
    <div className="flex flex-col gap-3.5 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-750">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-heading">
            QUẦY THU NGÂN
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Tính tiền giờ, dịch vụ F&B, quét mã VietQR và xuất biên lai
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-charcoal-850 px-2.5 py-1 rounded border border-charcoal-750 text-slate-400">
            CHỜ TÍNH: <b className="text-amber-400">{tables.filter((t) => t.status === 'WAITING_PAYMENT').length}</b>
          </span>
          <span className="bg-charcoal-850 px-2.5 py-1 rounded border border-charcoal-750 text-slate-400">
            ĐANG CHƠI: <b className="text-emerald-400">{tables.filter((t) => t.status === 'PLAYING').length}</b>
          </span>
        </div>
      </div>

      {/* Main Grid: Left List (4 cols) & Right Terminal (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column: Tables list */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="p-3 sm:p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-300 mb-2.5 block">
              DANH SÁCH BÀN CÓ KHÁCH ({activeTables.length})
            </span>

            {activeTables.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-400">
                Tất cả các bàn hiện đang trống.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
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
                      className={`p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-charcoal-750 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                          : 'bg-charcoal-800/80 hover:bg-charcoal-800 border-charcoal-750'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-mono">{t.code}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-charcoal-900 text-slate-400">
                            {t.type}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          t.status === 'WAITING_PAYMENT'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {t.status === 'WAITING_PAYMENT' ? '▲ CHỜ TÍNH' : '● ĐANG CHƠI'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-750/60 text-xs font-mono">
                        <span className="text-slate-400">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </span>
                        <span className="font-bold text-gold-400">
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
          <div className="p-3 sm:p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-400 mb-2 block">
              ĐÃ THANH TOÁN HÔM NAY ({completedToday.length})
            </span>

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {completedToday.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedCompletedSession(s)}
                  className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-between text-xs cursor-pointer transition-colors font-mono"
                >
                  <span className="font-bold text-white">{s.tableCode}</span>
                  <span className="text-gold-400 font-bold">{formatVND(s.finalTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Terminal */}
        <div className="lg:col-span-8 flex flex-col">
          {selectedCompletedSession ? (
            /* Completed Receipt Review */
            <div className="p-4 sm:p-5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-charcoal-750 mb-3 font-mono">
                <span className="text-xs sm:text-sm font-bold text-white">
                  CHI TIẾT: {selectedCompletedSession.tableCode} (HD-{selectedCompletedSession.id.slice(-4).toUpperCase()})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    IN LẠI BILL
                  </button>
                  <button
                    onClick={() => setSelectedCompletedSession(null)}
                    className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-300 text-xs font-bold"
                  >
                    ✕ ĐÓNG
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
            <div className="p-4 sm:p-5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-charcoal-750 mb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white font-mono">
                      THANH TOÁN: {selectedTable.code} ({selectedTable.type})
                    </h2>
                    <span className="text-[11px] text-slate-400 font-mono">
                      VÀO LÚC: {new Date(selectedSession.startTime).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowPrintPreview(!showPrintPreview)}
                    className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs font-mono font-bold text-slate-300 border border-charcoal-700"
                  >
                    {showPrintPreview ? 'ẨN MẪU BILL' : 'XEM MẪU BILL'}
                  </button>
                </div>

                {showPrintPreview ? (
                  <div className="flex justify-center p-3 bg-slate-900 rounded-lg mb-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
                    {/* Itemized Info */}
                    <div className="flex flex-col gap-2.5">
                      {/* Timer */}
                      <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750 font-mono">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>THỜI GIAN:</span>
                          <span className="text-white font-bold text-sm">
                            {formatSecondsToTimer(feeCalc.netSeconds)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t border-charcoal-750">
                          <span className="text-slate-300">
                            {formatDurationHuman(feeCalc.billedMinutes)} ({formatVND(selectedSession.appliedHourlyRate)}/H)
                          </span>
                          <span className="font-bold text-white">
                            {formatVND(feeCalc.tableFee)}
                          </span>
                        </div>
                      </div>

                      {/* Orders */}
                      <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750 font-mono">
                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                          <span>MÓN ĐÃ GỌI ({selectedSession.orders?.length || 0})</span>
                          <span className="text-white">{formatVND(feeCalc.fnbFee)}</span>
                        </div>

                        {(!selectedSession.orders || selectedSession.orders.length === 0) ? (
                          <span className="text-xs text-slate-400 italic font-sans">Không gọi món</span>
                        ) : (
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
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
                      <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750 flex flex-col gap-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-bold">GIẢM GIÁ:</span>
                          <input
                            type="number"
                            step="5000"
                            value={customDiscount}
                            onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value)))}
                            className="w-28 px-2 py-1 text-right rounded bg-charcoal-900 border border-charcoal-700 text-rose-400 font-bold"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-bold">PHỤ THU:</span>
                          <input
                            type="number"
                            step="5000"
                            value={customSurcharge}
                            onChange={(e) => setCustomSurcharge(Math.max(0, Number(e.target.value)))}
                            className="w-28 px-2 py-1 text-right rounded bg-charcoal-900 border border-charcoal-700 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Terminal */}
                    <div className="flex flex-col justify-between gap-3 font-mono">
                      {/* Total Box */}
                      <div className="p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-750 text-center">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                          TỔNG TIỀN THANH TOÁN
                        </span>
                        <div className="text-2xl font-black text-gold-400 mt-0.5">
                          {formatVND(grandTotal)}
                        </div>
                      </div>

                      {/* Methods */}
                      <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CASH')}
                          className={`py-2 px-1 rounded-lg border text-center transition-colors ${
                            paymentMethod === 'CASH'
                              ? 'bg-charcoal-750 border-emerald-500/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                          }`}
                        >
                          TIỀN MẶT
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('BANK_TRANSFER')}
                          className={`py-2 px-1 rounded-lg border text-center transition-colors ${
                            paymentMethod === 'BANK_TRANSFER'
                              ? 'bg-charcoal-750 border-emerald-500/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                          }`}
                        >
                          VIETQR
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('MEMBER_WALLET')}
                          className={`py-2 px-1 rounded-lg border text-center transition-colors ${
                            paymentMethod === 'MEMBER_WALLET'
                              ? 'bg-charcoal-750 border-emerald-500/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                          }`}
                        >
                          VÍ VIP
                        </button>
                      </div>

                      {paymentMethod === 'CASH' && (
                        <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750 flex flex-col gap-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Khách đưa:</span>
                            <input
                              type="number"
                              step="10000"
                              value={cashReceived || ''}
                              onChange={(e) => setCashReceived(Number(e.target.value))}
                              placeholder="0"
                              className="w-32 px-2 py-1 text-right rounded bg-charcoal-900 border border-charcoal-700 text-white font-bold"
                            />
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-charcoal-700 font-bold">
                            <span className="text-slate-400">Tiền thối:</span>
                            <span className="text-emerald-400 font-black">{formatVND(cashChange)}</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'BANK_TRANSFER' && (
                        <div className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center gap-3">
                          <img src={vietQrUrl} alt="VietQR" className="w-16 h-16 bg-white p-0.5 rounded object-contain" />
                          <div className="text-[11px] text-slate-300">
                            <p className="font-bold text-white">{settings.bankName}</p>
                            <p className="text-gold-400 font-bold">{settings.bankAccountNo}</p>
                            <p className="text-slate-400 font-sans">{settings.bankAccountName}</p>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'MEMBER_WALLET' && (
                        <div className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-xs text-slate-300 font-sans">
                          {selectedSession.customerName ? (
                            <p>Hội viên: <b>{selectedSession.customerName}</b> ({selectedSession.customerTier})</p>
                          ) : (
                            <p className="text-amber-400 font-mono">Chưa gắn thẻ hội viên!</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-charcoal-750 flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => handleCheckout(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-amber-400 text-charcoal-950 font-black text-xs transition-colors tracking-wider"
                >
                  IN HÓA ĐƠN & TRẢ BÀN
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckout(false)}
                  className="py-2.5 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 text-xs font-bold border border-charcoal-700 transition-colors"
                >
                  CHỐT KHÔNG IN
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
              <span className="text-gold-400 font-bold mb-1">[QUẦY THU NGÂN]</span>
              <span>Chọn một bàn bên danh sách để bắt đầu thanh toán</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
