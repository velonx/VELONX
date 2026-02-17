/**
 * Date Helper Utilities
 * 
 * Provides date formatting functions for the application.
 */

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 * 
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted relative time string
 */
export function formatDistanceToNow(
  date: Date,
  options: { addSuffix?: boolean } = {}
): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    const { value, unit } = getTimeUnit(absDiff);
    return options.addSuffix ? `in ${value} ${unit}` : `${value} ${unit}`;
  }

  const { value, unit } = getTimeUnit(diffInSeconds);
  return options.addSuffix ? `${value} ${unit} ago` : `${value} ${unit}`;
}

/**
 * Get the appropriate time unit and value for a given number of seconds
 */
function getTimeUnit(seconds: number): { value: number; unit: string } {
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (seconds < minute) {
    return { value: Math.max(1, seconds), unit: seconds === 1 ? 'second' : 'seconds' };
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return { value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' };
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return { value: hours, unit: hours === 1 ? 'hour' : 'hours' };
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return { value: days, unit: days === 1 ? 'day' : 'days' };
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return { value: weeks, unit: weeks === 1 ? 'week' : 'weeks' };
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    return { value: months, unit: months === 1 ? 'month' : 'months' };
  } else {
    const years = Math.floor(seconds / year);
    return { value: years, unit: years === 1 ? 'year' : 'years' };
  }
}

/**
 * Format a date as a localized date string
 * 
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date as a localized date and time string
 * 
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
): string {
  return date.toLocaleDateString('en-US', options);
}
