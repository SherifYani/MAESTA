/**
 * @file LanguageSwitcher.jsx
 * @description Dropdown component for switching the application language.
 * Persists selection to localStorage (via i18next-browser-languagedetector)
 * and syncs document direction via useLanguageDirection.
 * @author Sherif Talaat
 * @date 2026-05-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-05-18
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'Arabic',  nativeLabel: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'French',  nativeLabel: 'Français', flag: '🇫🇷' },
];

/**
 * A reusable Language Switcher dropdown component.
 * @returns {JSX.Element} The rendered dropdown.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { direction } = useLanguageDirection();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Safely extract the base language code (e.g. 'en' from 'en-US')
  const rawLang = i18n.resolvedLanguage || i18n.language || 'en';
  const currentLang = rawLang.split('-')[0];
  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  /**
   * Change language and close menu.
   * @param {string} code - Language code.
   */
  const handleSelect = async (code) => {
    await i18n.changeLanguage(code);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      ref={menuRef}
      className={styles.switcher}
      dir={direction}
      data-testid="language-switcher"
    >
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.nativeLabel}`}
        id="language-switcher-btn"
      >
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.label}>{current.nativeLabel}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▾</span>
      </button>

      {open && (
        <ul
          className={styles.dropdown}
          role="listbox"
          aria-labelledby="language-switcher-btn"
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === currentLang}
              className={`${styles.option} ${lang.code === currentLang ? styles.active : ''}`}
              onClick={() => handleSelect(lang.code)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(lang.code)}
              tabIndex={0}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSwitcher;
