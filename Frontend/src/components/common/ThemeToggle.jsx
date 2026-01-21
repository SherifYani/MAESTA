/**
 * @file ThemeToggle.jsx
 * @description Compact theme toggle component with lucide-react icons
 * @author Sherif Talaat
 * @version 1.2.0
 * @date 2026-01-18
 */

import { useEffect, useState } from "react";
import { Sun, Moon, Loader2 } from "lucide-react";
import styles from "./ThemeToggle.module.css";

/**
 * ThemeToggle Component (Compact)
 * @description Provides theme switching functionality with lucide-react icons
 * @returns {JSX.Element} The rendered theme toggle button
 */
function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemPreference;

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newTheme = theme === "dark" ? "light" : "dark";

    // Animation duration
    setTimeout(() => {
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem("theme", newTheme);

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent("themeChange", { detail: newTheme })
      );
      setIsAnimating(false);
    }, 300);
  };

  if (!isMounted) {
    return (
      <button
        className={`${styles.button} ${styles.compact} ${styles.loading}`}
        aria-label="Loading theme"
        disabled>
        <Loader2 className={`${styles.icon} ${styles.spinner}`} size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${styles.button} ${styles.compact} ${
        isAnimating ? styles.animating : ""
      }`}
      title={`Current mode: ${theme} mode`}
      data-theme={theme}
      disabled={isAnimating}>
      {theme === "dark" ? (
        <Sun className={styles.icon} size={20} />
      ) : (
        <Moon className={styles.icon} size={20} />
      )}
    </button>
  );
}

export default ThemeToggle;
