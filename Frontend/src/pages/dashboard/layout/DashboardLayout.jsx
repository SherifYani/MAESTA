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

  // Get theme from body class (following your globals.css structure)
  const [isDarkTheme, setIsDarkTheme] = useState(
    document.body.classList.contains("dark")
  );

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

  // Load saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard-theme");
    if (savedTheme === "dark") {
      setIsDarkTheme(true);
      document.body.classList.add("dark");
    }
  }, []);

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
          }`}>
          <DashboardHeader />
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;
