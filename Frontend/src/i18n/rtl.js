/**
 * @file rtl.js
 * @description RTL/LTR language detection and document direction utilities.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Returns true if the given language code is RTL.
 * @param {string} language - The language code to check.
 * @returns {boolean} True if RTL.
 */
export const isRTL = (language) => RTL_LANGUAGES.includes(language);

/**
 * Sets the document's dir and lang attributes based on the active language.
 * Called automatically on i18n languageChanged events (see config.js).
 * @param {string} language - The language code to apply.
 */
export const setDocumentDirection = (language) => {
  const direction = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
};
