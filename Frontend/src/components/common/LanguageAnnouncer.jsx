/**
 * @file LanguageAnnouncer.jsx
 * @description Visually hidden aria-live region that announces language changes
 * to screen readers.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const hiddenStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Renders an invisible region that speaks when language changes.
 * @returns {JSX.Element} The rendered announcer.
 */
export function LanguageAnnouncer() {
  const { i18n, t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = t('a11y.languageChanged', { lang: i18n.language });
    }
  }, [i18n.language, t]);

  return (
    <div
      ref={ref}
      aria-live="polite"
      aria-atomic="true"
      style={hiddenStyle}
    />
  );
}

export default LanguageAnnouncer;
