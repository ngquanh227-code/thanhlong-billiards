import React, { useState } from 'react';
import { TableItem, TableSession, PricingRule, SystemSettings, PaymentMethod, Customer } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import { getVietQRUrl } from '../../services/vietqr';
import { ThermalReceipt } from './ThermalReceipt';

interface CashierModalProps {
  table: TableItem | null;
  session: TableSession | null;
  pricingRule?: PricingRule;
  settings: SystemSettings;
  customers: Customer[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmCheckout: (
    sessionId: string,
    method: PaymentMethod,
    discountAmount: number,
    surcharge: number,
    cashReceived: number,
    cashChange: number,
    bankRef?: string,
    pointsRedeemed?: number
  ) => void;
}

export const CashierModal: React.FC<CashierModalProps> = ({
  table,
  session,
  pricingRule,
  settings,
  customers,
  isOpen,
  onClose,
  onConfirmCheckout,
}) => {
  if (!isOpen || !table || !session) return null;

  const now = new Date();
  const feeCalc = calculateTableFee(session, pricingRule, now);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [customDiscount, setCustomDiscount] = useState<number>(feeCalc.discountAmount);
  const [customSurcharge, setCustomSurcharge] = useState<number>(session.surcharge || 0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [bankRef, setBankRef] = useState<string>('');
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(0);

  const customer = customers.find((c) => c.id === session.customerId);

  const pointsDiscountValue = (pointsToRedeem / 100) * 10000;

  const subtotalBeforeVat = Math.max(
    0,
    feeCalc.tableFee - customDiscount - pointsDiscountValue + feeCalc.fnbFee + customSurcharge
  );

  const vatAmount = Math.round(subtotalBeforeVat * (vatRate / 100));
  const calculatedGrandTotal = subtotalBeforeVat + vatAmount;

  const cashChange = Math.max(0, cashReceived - calculatedGrandTotal);

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const handleAddCash = (amount: number) => {
    setCashReceived((prev) => prev + amount);
  };

  const vietQrUrl = getVietQRUrl(
    settings.bankName,
    settings.bankAccountNo,
    settings.bankAccountName,
    calculatedGrandTotal,
    `TL ${table.code} ${session.id.slice(-4)}`
  );

  const handlePrePrint = () => {
    window.print();
  };

  const handlePrintAndSettle = () => {
    window.print();
    onConfirmCheckout(
      session.id,
      paymentMethod,
      customDiscount + pointsDiscountValue,
      customSurcharge + vatAmount,
      cashReceived || calculatedGrandTotal,
      cashChange,
      bankRef,
      pointsToRedeem
    );
    onClose();
  };

  const handleSettleOnly = () => {
    onConfirmCheckout(
      session.id,
      paymentMethod,
      customDiscount + pointsDiscountValue,
      customSurcharge + vatAmount,
      cashReceived || calculatedGrandTotal,
      cashChange,
      bankRef,
      pointsToRedeem
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0c1018] border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-charcoal-750 bg-charcoal-850">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-charcoal-800 text-gold-400 border border-charcoal-700">
              {table.code}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                THANH TOÁN HÓA ĐƠN
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {table.type}
                </span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                HD-{session.id.slice(-6).toUpperCase()} • Giờ vào: {new Date(session.startTime).toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={handlePrePrint}
              className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs font-bold text-slate-300 border border-charcoal-700 transition-colors"
              title="In phiếu tạm tính cho khách xem trước"
            >
              IN TẠM TÍNH (F9)
            </button>
            <button
              onClick={() => setShowReceiptPreview(!showReceiptPreview)}
              className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs font-bold text-slate-300 border border-charcoal-700 transition-colors"
            >
              {showReceiptPreview ? 'ẨN MẪU IN' : 'XEM MẪU IN'}
            </button>
            <button
              onClick={onClose}
              className="p-1 px-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 text-xs font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {showReceiptPreview ? (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900 flex justify-center">
              <ThermalReceipt
                session={session}
                settings={settings}
                durationMinutes={feeCalc.billedMinutes}
                tableFee={feeCalc.tableFee}
                fnbFee={feeCalc.fnbFee}
                discountAmount={customDiscount + pointsDiscountValue}
                surcharge={customSurcharge + vatAmount}
                finalTotal={calculatedGrandTotal}
                cashReceived={cashReceived}
                cashChange={cashChange}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-charcoal-750">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 mb-3.5 font-mono">
                <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
                  <div className="text-[10px] text-slate-400 mb-0.5 tracking-wider">
                    THỜI GIAN CHƠI THỰC TẾ
                  </div>
                  <div className="text-base font-black text-white">
                    {formatSecondsToTimer(feeCalc.netSeconds)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ({formatDurationHuman(feeCalc.billedMinutes)} • {formatVND(session.appliedHourlyRate)}/H)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
                  <div className="text-[10px] text-slate-400 mb-0.5 tracking-wider">TIỀN GIỜ TẠM TÍNH</div>
                  <div className="text-base font-black text-gold-400">
                    {formatVND(feeCalc.tableFee)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Làm tròn {pricingRule?.roundingMinutes || 5} phút
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                  <span>DỊCH VỤ & MÓN ĐÃ DÙNG ({session.orders?.length || 0})</span>
                  <span className="text-gold-400 font-mono">{formatVND(feeCalc.fnbFee)}</span>
                </div>

                {(!session.orders || session.orders.length === 0) ? (
                  <div className="p-3 rounded-xl bg-charcoal-850/60 border border-charcoal-750 text-center text-xs text-slate-400 font-mono">
                    Không gọi đồ ăn hoặc nước uống
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {session.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs"
                      >
                        <div className="flex-1 truncate pr-2">
                          <span className="font-semibold text-white">{ord.name}</span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {ord.quantity} {ord.unit} × {formatVND(ord.price)}
                            {ord.notes && <span className="text-amber-400 ml-1 font-sans">({ord.notes})</span>}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-200">
                          {formatVND(ord.price * ord.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discounts, Loyalty Points & VAT Controls */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col gap-2 text-xs font-mono">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-300 font-bold">GIẢM GIÁ / ƯU ĐÃI:</span>
                  <input
                    type="number"
                    step="5000"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-32 px-2 py-1 text-right text-xs rounded bg-charcoal-800 border border-charcoal-700 text-rose-400 font-mono font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Redeem Member Points if customer linked */}
                {customer && customer.points > 0 && (
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-charcoal-750/60">
                    <span className="text-gold-300 font-bold">ĐỔI ĐIỂM ({customer.points} PTS):</span>
                    <select
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="px-2 py-1 text-xs rounded bg-charcoal-800 border border-charcoal-700 text-gold-400 font-mono font-bold"
                    >
                      <option value="0">Không dùng điểm</option>
                      {customer.points >= 100 && <option value="100">Dùng 100 điểm (-10.000đ)</option>}
                      {customer.points >= 200 && <option value="200">Dùng 200 điểm (-20.000đ)</option>}
                      {customer.points >= 500 && <option value="500">Dùng 500 điểm (-50.000đ)</option>}
                      {customer.points >= 1000 && <option value="1000">Dùng 1000 điểm (-100.000đ)</option>}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-300 font-bold">PHỤ THU:</span>
                  <input
                    type="number"
                    step="5000"
                    value={customSurcharge}
                    onChange={(e) => setCustomSurcharge(Math.max(0, Number(e.target.value)))}
                    className="w-32 px-2 py-1 text-right text-xs rounded bg-charcoal-800 border border-charcoal-700 text-white font-mono font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* VAT Selector */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-charcoal-750/60">
                  <span className="text-slate-300 font-bold">THUẾ GTGT (VAT):</span>
                  <div className="flex items-center gap-1">
                    {[0, 8, 10].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setVatRate(rate)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          vatRate === rate
                            ? 'bg-felt-600 text-white'
                            : 'bg-charcoal-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate === 0 ? '0%' : `${rate}%`}
                      </button>
                    ))}
                    {vatRate > 0 && (
                      <span className="text-slate-400 font-mono ml-1">+{formatVND(vatAmount)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Payment Form */}
          <div className="w-full md:w-96 flex flex-col bg-charcoal-850/80 p-4 sm:p-5 justify-between font-mono">
            <div className="flex flex-col gap-3.5">
              {/* Grand Total Display */}
              <div className="p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  TỔNG CỘNG CẦN THANH TOÁN
                </span>
                <div className="text-2xl font-black text-gold-400 mt-1">
                  {formatVND(calculatedGrandTotal)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  HÌNH THỨC THANH TOÁN:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2 rounded-lg border text-center transition-colors ${
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
                    className={`p-2 rounded-lg border text-center transition-colors ${
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
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      paymentMethod === 'MEMBER_WALLET'
                        ? 'bg-charcoal-750 border-emerald-500/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                    }`}
                  >
                    VÍ VIP
                  </button>
                </div>
              </div>

              {/* CASH Payment Section */}
              {paymentMethod === 'CASH' && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-300 font-bold">TIỀN KHÁCH ĐƯA:</label>
                    <input
                      type="number"
                      step="10000"
                      placeholder="0"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-charcoal-800 border border-charcoal-700 text-white font-mono font-black focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Fast Tender Buttons */}
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(calculatedGrandTotal)}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-charcoal-700 font-bold"
                    >
                      ĐỦ TIỀN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(50000)}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      +50K
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(100000)}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      +100K
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(200000)}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      +200K
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCash(500000)}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      500K
                    </button>
                  </div>

                  {cashReceived > calculatedGrandTotal && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <span className="text-emerald-300 font-bold">TIỀN THỐI:</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {formatVND(cashChange)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* VietQR Transfer */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-3 rounded-xl bg-charcoal-800 border border-charcoal-700 flex flex-col items-center text-center gap-2">
                  <div className="w-32 h-32 bg-white p-1 rounded-lg border shadow-md flex items-center justify-center">
                    <img
                      src={vietQrUrl}
                      alt="VietQR code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <p className="font-bold text-white">{settings.bankName} - {settings.bankAccountNo}</p>
                    <p className="text-slate-400 font-sans">{settings.bankAccountName}</p>
                    <p className="text-gold-400 font-bold mt-0.5">SỐ TIỀN: {formatVND(calculatedGrandTotal)}</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Mã giao dịch / Ghi chú..."
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded bg-charcoal-900 border border-charcoal-700 text-white font-sans"
                  />
                </div>
              )}

              {/* Member Wallet */}
              {paymentMethod === 'MEMBER_WALLET' && (
                <div className="p-3 rounded-xl bg-charcoal-800 border border-charcoal-700 flex flex-col gap-2 text-xs">
                  {customer ? (
                    <>
                      <div className="flex justify-between text-slate-300 font-sans">
                        <span>Hội viên:</span>
                        <span className="font-bold text-white">{customer.name} ({customer.tier})</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Số dư ví hiện tại:</span>
                        <span className="font-bold text-gold-400">{formatVND(customer.prepaidBalance)}</span>
                      </div>
                      {customer.prepaidBalance < calculatedGrandTotal ? (
                        <div className="p-2 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] font-sans">
                          Số dư không đủ! Cần nạp thêm tiền hoặc chọn thanh toán khác.
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-sans">
                          Số dư đủ thanh toán. Còn lại:{' '}
                          <b>{formatVND(customer.prepaidBalance - calculatedGrandTotal)}</b>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[11px] font-sans">
                      Lượt chơi này chưa gán khách hàng hội viên có ví trả trước!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 pt-3 border-t border-charcoal-750 mt-3 font-mono">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handlePrintAndSettle}
                className="flex-1 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 font-bold text-xs transition-colors"
              >
                IN & TRẢ BÀN
              </button>
              <button
                type="button"
                onClick={handleSettleOnly}
                className="flex-[2] py-2.5 rounded-xl bg-gold-500 hover:bg-amber-400 text-charcoal-950 font-black text-xs transition-colors shadow-lg active:scale-98"
              >
                XÁC NHẬN TRẢ BÀN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
