/**
 * @file DashboardHeader.jsx
 * @description Header component for the MAESTA dashboard with search, notifications, and theme toggle
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import { useContext } from "react";
import { Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";
import { DashboardContext } from "./DashboardLayout";
import styles from "./DashboardHeader.module.css";

/**
 * Dashboard header component with navigation controls
 * @returns {JSX.Element} The rendered dashboard header
 */
const DashboardHeader = () => {
  const { currentRole, isDarkTheme, toggleTheme } =
    useContext(DashboardContext);

  // Format role name for display
  const getFormattedRole = (role) => {
    const roleMap = {
      client: "Client",
      company: "Company",
      freelancer: "Freelancer",
      jobseeker: "Job Seeker",
      admin: "Administrator",
    };
    return roleMap[role] || "Client";
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.breadcrumb}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <span className={styles.roleBadge}>
            {getFormattedRole(currentRole)}
          </span>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search jobs, proposals, or users..."
            className={styles.searchInput}
          />
        </div>

        {/* Theme Toggle */}
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={
            isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
          }>
          {isDarkTheme ? (
            <Sun className={styles.themeIcon} size={20} />
          ) : (
            <Moon className={styles.themeIcon} size={20} />
          )}
        </button>

        {/* Notifications */}
        <div className={styles.notificationContainer}>
          <button className={styles.iconButton} aria-label="Notifications">
            <Bell className={styles.notificationIcon} size={20} />
            <span className={styles.notificationBadge}>3</span>
          </button>
        </div>

        {/* User Profile */}
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <span className={styles.avatarText}>ST</span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Sherif Talaat</span>
            <span className={styles.userRole}>
              {getFormattedRole(currentRole)}
            </span>
          </div>
          <ChevronDown className={styles.chevronIcon} size={16} />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
