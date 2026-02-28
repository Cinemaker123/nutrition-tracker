// Date formatting utilities

/**
 * Format a date string to "Feb 27" format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get a date range string for display (e.g., "Feb 21 - Feb 27")
 */
export function getDateRange(endDate: string, days: number): string {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return `${formatDate(start.toISOString().split('T')[0])} - ${formatDate(endDate)}`;
}

/**
 * Get yesterday's date as YYYY-MM-DD
 */
export function getYesterday(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Get an array of dates going back N days from end date
 */
export function getDatesRange(endDate: string, days: number): string[] {
  const dates: string[] = [];
  const end = new Date(endDate);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates.reverse();
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
