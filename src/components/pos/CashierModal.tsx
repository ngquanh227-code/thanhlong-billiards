import React, { useState } from 'react';
import { TableItem, TableSession, PricingRule, SystemSettings, PaymentMethod, Customer } from '../../types';
import { calculateTableFee, formatDurationHuman, formatSecondsToTimer, formatVND } from '../../services/calculation';
import { getVietQRUrl } from '../../services/vietqr';
import { ThermalReceipt } from './ThermalReceipt';
import {
  X,
  Receipt,
  Banknote,
  Wallet,
  Printer,
  Sparkles,
  QrCode,
  DollarSign,
  AlertCircle,
  Clock,
  Eye,
  Gift,
  Percent,
} from 'lucide-react';

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
  const [vatRate, setVatRate] = useState<number>(0); // 0%, 8%, 10%

  const customer = customers.find((c) => c.id === session.customerId);

  // Points redemption calculation: 100 points = 10,000 VND discount
  const pointsDiscountValue = (pointsToRedeem / 100) * 10000;

  // Subtotal before VAT
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

  // Generate VietQR Url
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700/80 bg-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                THANH TOÁN HÓA ĐƠN: {table.code}
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {table.type}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                HD-{session.id.slice(-6).toUpperCase()} • Giờ vào: {new Date(session.startTime).toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs text-slate-300 border border-charcoal-700 transition-colors"
              title="In phiếu tạm tính cho khách xem trước"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Tạm Tính (F9)</span>
            </button>
            <button
              onClick={() => setShowReceiptPreview(!showReceiptPreview)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-xs text-slate-300 border border-charcoal-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showReceiptPreview ? 'Ẩn Mẫu In' : 'Xem Mẫu In'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
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
            <div className="flex-1 flex flex-col p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-charcoal-700/80">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-700/70">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-felt-400" />
                    <span>Thời gian chơi thực tế</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    {formatSecondsToTimer(feeCalc.netSeconds)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ({formatDurationHuman(feeCalc.billedMinutes)} • {formatVND(session.appliedHourlyRate)}/h)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-700/70">
                  <div className="text-xs text-slate-400 mb-1">Tiền giờ tính tạm</div>
                  <div className="text-base font-bold text-gold-400 font-mono">
                    {formatVND(feeCalc.tableFee)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Làm tròn {pricingRule?.roundingMinutes || 5} phút
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  <span>Dịch Vụ & Đồ Ăn Đã Dùng ({session.orders?.length || 0})</span>
                  <span className="text-gold-400 font-mono">{formatVND(feeCalc.fnbFee)}</span>
                </div>

                {(!session.orders || session.orders.length === 0) ? (
                  <div className="p-3 rounded-xl bg-charcoal-850/60 border border-charcoal-800 text-center text-xs text-slate-500">
                    Không gọi đồ ăn hoặc nước uống
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {session.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-charcoal-850 border border-charcoal-700/50 text-xs"
                      >
                        <div className="flex-1 truncate pr-2">
                          <span className="font-semibold text-white">{ord.name}</span>
                          <div className="text-[10px] text-slate-400">
                            {ord.quantity} {ord.unit} × {formatVND(ord.price)}
                            {ord.notes && <span className="text-amber-400 ml-1">({ord.notes})</span>}
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

              {/* Sapo Discounts, Loyalty Points & VAT Controls */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-700/60 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>Giảm giá / Ưu đãi:</span>
                  </div>
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
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-charcoal-700/40">
                    <div className="flex items-center gap-1.5 text-gold-300">
                      <Gift className="w-3.5 h-3.5 text-gold-400" />
                      <span>Đổi điểm tích lũy ({customer.points} pts):</span>
                    </div>
                    <div className="flex items-center gap-1.5">
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
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phụ thu khác:</span>
                  </div>
                  <input
                    type="number"
                    step="5000"
                    value={customSurcharge}
                    onChange={(e) => setCustomSurcharge(Math.max(0, Number(e.target.value)))}
                    className="w-32 px-2 py-1 text-right text-xs rounded bg-charcoal-800 border border-charcoal-700 text-white font-mono font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Sapo VAT Selector */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-charcoal-700/40">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thuế GTGT (VAT):</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 8, 10].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setVatRate(rate)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
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
          <div className="w-full md:w-96 flex flex-col bg-charcoal-850/80 p-5 justify-between">
            <div className="flex flex-col gap-4">
              {/* Grand Total Display */}
              <div className="p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Tổng cộng cần thanh toán
                </span>
                <div className="text-2xl font-bold text-gold-400 font-mono mt-1">
                  {formatVND(calculatedGrandTotal)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Hình Thức Thanh Toán:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      paymentMethod === 'CASH'
                        ? 'bg-charcoal-750 border-emerald-500/50 text-emerald-400'
                        : 'bg-charcoal-800 border-charcoal-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1" />
                    <span>Tiền mặt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'bg-charcoal-750 border-blue-500/50 text-blue-400'
                        : 'bg-charcoal-800 border-charcoal-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mb-1" />
                    <span>VietQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MEMBER_WALLET')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      paymentMethod === 'MEMBER_WALLET'
                        ? 'bg-charcoal-750 border-amber-500/50 text-amber-400'
                        : 'bg-charcoal-800 border-charcoal-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mb-1" />
                    <span>Ví VIP</span>
                  </button>
                </div>
              </div>

              {/* CASH Payment Section */}
              {paymentMethod === 'CASH' && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-300 font-medium">Tiền khách đưa:</label>
                    <input
                      type="number"
                      step="10000"
                      placeholder="Nhập số tiền mặt..."
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-charcoal-800 border border-charcoal-700 text-white font-mono font-bold focus:outline-none focus:border-felt-500"
                    />
                  </div>

                  {/* Sapo Fast Bill Tender Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(calculatedGrandTotal)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 font-semibold"
                    >
                      Đủ tiền
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(50000)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      +50k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(100000)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      +100k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(200000)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      +200k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCash(500000)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700"
                    >
                      500k
                    </button>
                  </div>

                  {cashReceived > calculatedGrandTotal && (
                    <div className="p-3 rounded-xl bg-felt-950/60 border border-felt-500/40 flex items-center justify-between text-xs">
                      <span className="text-felt-300 font-medium">Tiền thừa trả khách:</span>
                      <span className="font-mono font-black text-felt-400 text-sm">
                        {formatVND(cashChange)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* VietQR Transfer */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-3 rounded-xl bg-charcoal-800 border border-blue-500/30 flex flex-col items-center text-center gap-2">
                  <div className="w-36 h-36 bg-white p-1 rounded-lg border shadow-md flex items-center justify-center">
                    <img
                      src={vietQrUrl}
                      alt="VietQR code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <p className="font-bold text-white">{settings.bankName} - {settings.bankAccountNo}</p>
                    <p className="text-slate-400">{settings.bankAccountName}</p>
                    <p className="text-blue-400 font-mono mt-0.5">Số tiền: {formatVND(calculatedGrandTotal)}</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Mã GD ngân hàng / Ghi chú..."
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded bg-charcoal-900 border border-charcoal-700 text-white"
                  />
                </div>
              )}

              {/* Member Wallet */}
              {paymentMethod === 'MEMBER_WALLET' && (
                <div className="p-3 rounded-xl bg-charcoal-800 border border-gold-500/30 flex flex-col gap-2 text-xs">
                  {customer ? (
                    <>
                      <div className="flex justify-between text-slate-300">
                        <span>Hội viên:</span>
                        <span className="font-bold text-white">{customer.name} ({customer.tier})</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Số dư ví hiện tại:</span>
                        <span className="font-bold font-mono text-gold-400">{formatVND(customer.prepaidBalance)}</span>
                      </div>
                      {customer.prepaidBalance < calculatedGrandTotal ? (
                        <div className="p-2 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Số dư không đủ! Cần nạp thêm tiền hoặc chọn thanh toán khác.</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-felt-950/60 border border-felt-500/40 text-felt-300 text-[11px]">
                          Số dư đủ thanh toán. Sau khi trừ ví, số dư còn lại:{' '}
                          <b>{formatVND(customer.prepaidBalance - calculatedGrandTotal)}</b>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[11px]">
                      Lượt chơi này chưa gán khách hàng hội viên có ví trả trước!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2.5 pt-4 border-t border-charcoal-700/80 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-charcoal-800 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSettleOnly}
                className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Receipt className="w-4 h-4" />
                <span>Xác Nhận Thanh Toán & Trả Bàn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
