/**
 * @file DashboardSidebar.jsx
 * @description Sidebar navigation component for the dashboard
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2025-12-19
 */

import React, { useContext } from "react";
import {
  Home,
  Briefcase,
  Users,
  Send,
  DollarSign,
  UserPlus,
  Settings,
  BarChart,
  Mail,
  FolderOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { DashboardContext } from "./DashboardLayout";
import {
  ROLE_NAVIGATION,
  HEADER_NAVIGATION,
  ROLE_DISPLAY_NAMES,
} from "../config/dashboard.config";
import styles from "./DashboardSidebar.module.css";

/**
 * Role switcher configuration - maps roles to icons
 */
const ROLE_SWITCHER_CONFIG = [
  { id: "client", label: "Client", icon: Briefcase },
  { id: "freelancer", label: "Freelancer", icon: UserPlus },
  { id: "company", label: "Company", icon: Users },
  { id: "jobseeker", label: "Job Seeker", icon: Briefcase },
];

/**
 * Sidebar component for dashboard navigation
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open
 * @param {function} props.onToggle - Function to toggle sidebar
 * @returns {JSX.Element} The rendered sidebar
 */
const DashboardSidebar = ({ isOpen, onToggle }) => {
  const { currentRole, setCurrentRole } = useContext(DashboardContext);

  // Get navigation for current role
  const roleNavigation = ROLE_NAVIGATION[currentRole] || ROLE_NAVIGATION.client;

  /**
   * Handle role change
   * @param {string} role - New role to switch to
   */
  const handleRoleChange = (role) => {
    setCurrentRole(role);
  };

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>TalentPro</h1>
          <span className={styles.brandSubtitle}>Dashboard</span>
        </div>
        <button
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}>
          {isOpen ? (
            <ChevronLeft className={styles.toggleIcon} size={20} />
          ) : (
            <ChevronRight className={styles.toggleIcon} size={20} />
          )}
        </button>
      </div>

      <nav className={styles.navigation}>
        {/* Main Navigation */}
        <div className={styles.navSection}>
          <h3 className={styles.navSectionTitle}>Main</h3>
          <ul className={styles.navList}>
            {roleNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className={styles.navItem}>
                  <a href={item.path} className={styles.navLink}>
                    <IconComponent className={styles.navIcon} size={20} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Settings & Help */}
        <div className={styles.navSection}>
          <h3 className={styles.navSectionTitle}>Settings</h3>
          <ul className={styles.navList}>
            {HEADER_NAVIGATION.filter(
              (item) =>
                item.id === "settings" ||
                item.id === "help" ||
                item.id === "logout"
            ).map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className={styles.navItem}>
                  <a href="#" className={styles.navLink}>
                    <IconComponent className={styles.navIcon} size={20} />
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.hasBadge && (
                      <span className={styles.navBadge}>•</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <span className={styles.avatarText}>JD</span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>John Doe</span>
            <span className={styles.userRole}>
              {ROLE_DISPLAY_NAMES[currentRole] || "Client"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
