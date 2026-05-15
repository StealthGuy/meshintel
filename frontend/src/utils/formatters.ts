/**
 * Fallback value for missing or invalid data.
 */
export const FALLBACK_VALUE = '—';

/**
 * Basic formatter for generic values.
 */
export const fmt = (val: any, suffix = ''): string => {
  if (val === null || val === undefined || val === '') return FALLBACK_VALUE;
  return `${val}${suffix}`;
};

/**
 * Formats numeric values to fixed decimal places.
 */
export const fmtFloat = (val: any, decimals = 2, suffix = ''): string => {
  const n = parseFloat(val);
  if (isNaN(n)) return FALLBACK_VALUE;
  return `${n.toFixed(decimals)}${suffix}`;
};

/**
 * Converts seconds into a human-readable uptime string (Hh Mm Ss).
 */
export const fmtUptime = (seconds: string | number | undefined): string => {
  const s = parseInt(String(seconds), 10);
  if (isNaN(s)) return FALLBACK_VALUE;
  
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  parts.push(`${sec}s`);
  
  return `${s}s (~${parts.join(' ')})`;
};

/**
 * Returns only the most significant time unit (e.g. ~55d, ~12h).
 */
export const fmtUptimeShort = (seconds: string | number | undefined): string => {
  const s = parseInt(String(seconds), 10);
  if (isNaN(s)) return FALLBACK_VALUE;
  
  if (s < 60) return `${s}s`;
  if (s < 3600) return `~${Math.floor(s / 60)}m`;
  if (s < 86400) return `~${Math.floor(s / 3600)}h`;
  return `~ ${Math.floor(s / 86400)}d`;
};

/**
 * Formats an ISO date string into a localized string.
 */
export const fmtDate = (iso: string | undefined): string => {
  if (!iso) return FALLBACK_VALUE;
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'INVALID DATE';
    return date.toLocaleString();
  } catch {
    return 'INVALID DATE';
  }
};
