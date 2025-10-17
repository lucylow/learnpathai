// src/utils/i18nHelpers.ts

/**
 * Convert number to Arabic numerals (Eastern Arabic)
 * Used for RTL languages like Arabic
 */
export const toArabicNumerals = (num: number | string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => {
    const digit = parseInt(d);
    return isNaN(digit) ? d : arabicNumerals[digit];
  }).join('');
};

/**
 * Format number according to locale
 */
export const formatNumber = (
  num: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (error) {
    return num.toString();
  }
};

/**
 * Format date according to locale
 */
export const formatDate = (
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    return date.toString();
  }
};

/**
 * Format percentage according to locale
 */
export const formatPercentage = (
  value: number,
  locale: string,
  decimals: number = 0
): string => {
  return formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format duration in minutes to human-readable format
 */
export const formatDuration = (
  minutes: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  if (minutes < 60) {
    return t('learning.minutes', { count: minutes });
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return t('learning.hours', { count: hours });
  }
  
  return `${t('learning.hours', { count: hours })} ${t('learning.minutes', { count: remainingMinutes })}`;
};

/**
 * Get text direction for a language
 */
export const getTextDirection = (langCode: string): 'ltr' | 'rtl' => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
};

/**
 * Check if language is RTL
 */
export const isRTL = (langCode: string): boolean => {
  return getTextDirection(langCode) === 'rtl';
};

