/**
 * COLORIDO 2K26 Time & Date Utilities
 * Standardized IST (Asia/Kolkata, UTC+05:30) timezone handling
 * and 12-hour AM/PM formatting.
 */

/**
 * Format any time representation (12-hour or 24-hour) to clean 12-hour AM/PM string.
 * Example:
 * '10:00:00' -> '10:00 AM'
 * '14:30:00' -> '02:30 PM'
 * '10:30 AM' -> '10:30 AM'
 * '08:15 PM' -> '08:15 PM'
 */
export function formatTo12Hour(timeStr?: string): string {
  if (!timeStr) return '';
  const s = String(timeStr).trim();

  // Already 12-hour format with AM/PM
  const match12 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12) {
    const h = parseInt(match12[1], 10);
    const m = match12[2];
    const ampm = match12[3].toUpperCase();
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }

  // 24-hour format (HH:MM or HH:MM:SS)
  const match24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    let hour = parseInt(match24[1], 10);
    const min = match24[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${min} ${ampm}`;
  }

  return s;
}

/**
 * Normalizes any time representation to 24-hour HH:MM:SS for database storage.
 */
export function parseTo24Hour(timeStr?: string): string | null {
  if (!timeStr) return null;
  const s = String(timeStr).trim();

  const match12 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2];
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}:00`;
  }

  const match24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    return `${String(parseInt(match24[1], 10)).padStart(2, '0')}:${match24[2]}:00`;
  }

  return s;
}

/**
 * Returns UTC epoch milliseconds of the event start time in Indian Standard Time (UTC+05:30).
 * Prevents browser local timezone differences from causing countdown offsets.
 */
export function getISTEventTimestamp(scheduleDate?: string, startTime?: string): number | null {
  if (!scheduleDate) return null;
  let dateClean = scheduleDate.trim().slice(0, 10);

  // If in DD-MM-YYYY format, convert to YYYY-MM-DD
  const dmyMatch = dateClean.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyMatch) {
    dateClean = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateClean)) return null;

  let hour = 10;
  let minute = 0;
  let second = 0;

  if (startTime) {
    const s = startTime.trim();
    const match12 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      minute = parseInt(match12[2], 10);
      second = match12[3] ? parseInt(match12[3], 10) : 0;
      const ampm = (match12[4] || '').toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hour = h;
    } else {
      const match24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (match24) {
        hour = parseInt(match24[1], 10);
        minute = parseInt(match24[2], 10);
        second = match24[3] ? parseInt(match24[3], 10) : 0;
      }
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  // Explicitly anchor to Indian Standard Time (UTC+05:30)
  const istIso = `${dateClean}T${pad(hour)}:${pad(minute)}:${pad(second)}+05:30`;
  const t = new Date(istIso).getTime();
  return isNaN(t) ? null : t;
}

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
  isExpired: boolean;
}

/**
 * Calculates countdown time left without negative values or browser timezone drift.
 */
export function calculateCountdown(targetTimestamp: number | null): CountdownResult {
  if (!targetTimestamp) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: false, isExpired: false };
  }

  const diff = targetTimestamp - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isStarted: false, isExpired: false };
}
