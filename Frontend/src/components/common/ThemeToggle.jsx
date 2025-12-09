/**
 * @file ThemeToggle.jsx
 * @description Compact theme toggle component with icons only
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 14-10-2025
 */

import { useEffect, useState } from "react";

/**
 * ThemeToggle Component (Compact)
 * @description Provides theme switching functionality with icon-only button
 * @returns {JSX.Element} The rendered theme toggle button
 */
function ThemeToggle() {
    const [theme, setTheme] = useState("light");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const savedTheme = localStorage.getItem("theme");
        const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const initialTheme = savedTheme || systemPreference;

        setTheme(initialTheme);
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("theme", newTheme);
    };

    if (!isMounted) {
        return (
            <button
                className="theme-toggle__button theme-toggle__button--compact theme-toggle__button--loading"
                aria-label="Loading theme"
                disabled
            >
                <i className="fa-solid fa-spinner fa-spin theme-toggle__icon"></i>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle__button theme-toggle__button--compact"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Current mode: ${theme} mode`}
        >
            <i className={`theme-toggle__icon ${theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"}`} />
        </button>
    );
}

export default ThemeToggle;