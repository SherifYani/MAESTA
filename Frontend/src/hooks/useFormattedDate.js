/**
 * @file useFormattedDate.js
 * @description Custom hook for locale-aware date formatting using native Intl.DateTimeFormat.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */
import { useTranslation } from 'react-i18next';

/**
 * Returns a formatting function that formats a Date/string using the current language locale.
 * @returns {function(Date|string, Intl.DateTimeFormatOptions=): string} Formatter function.
 *
 * @example
 * const formatDate = useFormattedDate();
 * formatDate('2026-05-18'); // → "May 18, 2026" in en, "18 mai 2026" in fr
 */
export function useFormattedDate() {
  const { i18n } = useTranslation();
  return (date, options = {}) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage || i18n.language || 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(new Date(date));
}

export default useFormattedDate;
