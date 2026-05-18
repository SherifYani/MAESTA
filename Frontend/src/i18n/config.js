/**
 * @file config.js
 * @description i18next configuration.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly', // Always use 'en' instead of 'en-US'
    debug: process.env.NODE_ENV === 'development',

    supportedLngs: ['en', 'ar', 'fr'],

    interpolation: {
      escapeValue: true,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'jobs', 'gigs', 'profile', 'errors', 'validation'],

    react: {
      useSuspense: true,
    },

    missingKeyHandler: (lngs, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing key: "${ns}:${key}" for lang [${lngs}]`);
      }
    },
  });

export default i18n;
