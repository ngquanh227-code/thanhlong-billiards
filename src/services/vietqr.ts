// VietQR Generator Service for quick POS payments in Vietnam

export interface VietQRConfig {
  bankCode: string; // e.g. "MB", "VCB", "TCB", "ICB", "ACB"
  accountNumber: string;
  accountName: string;
}

export const VIETNAMESE_BANKS = [
  { code: 'MB', name: 'MB Bank (Quân Đội)', shortName: 'MB' },
  { code: 'VCB', name: 'Vietcombank', shortName: 'VCB' },
  { code: 'TCB', name: 'Techcombank', shortName: 'TCB' },
  { code: 'ICB', name: 'VietinBank', shortName: 'ICB' },
  { code: 'BIDV', name: 'BIDV', shortName: 'BIDV' },
  { code: 'ACB', name: 'ACB', shortName: 'ACB' },
  { code: 'VPB', name: 'VPBank', shortName: 'VPB' },
  { code: 'TPB', name: 'TPBank', shortName: 'TPB' },
  { code: 'STB', name: 'Sacombank', shortName: 'STB' },
  { code: 'HDB', name: 'HDBank', shortName: 'HDB' },
];

/**
 * Generate standard VietQR image URL
 */
export function getVietQRUrl(
  bankCode: string = 'MB',
  accountNo: string = '999988889999',
  accountName: string = 'THANH LONG BILLIARDS',
  amount: number = 0,
  description: string = 'THANH TOAN'
): string {
  const cleanBank = encodeURIComponent(bankCode.trim());
  const cleanAccount = encodeURIComponent(accountNo.trim());
  const cleanName = encodeURIComponent(accountName.trim());
  const cleanDesc = encodeURIComponent(description.trim().substring(0, 50));

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAccount}-compact2.png?amount=${Math.round(amount)}&addInfo=${cleanDesc}&accountName=${cleanName}`;
}
