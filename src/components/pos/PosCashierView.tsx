import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TableItem, TableSession, PaymentMethod } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import { getVietQRUrl } from '../../services/vietqr';
import { ThermalReceipt } from './ThermalReceipt';
import {
  Receipt,
  Clock,
  Banknote,
  QrCode,
  Wallet,
  Printer,
  Eye,
  Check,
} from 'lucide-react';

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
  const [bankRef, setBankRef] = useState<string>('');
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
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Quầy thu ngân
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tính tiền giờ, dịch vụ F&B, quét mã VietQR và in hóa đơn
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Chờ thanh toán: <b className="text-amber-400 font-mono">{tables.filter((t) => t.status === 'WAITING_PAYMENT').length}</b>
          </span>
          <span className="text-slate-400">
            Đang phục vụ: <b className="text-emerald-400 font-mono">{tables.filter((t) => t.status === 'PLAYING').length}</b>
          </span>
        </div>
      </div>

      {/* Main Grid: Left List (4 cols) & Right Terminal (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Tables list */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col">
            <span className="text-xs font-semibold text-slate-300 mb-2.5 block">
              Bàn đang phục vụ ({activeTables.length})
            </span>

            {activeTables.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Tất cả các bàn hiện đang trống.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
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
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-charcoal-750 border-emerald-500/60'
                          : 'bg-charcoal-800/80 hover:bg-charcoal-800 border-charcoal-750'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{t.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-charcoal-900 text-slate-400">
                            {t.type}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          t.status === 'WAITING_PAYMENT'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {t.status === 'WAITING_PAYMENT' ? 'Chờ tính' : 'Đang chơi'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-750/60 text-xs">
                        <span className="text-slate-400 font-mono">
                          {fee ? formatSecondsToTimer(fee.netSeconds) : '---'}
                        </span>
                        <span className="font-mono font-bold text-gold-400">
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
          <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col">
            <span className="text-xs font-semibold text-slate-400 mb-2 block">
              Đã thanh toán hôm nay ({completedToday.length})
            </span>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {completedToday.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedCompletedSession(s)}
                  className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <span className="font-medium text-white">{s.tableCode}</span>
                  <span className="font-mono text-gold-400 font-medium">{formatVND(s.finalTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Terminal */}
        <div className="lg:col-span-8 flex flex-col">
          {selectedCompletedSession ? (
            /* Completed Receipt Review */
            <div className="p-5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-charcoal-750 mb-3">
                <span className="text-sm font-bold text-white">
                  Chi tiết hóa đơn: {selectedCompletedSession.tableCode} (HD-{selectedCompletedSession.id.slice(-4).toUpperCase()})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In lại bill</span>
                  </button>
                  <button
                    onClick={() => setSelectedCompletedSession(null)}
                    className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-300 text-xs"
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
            <div className="p-5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-charcoal-750 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Thanh toán: {selectedTable.code} ({selectedTable.type})
                    </h2>
                    <span className="text-xs text-slate-400">
                      Vào lúc: {new Date(selectedSession.startTime).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowPrintPreview(!showPrintPreview)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs text-slate-300 border border-charcoal-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPrintPreview ? 'Ẩn xem trước' : 'Xem mẫu bill'}</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Itemized Info */}
                    <div className="flex flex-col gap-2.5">
                      {/* Timer */}
                      <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Thời gian chơi:</span>
                          <span className="font-mono text-white font-bold">
                            {formatSecondsToTimer(feeCalc.netSeconds)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t border-charcoal-750">
                          <span className="text-slate-300">
                            {formatDurationHuman(feeCalc.billedMinutes)} ({formatVND(selectedSession.appliedHourlyRate)}/h)
                          </span>
                          <span className="font-mono font-bold text-white">
                            {formatVND(feeCalc.tableFee)}
                          </span>
                        </div>
                      </div>

                      {/* Orders */}
                      <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750">
                        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                          <span>Món đã gọi ({selectedSession.orders?.length || 0})</span>
                          <span className="font-mono font-bold text-white">{formatVND(feeCalc.fnbFee)}</span>
                        </div>

                        {(!selectedSession.orders || selectedSession.orders.length === 0) ? (
                          <span className="text-xs text-slate-500 italic">Không gọi món</span>
                        ) : (
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
                            {selectedSession.orders.map((ord) => (
                              <div key={ord.id} className="flex justify-between text-slate-300 py-0.5">
                                <span>{ord.name} x{ord.quantity}</span>
                                <span className="font-mono text-slate-400">{formatVND(ord.price * ord.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Discount & Surcharge */}
                      <div className="p-3 rounded-lg bg-charcoal-800 border border-charcoal-750 flex flex-col gap-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Giảm giá:</span>
                          <input
                            type="number"
                            step="5000"
                            value={customDiscount}
                            onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value)))}
                            className="w-24 px-2 py-0.5 text-right rounded bg-charcoal-900 border border-charcoal-700 text-rose-400 font-mono font-bold"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Phụ thu:</span>
                          <input
                            type="number"
                            step="5000"
                            value={customSurcharge}
                            onChange={(e) => setCustomSurcharge(Math.max(0, Number(e.target.value)))}
                            className="w-24 px-2 py-0.5 text-right rounded bg-charcoal-900 border border-charcoal-700 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Terminal */}
                    <div className="flex flex-col justify-between gap-3">
                      {/* Total Box */}
                      <div className="p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-750 text-center">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                          Tổng tiền thanh toán
                        </span>
                        <div className="text-2xl font-bold text-gold-400 font-mono mt-0.5">
                          {formatVND(grandTotal)}
                        </div>
                      </div>

                      {/* Methods */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CASH')}
                          className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                            paymentMethod === 'CASH'
                              ? 'bg-charcoal-750 border-emerald-500/80 text-white'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Tiền mặt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('BANK_TRANSFER')}
                          className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                            paymentMethod === 'BANK_TRANSFER'
                              ? 'bg-charcoal-750 border-emerald-500/80 text-white'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <span>VietQR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('MEMBER_WALLET')}
                          className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                            paymentMethod === 'MEMBER_WALLET'
                              ? 'bg-charcoal-750 border-emerald-500/80 text-white'
                              : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                          }`}
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Ví VIP</span>
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
                              className="w-28 px-2 py-1 text-right rounded bg-charcoal-900 border border-charcoal-700 text-white font-mono font-bold"
                            />
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-charcoal-700 font-medium">
                            <span className="text-slate-400">Tiền thối lại:</span>
                            <span className="font-mono text-emerald-400 font-bold">{formatVND(cashChange)}</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'BANK_TRANSFER' && (
                        <div className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center gap-3">
                          <img src={vietQrUrl} alt="VietQR" className="w-16 h-16 bg-white p-0.5 rounded" />
                          <div className="text-[11px] text-slate-300">
                            <p className="font-bold text-white">{settings.bankName}</p>
                            <p className="font-mono text-gold-400">{settings.bankAccountNo}</p>
                            <p className="text-slate-400">{settings.bankAccountName}</p>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'MEMBER_WALLET' && (
                        <div className="p-2.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-xs text-slate-300">
                          {selectedSession.customerName ? (
                            <p>Hội viên: <b>{selectedSession.customerName}</b> ({selectedSession.customerTier})</p>
                          ) : (
                            <p className="text-amber-400">Chưa gắn thẻ hội viên!</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-charcoal-750 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckout(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Hóa Đơn & Trả Bàn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckout(false)}
                  className="py-2.5 px-4 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 text-xs font-medium transition-colors"
                >
                  Chốt Không In
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center flex flex-col items-center justify-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 text-slate-600 mb-2" />
              <span>Chọn một bàn bên trái để bắt đầu thanh toán</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
