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
  const feeCalc = calculateTableFee(session, pricingRule, now, settings);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [bankRef, setBankRef] = useState<string>('');
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);

  const customer = customers.find((c) => c.id === session.customerId);
  const calculatedGrandTotal = feeCalc.grandTotal;
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
      feeCalc.discountAmount || 0,
      feeCalc.surcharge || 0,
      cashReceived || calculatedGrandTotal,
      cashChange,
      bankRef,
      0
    );
    onClose();
  };

  const handleSettleOnly = () => {
    onConfirmCheckout(
      session.id,
      paymentMethod,
      feeCalc.discountAmount || 0,
      feeCalc.surcharge || 0,
      cashReceived || calculatedGrandTotal,
      cashChange,
      bankRef,
      0
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-sm select-none safe-area-pb">
      <div className="relative w-full max-w-4xl max-h-[94vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700/60 shrink-0">
                {table.code}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                  <span>Thanh toán hóa đơn</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-normal">
                    {table.type}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  HD-{session.id.slice(-6).toUpperCase()} • Vào lúc: {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors shrink-0 active:scale-95"
              title="Đóng cửa sổ"
            >
              ✕
            </button>
          </div>

          {/* Sub Header Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handlePrePrint}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors text-center active:scale-98"
              title="In phiếu tạm tính cho khách xem trước"
            >
              In tạm tính
            </button>
            <button
              onClick={() => setShowReceiptPreview(!showReceiptPreview)}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors text-center active:scale-98"
            >
              {showReceiptPreview ? 'Đóng xem in' : 'Xem mẫu in'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
          {showReceiptPreview ? (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
              <ThermalReceipt
                session={session}
                settings={settings}
                durationMinutes={feeCalc.billedMinutes}
                tableFee={feeCalc.tableFee}
                fnbFee={feeCalc.fnbFee}
                discountAmount={feeCalc.discountAmount || 0}
                surcharge={feeCalc.surcharge || 0}
                finalTotal={calculatedGrandTotal}
                cashReceived={cashReceived}
                cashChange={cashChange}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 mb-1 font-medium">
                    Thời gian chơi thực tế
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatSecondsToTimer(feeCalc.netSeconds)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {formatDurationHuman(feeCalc.billedMinutes)} • {formatVND(session.appliedHourlyRate)}/h
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 mb-1 font-medium">Tiền giờ tạm tính</div>
                  <div className="text-lg font-bold text-amber-300">
                    {formatVND(feeCalc.tableFee)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Làm tròn {pricingRule?.roundingMinutes || 5} phút
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
                  <span>Dịch vụ & Món đã dùng ({session.orders?.length || 0})</span>
                  <span className="text-amber-300 font-bold">{formatVND(feeCalc.fnbFee)}</span>
                </div>

                {(!session.orders || session.orders.length === 0) ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                    Không gọi đồ ăn hoặc thức uống
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {session.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                      >
                        <div className="flex-1 truncate pr-2">
                          <span className="font-medium text-white">{ord.name}</span>
                          <div className="text-[11px] text-slate-400">
                            {ord.quantity} {ord.unit} × {formatVND(ord.price)}
                            {ord.notes && <span className="text-amber-400 ml-1">({ord.notes})</span>}
                          </div>
                        </div>
                        <span className="font-semibold text-slate-200">
                          {formatVND(ord.price * ord.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          )}

          {/* Right Column: Payment Form */}
          <div className="w-full md:w-96 flex flex-col bg-slate-900/60 p-5 justify-between">
            <div className="flex flex-col gap-4">
              {/* Grand Total Display */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                <span className="text-xs text-slate-400 font-medium">
                  Tổng thanh toán
                </span>
                <div className="text-3xl font-bold text-amber-300 mt-1">
                  {formatVND(calculatedGrandTotal)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Hình thức thanh toán:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-slate-800 border-amber-500/80 text-amber-300 font-semibold shadow-sm'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tiền mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'bg-slate-800 border-amber-500/80 text-amber-300 font-semibold shadow-sm'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    VietQR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MEMBER_WALLET')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'MEMBER_WALLET'
                        ? 'bg-slate-800 border-amber-500/80 text-amber-300 font-semibold shadow-sm'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Ví hội viên
                  </button>
                </div>
              </div>

              {/* CASH Payment Section */}
              {paymentMethod === 'CASH' && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-300 font-medium">Tiền khách đưa:</label>
                    <input
                      type="number"
                      step="10000"
                      placeholder="0"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-base rounded-xl bg-slate-800/80 border border-slate-700 text-white font-bold focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  {/* Fast Tender Buttons */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(calculatedGrandTotal)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 font-semibold"
                    >
                      Đủ tiền
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(50000)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
                    >
                      +50k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(100000)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
                    >
                      +100k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCash(200000)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
                    >
                      +200k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCash(500000)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
                    >
                      500k
                    </button>
                  </div>

                  {cashReceived > calculatedGrandTotal && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-emerald-300 font-medium">Tiền thối lại:</span>
                      <span className="font-bold text-emerald-400 text-base">
                        {formatVND(cashChange)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* VietQR Transfer */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center gap-2.5">
                  <div className="w-32 h-32 bg-white p-1 rounded-xl shadow-sm flex items-center justify-center">
                    <img
                      src={vietQrUrl}
                      alt="VietQR code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white">{settings.bankName} - {settings.bankAccountNo}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{settings.bankAccountName}</p>
                    <p className="text-amber-300 font-bold mt-1">Số tiền: {formatVND(calculatedGrandTotal)}</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Mã giao dịch / Ghi chú chuyển..."
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                  />
                </div>
              )}

              {/* Member Wallet */}
              {paymentMethod === 'MEMBER_WALLET' && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2.5 text-xs">
                  {customer ? (
                    <>
                      <div className="flex justify-between text-slate-300">
                        <span>Hội viên:</span>
                        <span className="font-semibold text-white">{customer.name} ({customer.tier})</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Số dư ví hiện tại:</span>
                        <span className="font-bold text-amber-300">{formatVND(customer.prepaidBalance)}</span>
                      </div>
                      {customer.prepaidBalance < calculatedGrandTotal ? (
                        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                          Số dư ví không đủ để thanh toán. Vui lòng nạp thêm hoặc đổi phương thức.
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                          Số dư đủ thanh toán. Còn lại:{' '}
                          <b className="font-bold">{formatVND(customer.prepaidBalance - calculatedGrandTotal)}</b>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                      Lượt chơi này chưa liên kết hội viên có ví trả trước.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-800 mt-3 shrink-0">
              {/* Primary Action: Full-width, thumb-friendly */}
              <button
                type="button"
                onClick={handleSettleOnly}
                className="w-full h-12 sm:h-13 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99]"
              >
                <span>Chốt thanh toán</span>
                <span className="font-extrabold text-amber-200">({formatVND(calculatedGrandTotal)})</span>
              </button>

              {/* Secondary Actions: 50 / 50 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 sm:h-11 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center justify-center active:scale-98"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handlePrintAndSettle}
                  className="h-10 sm:h-11 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center transition-colors truncate px-1 active:scale-98"
                >
                  In & Trả bàn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
