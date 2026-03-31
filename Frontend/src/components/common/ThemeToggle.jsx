/**
 * @file ThemeToggle.jsx
 * @description Compact theme toggle component with lucide-react icons
 * @author Sherif Talaat
 * @version 1.2.0
 * @date 2026-01-18
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Monitor, Check, Loader2 } from "lucide-react";
import styles from "./ThemeToggle.module.css";

const THEMES = [
  { id: 'gold', name: 'Gold', color: '#b8945f' },
  { id: 'rose', name: 'Rose', color: '#b87878' },
  { id: 'forest', name: 'Forest', color: '#6b9e72' },
  { id: 'slate', name: 'Slate', color: '#5a7fa8' },
  { id: 'ink', name: 'Ink', color: '#3d5c9e' },
  { id: 'graphite', name: 'Graphite', color: '#707070' },
];

/**
 * ThemeToggle Component (Multi-Theme Popover)
 * @description Provides a popover to switch modes (Light/Dark/System) and themes
 * @returns {JSX.Element} The rendered theme toggle button and dropdown
 */
function ThemeToggle() {
  const [mode, setMode] = useState("system"); // light, dark, system
  const [colorTheme, setColorTheme] = useState("gold"); // gold, rose, forest, slate, ink, graphite
  const [resolvedMode, setResolvedMode] = useState("light"); // the actual mode being rendered (light or dark)

  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialization and application of theme/mode
  useEffect(() => {
    setIsMounted(true);

    // Check backwards compatibility with old "theme" localstorage key
    const oldTheme = localStorage.getItem("theme");
    let initialMode = localStorage.getItem("theme-mode") || (oldTheme && oldTheme !== 'system' ? oldTheme : null) || "system";
    let initialColor = localStorage.getItem("theme-color") || "gold";

    setMode(initialMode);
    setColorTheme(initialColor);
    applyTheme(initialMode, initialColor);

    // Listen for system theme changes if we are in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (mode === "system") {
        setResolvedMode(e.matches ? "dark" : "light");
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  const applyTheme = (newMode, newTheme) => {
    const root = document.documentElement;

    // Apply Mode (Light/Dark)
    let actualMode = newMode;
    if (newMode === "system") {
      actualMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    root.classList.toggle("dark", actualMode === "dark");
    setResolvedMode(actualMode);

    // Apply Color Theme classes
    const allThemeClasses = THEMES.map(t => `theme-${t.id}`);
    root.classList.remove(...allThemeClasses);

    if (newTheme !== "gold") {
      root.classList.add(`theme-${newTheme}`);
    }

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { mode: newMode, theme: newTheme } })
    );
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
    // Remove legacy key
    localStorage.removeItem("theme");
    applyTheme(newMode, colorTheme);
  };

  const handleThemeChange = (newTheme) => {
    setColorTheme(newTheme);
    localStorage.setItem("theme-color", newTheme);
    applyTheme(mode, newTheme);
  };

  if (!isMounted) {
    return (
      <div className={styles.wrapper}>
        <button
          className={`${styles.button} ${styles.compact} ${styles.loading}`}
          aria-label="Loading theme"
          disabled>
          <Loader2 className={`${styles.icon} ${styles.spinner}`} size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.button} ${styles.compact} ${isOpen ? styles.activeState : ''}`}
        aria-label="Toggle theme settings"
        aria-expanded={isOpen}
      >
        {resolvedMode === "dark" ? (
          <Moon className={styles.icon} size={20} />
        ) : (
          <Sun className={styles.icon} size={20} />
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Mode Selection */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Appearance</div>
            <div className={styles.modeContainer}>
              <button
                className={`${styles.modeButton} ${mode === 'light' ? styles.active : ''}`}
                onClick={() => handleModeChange('light')}
                aria-label="Light Mode"
              >
                {mode === "light" ? <Sun size={18} className={styles.modeIcon} />
                  : <></>}
                <span>Light</span>
              </button>
              <button
                className={`${styles.modeButton} ${mode === 'dark' ? styles.active : ''}`}
                onClick={() => handleModeChange('dark')}
                aria-label="Dark Mode"
              >
                {mode === "dark" ?
                  <Moon size={18} className={styles.modeIcon} />
                  : <></>}
                <span>Dark</span>
              </button>
              <button
                className={`${styles.modeButton} ${mode === 'system' ? styles.active : ''}`}
                onClick={() => handleModeChange('system')}
                aria-label="System Mode"
              >
                {mode === "system" ?
                  <Monitor size={18} className={styles.modeIcon} />
                  : <></>}
                <span>System</span>
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Theme Selection */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Color Theme</div>
            <div className={styles.themeGrid}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.themeOption} ${colorTheme === t.id ? styles.activeTheme : ''}`}
                  onClick={() => handleThemeChange(t.id)}
                  aria-label={`Select ${t.name} theme`}
                >
                  <div className={styles.themePreview}>
                    <div
                      className={styles.themeBubble}
                      style={{ backgroundColor: t.color, borderColor: colorTheme === t.id ? t.color : 'transparent' }}
                    />
                    <span className={styles.themeName}>{t.name}</span>
                  </div>
                  {colorTheme === t.id && <Check size={16} className={styles.themeCheckIcon} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
