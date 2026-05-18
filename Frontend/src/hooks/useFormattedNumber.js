/**
 * @file useFormattedNumber.js
 * @description Custom hook for locale-aware number/currency formatting using native Intl.NumberFormat.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */
import { useTranslation } from 'react-i18next';

/**
 * Returns a formatting function that formats a number using the current language locale.
 * @returns {function(number, Intl.NumberFormatOptions=): string} Formatter function.
 *
 * @example
 * const formatNumber = useFormattedNumber();
 * formatNumber(5000);                                              // → "5,000" in en
 * formatNumber(5000, { style: 'currency', currency: 'USD' });     // → "$5,000.00" in en
 */
export function useFormattedNumber() {
  const { i18n } = useTranslation();
  return (value, options = {}) =>
    new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language || 'en', options).format(value);
}

export default useFormattedNumber;
