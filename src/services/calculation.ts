import { TableSession, PricingRule, MemberTier } from '../types';

/**
 * Format number to Vietnamese Currency VND
 */
export function formatVND(amount: number = 0): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format duration in minutes into a human-readable string: e.g. "1 giờ 35 phút"
 */
export function formatDurationHuman(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h > 0) {
    return `${h} giờ ${m} phút`;
  }
  return `${m} phút`;
}

/**
 * Format seconds into HH:mm:ss
 */
export function formatSecondsToTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Calculate net played seconds excluding pause periods
 */
export function calculateNetPlayedSeconds(session: TableSession, now: Date = new Date()): number {
  const start = new Date(session.startTime).getTime();
  const end = session.endTime ? new Date(session.endTime).getTime() : now.getTime();

  let grossDurationMs = end - start;
  if (grossDurationMs < 0) grossDurationMs = 0;

  // Calculate total paused milliseconds
  let totalPausedMs = 0;
  if (session.pauseRecords && session.pauseRecords.length > 0) {
    for (const pause of session.pauseRecords) {
      const pStart = new Date(pause.pausedAt).getTime();
      const pEnd = pause.resumedAt ? new Date(pause.resumedAt).getTime() : (session.endTime ? new Date(session.endTime).getTime() : now.getTime());
      if (pEnd > pStart) {
        totalPausedMs += (pEnd - pStart);
      }
    }
  }

  const netMs = Math.max(0, grossDurationMs - totalPausedMs);
  return Math.floor(netMs / 1000);
}

/**
 * Apply rounding rule to minutes
 */
export function applyRounding(minutes: number, roundingRule: 1 | 5 | 10 | 15 = 1): number {
  if (roundingRule <= 1) return Math.ceil(minutes);
  return Math.ceil(minutes / roundingRule) * roundingRule;
}

/**
 * Check if a date/time is within configured peak hours
 */
export function isPeakHour(date: Date, startStr: string = '18:00', endStr: string = '23:00'): boolean {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const startLimit = (startH || 18) * 60 + (startM || 0);
  const endLimit = (endH || 23) * 60 + (endM || 0);

  return currentMinutes >= startLimit && currentMinutes <= endLimit;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Get tier discount percentage on table fee
 */
export function getTierDiscountPercent(tier?: MemberTier): number {
  switch (tier) {
    case 'DIAMOND':
      return 15; // 15% discount
    case 'GOLD':
      return 10; // 10% discount
    case 'SILVER':
      return 5; // 5% discount
    default:
      return 0;
  }
}

/**
 * Calculate dynamic table fee for an active or completed session
 */
export function calculateTableFee(
  session: TableSession,
  pricingRule?: PricingRule,
  now: Date = new Date()
): {
  netSeconds: number;
  netMinutes: number;
  billedMinutes: number;
  hourlyRate: number;
  tableFee: number;
  fnbFee: number;
  discountAmount: number;
  surcharge: number;
  grandTotal: number;
} {
  const netSeconds = calculateNetPlayedSeconds(session, now);
  const rawMinutes = netSeconds / 60;

  const minMinutes = pricingRule?.minimumMinutes || 15;
  const roundingRule = pricingRule?.roundingMinutes || 1;

  // Enforce minimum time
  let billedMinutes = Math.max(rawMinutes, minMinutes);
  // Apply rounding
  billedMinutes = applyRounding(billedMinutes, roundingRule);

  // Hourly rate - locked with session or from rule
  const hourlyRate = session.appliedHourlyRate || pricingRule?.defaultHourlyRate || 60000;

  // Raw table fee
  let rawTableFee = Math.round((billedMinutes / 60) * hourlyRate);

  // Calculate orders total
  const fnbFee = (session.orders || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Member discount on table fee
  const tierDiscountPercent = getTierDiscountPercent(session.customerTier);
  const discountAmount = Math.round(rawTableFee * (tierDiscountPercent / 100));

  const surcharge = session.surcharge || 0;
  const tableFee = Math.max(0, rawTableFee);
  const grandTotal = Math.max(0, tableFee - discountAmount + fnbFee + surcharge);

  return {
    netSeconds,
    netMinutes: Math.floor(rawMinutes),
    billedMinutes,
    hourlyRate,
    tableFee,
    fnbFee,
    discountAmount,
    surcharge,
    grandTotal,
  };
}
