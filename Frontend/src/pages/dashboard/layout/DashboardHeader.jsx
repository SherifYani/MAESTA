/**
 * @file DashboardHeader.jsx
 * @description Modern header component with glassmorphism design and dynamic data
 * @author Sherif Talaat
 * @version 4.0.0
 * @date 2026-01-18
 *
 * @last-modified-by [Your Name]
 * @last-modified-date 2026-01-18
 */

import { useContext, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Settings,
  Calendar,
  FileText,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { DashboardContext } from "./DashboardLayout";
import ThemeToggle from "../../../components/common/ThemeToggle";
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
  notifications = [],
  userMenuItems = [],
  onSearch = () => { },
  onNotificationClick = () => { },
  onLogout = () => { },
  onProfileClick = () => { },
}) => {
  const { currentRole, toggleSidebar, isMobile } = useContext(DashboardContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize default values to prevent re-creation on every render
  const defaultUser = useMemo(() => ({
    id: "1",
    name: "Sherif Talaat",
    email: "sherif@maesta.com",
    avatarInitials: "ST",
    role: currentRole,
  }), [currentRole]);

  // Default user menu items
  const defaultUserMenuItems = useMemo(() => [
    {
      id: "profile",
      label: "Profile Settings",
      icon: "User",
      href: "/profile",
    },
    { id: "account", label: "Account", icon: "Settings", href: "/account" },
    { id: "billing", label: "Billing", icon: "CreditCard", href: "/billing" },
    { id: "divider", type: "divider" },
    { id: "help", label: "Help & Support", icon: "HelpCircle", href: "/help" },
    {
      id: "logout",
      label: "Logout",
      icon: "LogOut",
      href: "#",
      isLogout: true,
    },
  ], []);

  // Default notifications with stable timestamps for this session
  const defaultNotifications = useMemo(() => [
    {
      id: "1",
      title: "New Proposal Received",
      message: "You have received a new proposal for your project",
      type: "info",
      timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      read: false,
      actionUrl: "/proposals",
      icon: "FileText",
    },
    {
      id: "2",
      title: "Project Deadline",
      message: "Your project deadline is approaching in 3 days",
      type: "warning",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false,
      actionUrl: "/projects",
      icon: "Calendar",
    },
    {
      id: "3",
      title: "Payment Processed",
      message: "Your payment has been processed successfully",
      type: "success",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: true,
      actionUrl: "/payments",
      icon: "CreditCard",
    },
  ], []);

  // Initialize state with props or defaults
  const [localNotifications, setLocalNotifications] = useState(() =>
    notifications.length > 0 ? notifications : defaultNotifications
  );

  // Update local state when props change
  useEffect(() => {
    if (notifications.length > 0) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  // Derived state for unread count
  const unreadCount = localNotifications.filter((n) => !n.read).length;

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

  /**
   * Format relative time
   * @param {Date} date - Date to format
   * @returns {string} Formatted relative time
   */
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
      FileText: FileText,
      Calendar: Calendar,
    };
    return iconMap[iconName] || null;
  };

  /**
   * Handle notification click
   * @param {Object} notification - Notification object
   */
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }

    onNotificationClick(notification);

    // Close dropdown if it's a click action
    if (notification.actionUrl) {
      setShowNotifications(false);
    }
  };

  /**
   * Handle menu item click
   * @param {Object} item - Menu item
   */
  const handleMenuItemClick = (item) => {
    if (item.isLogout) {
      onLogout();
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

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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

        {/* Notifications with Dropdown */}
        <div className={styles.notificationContainer}>
          <button
            className={`${styles.iconButton} ${showNotifications ? styles.active : ""
              }`}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""
              }`}
            onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className={styles.notificationIcon} size={20} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <h3 className={styles.dropdownTitle}>Notifications</h3>
                <div className={styles.dropdownActions}>
                  {unreadCount > 0 && (
                    <button
                      className={styles.markAllButton}
                      onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                  <button
                    className={styles.closeDropdown}
                    onClick={() => setShowNotifications(false)}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.notificationList}>
                {localNotifications.length > 0 ? (
                  localNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${notification.read ? styles.read : ""
                        }`}
                      onClick={() => handleNotificationClick(notification)}>
                      <div
                        className={`${styles.notificationDot} ${styles[`dot-${notification.type}`]
                          }`}></div>
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationTitle}>
                          {notification.title}
                        </p>
                        <p className={styles.notificationText}>
                          {notification.message}
                        </p>
                        <span className={styles.notificationTime}>
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyNotifications}>
                    <Bell size={32} />
                    <p>No notifications</p>
                  </div>
                )}
              </div>

              {localNotifications.length > 0 && (
                <div className={styles.dropdownFooter}>
                  <button
                    className={styles.viewAllButton}
                    onClick={() => {
                      // Navigate to notifications page
                      window.location.href = "/notifications";
                      setShowNotifications(false);
                    }}>
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
                    <a
                      key={item.id}
                      href={item.href}
                      className={`${styles.menuItem} ${item.isLogout ? styles.logout : ""
                        }`}
                      onClick={(e) => {
                        if (item.isLogout) {
                          e.preventDefault();
                          handleMenuItemClick(item);
                        }
                      }}>
                      {IconComponent && <IconComponent size={18} />}
                      {item.label}
                    </a>
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
