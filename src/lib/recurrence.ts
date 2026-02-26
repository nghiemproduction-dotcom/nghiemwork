import type { RecurringConfig } from '@/types';

/**
 * Tính thời điểm lặp tiếp theo từ thời điểm hoàn thành (hoặc now).
 * Trả về deadline (ms), deadlineDate (YYYY-MM-DD), deadlineTime (HH:mm) cho việc tiếp theo.
 */
export function getNextRecurrence(
  recurring: RecurringConfig,
  fromTime: number,
  timezone: string = 'Asia/Ho_Chi_Minh'
): { deadline: number; deadlineDate: string; deadlineTime: string } | null {
  if (!recurring || recurring.type === 'none') return null;
  const interval = Math.max(1, recurring.interval ?? 1);
  const from = new Date(fromTime);

  let next: Date;

  switch (recurring.type) {
    case 'hourly': {
      next = new Date(from.getTime() + interval * 60 * 60 * 1000);
      break;
    }
    case 'daily': {
      next = new Date(from);
      next.setDate(next.getDate() + interval);
      break;
    }
    case 'weekdays': {
      next = new Date(from);
      next.setDate(next.getDate() + 1);
      let d = next.getDay();
      while (d === 0 || d === 6) {
        next.setDate(next.getDate() + 1);
        d = next.getDay();
      }
      break;
    }
    case 'weekly': {
      next = new Date(from);
      next.setDate(next.getDate() + interval * 7);
      break;
    }
    case 'monthly': {
      next = new Date(from);
      next.setMonth(next.getMonth() + interval);
      if (next.getDate() !== from.getDate()) next.setDate(0);
      break;
    }
    case 'custom': {
      const days = recurring.customDays && recurring.customDays.length > 0
        ? recurring.customDays
        : [1, 2, 3, 4, 5];
      next = new Date(from);
      next.setDate(next.getDate() + 1);
      while (!days.includes(next.getDay())) {
        next.setDate(next.getDate() + 1);
      }
      break;
    }
    default:
      return null;
  }

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  const h = String(next.getHours()).padStart(2, '0');
  const min = String(next.getMinutes()).padStart(2, '0');
  return {
    deadline: next.getTime(),
    deadlineDate: `${y}-${m}-${d}`,
    deadlineTime: `${h}:${min}`,
  };
}

/** Nhãn hiển thị cho cấu hình lặp (có interval). */
export function getRecurringLabel(recurring: RecurringConfig): string {
  if (!recurring || recurring.type === 'none') return '';
  const interval = recurring.interval ?? 1;
  const labels: Record<string, string> = {
    hourly: interval === 1 ? 'Hàng giờ' : `Cách ${interval} giờ`,
    daily: interval === 1 ? 'Hàng ngày' : `Cách ${interval} ngày`,
    weekdays: 'T2–T6',
    weekly: interval === 1 ? 'Hàng tuần' : `Cách ${interval} tuần`,
    monthly: interval === 1 ? 'Hàng tháng' : `Cách ${interval} tháng`,
    custom: 'Tùy chọn',
  };
  return labels[recurring.type] ?? recurring.type;
}
