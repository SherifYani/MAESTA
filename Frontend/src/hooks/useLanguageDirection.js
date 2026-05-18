/**
 * @file useLanguageDirection.js
 * @description Custom hook: returns current language direction ('ltr' | 'rtl')
 * and reactively updates the document <html> dir attribute on language change.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL, setDocumentDirection } from '../i18n/rtl';

/**
 * Returns current language direction and syncs it with document.
 * @returns {{ direction: 'ltr' | 'rtl', isRTL: boolean, language: string }} Language info.
 */
export function useLanguageDirection() {
  const { i18n } = useTranslation();
  const rawLang = i18n.resolvedLanguage || i18n.language || 'en';
  const language = rawLang.split('-')[0];
  const rtl = isRTL(language);

  useEffect(() => {
    setDocumentDirection(language);
  }, [language]);

  return {
    direction: rtl ? 'rtl' : 'ltr',
    isRTL: rtl,
    language,
  };
}

export default useLanguageDirection;
