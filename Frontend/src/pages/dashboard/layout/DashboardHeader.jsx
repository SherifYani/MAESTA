/**
 * @file DashboardHeader.jsx
 * @description Modern header component with glassmorphism design and dynamic data
 * @author Sherif Talaat
 * @version 4.0.0
 * @date 2026-01-18
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-01-18
 */

import { useContext, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Menu,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { DashboardContext } from "./DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import ThemeToggle from "../../../components/common/ThemeToggle";
import { NotificationBell } from "../../../components/notifications";
import styles from "./DashboardHeader.module.css";

/**
 * Dashboard header component with dynamic data and API readiness
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user data
 * @param {Array} props.notifications - Array of notifications
 * @param {Array} props.userMenuItems - User menu items
 * @param {Function} props.onSearch - Search callback
 * @param {Function} props.onNotificationClick - Notification click callback
 * @param {Function} props.onLogout - Logout callback
 * @param {Function} props.onProfileClick - Profile click callback
 * @returns {JSX.Element} The rendered dashboard header
 */
const DashboardHeader = ({
  user = null,
  userMenuItems = [],
  onSearch = () => { },
  onLogout = () => { },
  onProfileClick = () => { },
}) => {
  const { currentRole, toggleSidebar, isMobile } = useContext(DashboardContext);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultUser = useMemo(() => ({
    id: authUser?.id || user?.id || null,
    name: authUser?.name || user?.name || authUser?.email || user?.email || "User",
    email: authUser?.email || user?.email || "",
    avatarInitials: authUser?.avatarInitials ||
      (authUser?.name ? authUser.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U"),
    role: authUser?.role || user?.role || currentRole,
  }), [authUser, user, currentRole]);



  /**
   * Format role name for display
   * @param {string} role - The role identifier
   * @returns {string} Formatted role name
   */
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

  // Default user menu items
  const defaultUserMenuItems = useMemo(() => [
    {
      id: "settings",
      label: "Settings",
      icon: "Settings",
      href: "/dashboard/account",
    },
    { id: "billing", label: "Billing", icon: "CreditCard", href: "/dashboard/billing" },
    { id: "divider", type: "divider" },
    { id: "help", label: "Help & Support", icon: "HelpCircle", href: "/dashboard/help" },
    {
      id: "logout",
      label: "Logout",
      icon: "LogOut",
      href: "#",
      isLogout: true,
    },
  ], []);

  /**
   * Get icon component by name
   * @param {string} iconName - Name of the icon
   * @returns {React.Component} Icon component
   */
  const getIconComponent = (iconName) => {
    const iconMap = {
      User: User,
      Settings: Settings,
      CreditCard: CreditCard,
      HelpCircle: HelpCircle,
      LogOut: LogOut,
    };
    return iconMap[iconName] || null;
  };

  /**
   * Handle logout — calls AuthContext.logout() then navigates to login
   */
  const handleMenuItemClick = (item) => {
    if (item.isLogout) {
      logout();
      navigate('/login', { replace: true });
      setShowUserMenu(false);
      return;
    }

    if (item.href) {
      navigate(item.href);
    } else if (onProfileClick) {
      onProfileClick(item);
    }

    setShowUserMenu(false);
  };

  /**
   * Handle search
   * @param {React.FormEvent} e - Form event
   */
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };



  // Current user data
  const currentUser = user || defaultUser;
  const activeMenuItems =
    userMenuItems.length > 0 ? userMenuItems : defaultUserMenuItems;

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {/* Mobile menu button */}
        {isMobile && (
          <button
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Toggle menu">
            <Menu className={styles.menuIcon} size={24} />
          </button>
        )}

        <div className={styles.breadcrumb}>
          <Link to="/dashboard" className={styles.pageTitle}>Dashboard</Link>
          <span className={styles.roleBadge}>
            {getFormattedRole(currentUser.role || currentRole)}
          </span>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Modern Search Bar with Glass Effect */}
        {/* Uncomment when search functionality is needed */}
        {false && (
          <form
            className={`${styles.searchContainer} ${searchFocused ? styles.focused : ""
              }`}
            onSubmit={handleSearch}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search jobs, proposals, users..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </form>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* User Profile with Dropdown */}
        <div className={styles.userProfileContainer}>
          <div
            className={`${styles.userProfile} ${showUserMenu ? styles.active : ""
              }`}
            onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className={styles.userAvatar}>
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarText}>
                  {currentUser.avatarInitials ||
                    currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                </span>
              )}
            </div>
            {!isMobile && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{currentUser.name}</span>
                <span className={styles.userRole}>
                  {getFormattedRole(currentUser.role || currentRole)}
                </span>
              </div>
            )}
            <ChevronDown
              className={`${styles.chevronIcon} ${showUserMenu ? styles.rotated : ""
                }`}
              size={16}
            />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.userDropdownHeader}>
                <div className={styles.userAvatarLarge}>
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className={styles.avatarImageLarge}
                    />
                  ) : (
                    <span>
                      {currentUser.avatarInitials ||
                        currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.userDropdownInfo}>
                  <p className={styles.userDropdownName}>{currentUser.name}</p>
                  <p className={styles.userDropdownEmail}>
                    {currentUser.email}
                  </p>
                  <span className={styles.userDropdownRole}>
                    {getFormattedRole(currentUser.role || currentRole)}
                  </span>
                </div>
              </div>

              <div className={styles.userDropdownMenu}>
                {activeMenuItems.map((item) => {
                  if (item.type === "divider") {
                    return (
                      <div key={item.id} className={styles.menuDivider}></div>
                    );
                  }

                  const IconComponent = item.icon
                    ? getIconComponent(item.icon)
                    : null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.menuItem} ${item.isLogout ? styles.logout : ""
                        }`}
                      onClick={() => handleMenuItemClick(item)}>
                      {IconComponent && <IconComponent size={18} />}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
