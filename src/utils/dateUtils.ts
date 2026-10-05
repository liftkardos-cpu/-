import { DeadlineStatus, TaskStatus } from '../types';

export function formatThaiDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const cleanStr = dateStr.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      
      const thaiYear = year + 543;
      return `${day} ${thaiMonths[month - 1]} ${thaiYear}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${day} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
  } catch {
    return dateStr;
  }
}

export function formatThaiDateFull(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const cleanStr = dateStr.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      const thaiMonthsFull = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${day} ${thaiMonthsFull[month - 1]} พ.ศ. ${year + 543}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Returns difference in calendar days (target - today)
 */
export function getDaysDiffFromToday(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cleanDate = targetDateStr.split('T')[0];
  const [y, m, d] = cleanDate.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return 0;
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateDeadlineStatus(deadlineStr: string, taskStatus: TaskStatus): DeadlineStatus {
  if (taskStatus === 'เสร็จสิ้น') {
    return 'เสร็จสิ้นแล้ว';
  }
  if (!deadlineStr) return 'ตามกำหนด';

  const diffDays = getDaysDiffFromToday(deadlineStr);
  if (diffDays < 0) {
    return 'เกินกำหนด';
  }
  if (diffDays <= 3) {
    return 'ใกล้ถึงกำหนด';
  }
  return 'ตามกำหนด';
}

export function getDeadlineBadgeStyle(status: DeadlineStatus): { bg: string; text: string; label: string; border: string } {
  switch (status) {
    case 'เกินกำหนด':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'text-rose-700',
        label: 'เกินกำหนด',
        border: 'border-rose-200'
      };
    case 'ใกล้ถึงกำหนด':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'text-amber-700',
        label: 'ใกล้ถึงกำหนด',
        border: 'border-amber-200'
      };
    case 'ตามกำหนด':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
        label: 'ตามกำหนด',
        border: 'border-emerald-200'
      };
    case 'เสร็จสิ้นแล้ว':
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        text: 'text-slate-600',
        label: 'เสร็จสิ้นแล้ว',
        border: 'border-slate-200'
      };
  }
}

export function getStatusBadgeStyle(status: TaskStatus | string): { bg: string; text: string; dot: string; border: string } {
  switch (status) {
    case 'รับเรื่อง':
    case 'รอดำเนินการ':
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        dot: 'bg-slate-500',
        border: 'border-slate-200'
      };
    case 'มอบหมาย':
      return {
        bg: 'bg-indigo-50 text-indigo-800',
        text: 'text-indigo-800',
        dot: 'bg-indigo-600',
        border: 'border-indigo-200'
      };
    case 'อยู่ระหว่างดำเนินการ':
      return {
        bg: 'bg-blue-50 text-blue-800',
        text: 'text-blue-800',
        dot: 'bg-blue-600',
        border: 'border-blue-200'
      };
    case 'รอติดตาม':
      return {
        bg: 'bg-amber-50 text-amber-800',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
        border: 'border-amber-200'
      };
    case 'เสร็จสิ้น':
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        text: 'text-emerald-800',
        dot: 'bg-emerald-600',
        border: 'border-emerald-200'
      };
    case 'พัก/รอข้อมูล':
      return {
        bg: 'bg-purple-50 text-purple-800',
        text: 'text-purple-800',
        dot: 'bg-purple-500',
        border: 'border-purple-200'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        dot: 'bg-slate-400',
        border: 'border-slate-200'
      };
  }
}

export function getCurrentDateTimeString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export function formatThaiDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const thaiDate = formatThaiDate(datePart);
    if (timePart) {
      const [hh, mm] = timePart.split(':');
      return `${thaiDate} เวลา ${hh}:${mm} น.`;
    }
    return thaiDate;
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
