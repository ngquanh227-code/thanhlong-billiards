import React from 'react';
import logoImg from '../../assets/logo.png';
import { TableSession, SystemSettings } from '../../types';
import { formatVND, formatDurationHuman } from '../../services/calculation';
import { getVietQRUrl } from '../../services/vietqr';

interface ThermalReceiptProps {
  session: TableSession;
  settings: SystemSettings;
  durationMinutes: number;
  tableFee: number;
  fnbFee: number;
  discountAmount: number;
  surcharge: number;
  finalTotal: number;
  cashReceived?: number;
  cashChange?: number;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  session,
  settings,
  durationMinutes,
  tableFee,
  fnbFee,
  discountAmount,
  surcharge,
  finalTotal,
  cashReceived,
  cashChange,
}) => {
  const qrUrl = getVietQRUrl(
    settings.bankName,
    settings.bankAccountNo,
    settings.bankAccountName,
    finalTotal,
    `TL ${session.tableCode} ${session.id.slice(-4)}`
  );

  const formattedStart = new Date(session.startTime).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedEnd = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      id="printable-receipt"
      className="bg-white text-black p-4 max-w-[80mm] mx-auto text-xs font-mono leading-tight shadow-md rounded border border-gray-300"
    >
      {/* Header */}
      <div className="text-center mb-2 flex flex-col items-center">
        <img
          src={logoImg}
          alt="Thanh Long Billiards Logo"
          className="w-14 h-14 rounded-full border border-gray-400 object-cover mb-1.5"
        />
        <h2 className="text-sm font-black uppercase tracking-wider mb-0.5 font-brand text-gray-950">
          {settings.clubName}
        </h2>
        <p className="text-[10px] text-gray-700 italic">{settings.slogan}</p>
        <p className="text-[10px] text-gray-700 mt-1">{settings.address}</p>
        <p className="text-[10px] text-gray-700">Hotline: {settings.phone}</p>
        <p className="text-[10px] text-gray-600">Wifi: {settings.wifiSsid} | MK: {settings.wifiPassword}</p>
      </div>

      <div className="border-b border-dashed border-gray-500 my-2" />

      {/* Invoice Meta */}
      <div className="text-center mb-2 font-bold uppercase text-xs">
        HÓA ĐƠN THANH TOÁN
      </div>
      <div className="text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>Số phiếu:</span>
          <span className="font-bold">HD-{session.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Ngày:</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Bàn chơi:</span>
          <span className="font-bold text-xs">{session.tableCode} ({session.tableType})</span>
        </div>
        <div className="flex justify-between">
          <span>Giờ vào:</span>
          <span>{formattedStart}</span>
        </div>
        <div className="flex justify-between">
          <span>Giờ ra:</span>
          <span>{formattedEnd}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Tổng thời gian:</span>
          <span>{formatDurationHuman(durationMinutes)}</span>
        </div>
        {session.customerName && (
          <div className="flex justify-between">
            <span>Khách hàng:</span>
            <span className="font-bold">{session.customerName} {session.customerTier ? `(${session.customerTier})` : ''}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Thu ngân:</span>
          <span>{session.cashierName || session.staffName}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-gray-500 my-2" />

      {/* Bill Items Table */}
      <div className="text-[11px]">
        <div className="flex justify-between font-bold pb-1 border-b border-gray-300">
          <span>Dịch vụ / Món</span>
          <span className="w-10 text-center">SL</span>
          <span className="text-right">Thành tiền</span>
        </div>

        {/* Table Fee Item */}
        <div className="flex justify-between py-1 border-b border-gray-100">
          <div className="flex-1">
            <span className="font-semibold">Tiền giờ ({session.tableCode})</span>
            <div className="text-[9px] text-gray-600">
              {formatDurationHuman(durationMinutes)} × {formatVND(session.appliedHourlyRate)}/h
            </div>
          </div>
          <span className="w-10 text-center">-</span>
          <span className="text-right font-semibold">{formatVND(tableFee)}</span>
        </div>

        {/* F&B Items */}
        {session.orders && session.orders.map((item, idx) => (
          <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
            <div className="flex-1 truncate pr-1">
              <span>{item.name}</span>
              <div className="text-[9px] text-gray-600">
                {formatVND(item.price)}/{item.unit}
              </div>
            </div>
            <span className="w-10 text-center font-semibold">{item.quantity}</span>
            <span className="text-right font-semibold">{formatVND(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-gray-500 my-2" />

      {/* Calculations Summary */}
      <div className="text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>Tiền giờ chơi:</span>
          <span>{formatVND(tableFee)}</span>
        </div>
        {fnbFee > 0 && (
          <div className="flex justify-between">
            <span>Tiền đồ ăn, đồ uống:</span>
            <span>{formatVND(fnbFee)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-red-600 font-semibold">
            <span>Giảm giá / Ưu đãi VIP:</span>
            <span>-{formatVND(discountAmount)}</span>
          </div>
        )}
        {surcharge > 0 && (
          <div className="flex justify-between">
            <span>Phụ thu:</span>
            <span>+{formatVND(surcharge)}</span>
          </div>
        )}

        <div className="border-t border-gray-800 pt-1 flex justify-between text-xs font-black">
          <span className="uppercase">TỔNG CỘNG:</span>
          <span className="text-sm">{formatVND(finalTotal)}</span>
        </div>

        {cashReceived !== undefined && cashReceived > 0 && (
          <>
            <div className="flex justify-between pt-1">
              <span>Tiền mặt nhận:</span>
              <span>{formatVND(cashReceived)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Tiền thừa thối lại:</span>
              <span>{formatVND(cashChange || 0)}</span>
            </div>
          </>
        )}
      </div>

      <div className="border-b border-dashed border-gray-500 my-2" />

      {/* QR Code for Bank Transfer or Service Review */}
      <div className="flex flex-col items-center justify-center text-center my-2">
        <img
          src={qrUrl}
          alt="VietQR Transfer"
          className="w-28 h-28 object-contain border border-gray-200 rounded p-1 mb-1"
        />
        <span className="text-[9px] text-gray-600">Quét mã VietQR chuyển khoản nhanh</span>
        <span className="text-[9px] font-bold">{settings.bankName} - {settings.bankAccountNo}</span>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-700 mt-2">
        <p className="font-bold">{settings.receiptFooter}</p>
        <p className="text-[9px] text-gray-500 mt-0.5">Hân hạnh đón tiếp quý cơ thủ lần sau!</p>
      </div>
    </div>
  );
};
