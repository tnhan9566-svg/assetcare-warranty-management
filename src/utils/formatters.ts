import { WarrantyCalculation, WarrantyStatus } from '../types';

// Use fixed reference date to match 2026 current mock year, or fallback to real date if later
export const CURRENT_DATE = new Date('2026-11-09T00:00:00');

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${formatDate(dateString)}`;
  } catch {
    return dateString;
  }
}

export function calculateWarranty(startDateStr: string, endDateStr: string): WarrantyCalculation {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const now = CURRENT_DATE;

  const totalTime = end.getTime() - start.getTime();
  const remainingTime = end.getTime() - now.getTime();
  const elapsedTime = now.getTime() - start.getTime();

  const totalDays = Math.max(1, Math.round(totalTime / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.round(remainingTime / (1000 * 60 * 60 * 24));

  let progressPercent = 0;
  if (totalTime > 0) {
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsedTime / totalTime) * 100)));
  }

  let status: WarrantyStatus = 'active';
  let statusLabel = '🟢 Còn bảo hành';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (daysRemaining < 0) {
    status = 'expired';
    statusLabel = `🔴 Đã hết hạn (${Math.abs(daysRemaining)} ngày trước)`;
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    progressPercent = 100;
  } else if (daysRemaining <= 30) {
    status = 'expiring_soon';
    statusLabel = `🟡 Sắp hết hạn (còn ${daysRemaining} ngày)`;
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    status = 'active';
    const months = Math.floor(daysRemaining / 30);
    const textRemaining = months > 0 ? `còn ~${months} tháng (${daysRemaining} ngày)` : `còn ${daysRemaining} ngày`;
    statusLabel = `🟢 Còn bảo hành (${textRemaining})`;
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return {
    status,
    daysRemaining,
    totalDays,
    progressPercent,
    statusLabel,
    badgeColor,
  };
}

export function addMonths(dateStr: string, months: number): string {
  try {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + Number(months));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export function timeAgo(dateString: string): string {
  try {
    const past = new Date(dateString).getTime();
    const now = CURRENT_DATE.getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} ngày trước`;
    const diffMonth = Math.floor(diffDay / 30);
    return `${diffMonth} tháng trước`;
  } catch {
    return dateString;
  }
}
