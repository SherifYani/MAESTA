/**
 * @file DashboardSidebar.jsx
 * @description Sidebar navigation component with responsive drawer behavior
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-01-19
 */

import { useContext, useCallback, memo } from "react";
import {
  Briefcase,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import { DashboardContext } from "./DashboardLayout";
import {
  ROLE_NAVIGATION,
  ROLE_DISPLAY_NAMES,
} from "../config/dashboard.config";
import styles from "./DashboardSidebar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * Sidebar component for dashboard navigation with mobile drawer
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open
 * @param {function} props.onToggle - Function to toggle sidebar
 * @param {boolean} props.isMobile - Whether current view is mobile
 * @returns {JSX.Element} The rendered sidebar
 */
const DashboardSidebar = memo(({ isOpen, onToggle, isMobile }) => {
  const { currentRole, setCurrentRole } = useContext(DashboardContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Get navigation for current role - memoize this if needed
  const roleNavigation = ROLE_NAVIGATION[currentRole] || ROLE_NAVIGATION.client;

  /**
   * Handle role change
   * @param {string} role - New role to switch to
   */
  const handleRoleChange = useCallback(
    (role) => {
      setCurrentRole(role);
      // After changing role, you might want to navigate to the dashboard home
      // or the first item in the new role's navigation
      const newRoleNav = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.client;
      if (newRoleNav.length > 0) {
        navigate(newRoleNav[0].path);
      }
    },
    [setCurrentRole, navigate],
  );

  /*
   * Handle navigation link click
   */
  const handleNavClick = useCallback(() => {
    if (isMobile && isOpen && onToggle) {
      // Use setTimeout to defer state update and avoid "Maximum update depth exceeded"
      setTimeout(() => {
        onToggle();
      }, 0);
    }
  }, [isMobile, isOpen, onToggle]);

  /**
   * Handle toggle button click
   */
  const handleToggleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onToggle) {
        // Use setTimeout to allow current render cycle to finish
        // This prevents potential "Maximum update depth exceeded" errors
        setTimeout(() => {
          onToggle();
        }, 0);
      }
    },
    [onToggle],
  );

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed} ${isMobile ? styles.mobile : ""
        }`}>
      <div className={styles.sidebarHeader}>
        <Link to="/" className={styles.brand} onClick={handleNavClick}>
          <h1 className={styles.brandTitle}>MAESTA</h1>
          <span className={styles.brandSubtitle}>Dashboard</span>
        </Link>

        {/* Mobile: X button to close, Desktop: Chevron to collapse */}
        <button
          className={styles.toggleButton}
          onClick={handleToggleClick}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          type="button">
          {isMobile ?
            <X className={styles.toggleIcon} size={20} />
            : isOpen ?
              <ChevronLeft className={styles.toggleIcon} size={20} />
              : <ChevronRight className={styles.toggleIcon} size={20} />}
        </button>
      </div>

      <nav className={styles.navigation}>
        {/* Main Navigation */}
        <div className={styles.navSection}>
          <h3 className={styles.navSectionTitle}>Main</h3>
          <ul className={styles.navList}>
            {roleNavigation.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id} className={styles.navItem}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${isActive ? styles.active : ""
                      }`}
                    onClick={handleNavClick}>
                    <IconComponent className={styles.navIcon} size={20} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
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
            <span className={styles.avatarText}>ST</span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Sherif Talaat</span>
            <span className={styles.userRole}>
              {ROLE_DISPLAY_NAMES[currentRole] || "Client"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
});

DashboardSidebar.displayName = "DashboardSidebar";

export default DashboardSidebar;
