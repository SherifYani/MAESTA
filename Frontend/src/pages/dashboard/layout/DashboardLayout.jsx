/**
 * @file DashboardLayout.jsx
 * @description Main layout component for the TalentPro dashboard
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import React, { useState, createContext, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";

/**
 * Dashboard context for managing theme and role state
 * @type {React.Context}
 */
export const DashboardContext = createContext();

/**
 * Main dashboard layout component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The rendered dashboard layout
 */
const DashboardLayout = ({ children }) => {
  const [currentRole, setCurrentRole] = useState("client");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [themeInitialized, setThemeInitialized] = useState(false);

  /**
   * Initialize theme from localStorage or system preference
   * @function
   */
  const initializeTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("dashboard-theme");

    if (savedTheme) {
      // Use saved preference
      const isDark = savedTheme === "dark";
      setIsDarkTheme(isDark);
      if (isDark) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    } else {
      // No saved preference, check system preference
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkTheme(systemPrefersDark);
      if (systemPrefersDark) {
        document.body.classList.add("dark");
      }
      // Save system preference for consistency
      localStorage.setItem(
        "dashboard-theme",
        systemPrefersDark ? "dark" : "light"
      );
    }

    setThemeInitialized(true);
  };

  /**
   * Toggle between light and dark themes
   * @function
   */
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);

    if (newTheme) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // Save theme preference to localStorage
    localStorage.setItem("dashboard-theme", newTheme ? "dark" : "light");
  };

  // Load theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Optional: Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      // Only change if user hasn't set a preference
      const savedTheme = localStorage.getItem("dashboard-theme");
      if (!savedTheme) {
        setIsDarkTheme(e.matches);
        if (e.matches) {
          document.body.classList.add("dark");
        } else {
          document.body.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Prevent flash of wrong theme by not rendering until theme is initialized
  if (!themeInitialized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // In the return section of DashboardLayout.jsx:
  return (
    <DashboardContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        isDarkTheme,
        toggleTheme,
      }}>
      <div className={styles.dashboardLayout}>
        <DashboardSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div
          className={`${styles.mainContent} ${
            sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
          }`}
          style={{
            marginLeft: sidebarOpen ? "270px" : "50px",
            width: sidebarOpen ? "calc(100% - 270px)" : "100%",
          }}>
          <DashboardHeader />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;
