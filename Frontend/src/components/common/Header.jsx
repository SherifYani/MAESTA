/**
 * @file Header.jsx
 * @description Unified, responsive header component for MAESTA.
 *              Adapts to authentication status and user roles.
 *              Renders guest navigation or role-specific authenticated links.
 *              Supports dark mode, mobile drawer, notification bell,
 *              avatar dropdown, and scroll-aware glassmorphism effect.
 * @author Sherif Talaat
 * @date 2026-04-29
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Bell, User,
  Search, LogOut, Settings, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

/* ─── Navigation Configurations ─────────────────────────────────────────── */

/** Guest (unauthenticated) navigation links. */
const NAV_GUEST = [
  { name: 'Jobs',     path: '/jobs' },
  { name: 'Gigs',     path: '/gigs' },
  { name: 'AI Tools', path: '/ai' },
];

/**
 * Authenticated navigation links per user role.
 * Common links (Dashboard, Messages) are included in each role.
 */
const NAV_AUTHENTICATED = {
  jobseeker: [
    { name: 'Dashboard',    path: '/dashboard' },
    { name: 'Jobs',         path: '/jobs' },
    { name: 'Applications', path: '/dashboard/applications' },
    { name: 'Gigs',         path: '/gigs' },
    { name: 'Messages',     path: '/chat' },
  ],
  freelancer: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Find Gigs', path: '/gigs' },
    { name: 'My Gigs',   path: '/gigs/manage' },
    { name: 'Proposals', path: '/gigs/proposals' },
    { name: 'Messages',  path: '/chat' },
  ],
  company: [
    { name: 'Dashboard',  path: '/dashboard' },
    { name: 'Post Job',   path: '/jobs/post' },
    { name: 'My Jobs',    path: '/dashboard/published-jobs' },
    { name: 'Candidates', path: '/dashboard/applicants' },
    { name: 'Messages',   path: '/chat' },
  ],
  employer: [
    { name: 'Dashboard',  path: '/dashboard' },
    { name: 'Post Job',   path: '/jobs/post' },
    { name: 'My Jobs',    path: '/dashboard/published-jobs' },
    { name: 'Candidates', path: '/dashboard/applicants' },
    { name: 'Messages',   path: '/chat' },
  ],
  client: [
    { name: 'Dashboard',   path: '/dashboard' },
    { name: 'Gigs',        path: '/gigs' },
    { name: 'My Projects', path: '/gigs/projects' },
    { name: 'Talent',      path: '/dashboard/talent' },
    { name: 'Messages',    path: '/chat' },
  ],
  admin: [
    { name: 'Dashboard',  path: '/dashboard' },
    { name: 'Users',      path: '/dashboard/users' },
    { name: 'Jobs',       path: '/dashboard/jobs' },
    { name: 'Moderation', path: '/dashboard/moderation' },
  ],
};

/** Avatar dropdown menu items. */
const DROPDOWN_ITEMS = [
  { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <User size={15} />,            label: 'Profile',   to: '/dashboard/profile' },
  { icon: <Settings size={15} />,        label: 'Settings',  to: '/dashboard/account' },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Unified site-wide header component.
 * Automatically adjusts navigation based on authentication state and user role.
 * @returns {JSX.Element} The rendered header.
 */
const Header = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAuthenticated, logout, userAvatar } = useAuth();
  const { unreadCount } = useNotifications();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [avatarOpen,  setAvatarOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const avatarRef = useRef(null);

  // Normalise role string coming from the API (e.g. "JobSeeker" → "jobseeker")
  const role     = (user?.role || user?.userType || '').toLowerCase();
  const navLinks = isAuthenticated
    ? (NAV_AUTHENTICATED[role] || NAV_AUTHENTICATED.jobseeker)
    : NAV_GUEST;
  const dropdownItems = role === 'admin'
    ? DROPDOWN_ITEMS.filter((item) => item.label !== 'Profile')
    : DROPDOWN_ITEMS;

  /* ── Scroll listener — activates glassmorphism backdrop ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile menu & dropdown on route change ── */
  useEffect(() => {
    setMobileOpen(false);
    setAvatarOpen(false);
  }, [location.pathname]);

  /* ── Close avatar dropdown when clicking outside ── */
  useEffect(() => {
    const onClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  /* ── Close drawers on Escape key ── */
  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setAvatarOpen(false);
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  /**
   * Handles the search form submission.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  }, [searchQuery, navigate]);

  /**
   * Logs the user out and redirects to the homepage.
   */
  const handleLogout = useCallback(() => {
    setAvatarOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  /* ── Helpers ── */
  const isActive = (path) => location.pathname === path;

  const headerClass = [
    styles.header,
    scrolled ? styles['header--scrolled'] : '',
  ].filter(Boolean).join(' ');

  const drawerClass = [
    styles.header__drawer,
    mobileOpen ? styles['header__drawer--open'] : '',
  ].filter(Boolean).join(' ');

  const overlayClass = [
    styles.header__overlay,
    mobileOpen ? styles['header__overlay--open'] : '',
  ].filter(Boolean).join(' ');

  /* ── Render ── */
  return (
    <>
      {/* ── Main Header Bar ── */}
      <header className={headerClass} role="banner">
        <div className={styles.header__inner}>

          {/* Logo */}
          <Link
            to="/"
            className={styles.header__logo}
            aria-label="MAESTA — Go to homepage"
          >
            MAESTA
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.header__nav} aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={[
                  styles['header__nav-link'],
                  isActive(link.path) ? styles['header__nav-link--active'] : '',
                ].filter(Boolean).join(' ')}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className={styles.header__actions}>

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className={styles['header__icon-btn']}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <Bell size={18} aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className={styles.header__badge} aria-hidden="true">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar & Dropdown */}
                <div className={styles['header__avatar-wrap']} ref={avatarRef}>
                  <button
                    type="button"
                    className={styles['header__avatar-btn']}
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    aria-expanded={avatarOpen}
                    aria-haspopup="true"
                    aria-label="Open user menu"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt=""
                        className={styles['header__avatar-img']}
                      />
                    ) : (
                      <User size={16} aria-hidden="true" />
                    )}
                  </button>

                  {avatarOpen && (
                    <div
                      className={styles.header__dropdown}
                      role="menu"
                      aria-label="User menu"
                    >
                      <div className={styles['header__dropdown-header']}>
                        <p className={styles['header__dropdown-name']}>
                          {user?.name || 'User'}
                        </p>
                        <p className={styles['header__dropdown-email']}>
                          {user?.email}
                        </p>
                      </div>

                      <div className={styles['header__dropdown-body']}>
                        {dropdownItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={[
                              styles['header__dropdown-item'],
                              isActive(item.to) ? styles['header__dropdown-item--active'] : ''
                            ].filter(Boolean).join(' ')}
                            role="menuitem"
                            onClick={() => setAvatarOpen(false)}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <hr className={styles['header__dropdown-divider']} />

                      <button
                        type="button"
                        className={styles['header__dropdown-logout']}
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} aria-hidden="true" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest Auth Buttons */
              <div className={styles['header__auth-group']}>
                <Link to="/login"    className={styles['header__login-btn']}>Log In</Link>
                <Link to="/register" className={styles['header__signup-btn']}>Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className={styles.header__hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="header-drawer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen
              ? <X size={22} aria-hidden="true" />
              : <Menu size={22} aria-hidden="true" />
            }
          </button>

        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      <div
        className={overlayClass}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Drawer ── */}
      <div
        id="header-drawer"
        className={drawerClass}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        <div className={styles['header__drawer-body']}>

          {/* Drawer Top */}
          <div className={styles['header__drawer-top']}>
            <span className={styles.header__logo} aria-hidden="true">MAESTA</span>
            <button
              type="button"
              className={styles.header__hamburger}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Search */}
          <form
            className={styles['header__search-form']}
            onSubmit={handleSearch}
            role="search"
          >
            <Search
              size={16}
              className={styles['header__search-icon']}
              aria-hidden="true"
            />
            <input
              type="search"
              className={styles['header__search-input']}
              placeholder="Search MAESTA…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
          </form>

          {/* Mobile User Info (authenticated only) */}
          {isAuthenticated && (
            <div className={styles['header__mobile-user']}>
              <div className={styles['header__avatar-btn']} aria-hidden="true">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className={styles['header__avatar-img']} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className={styles['header__mobile-user-info']}>
                <p className={styles['header__mobile-user-name']}>{user?.name || 'User'}</p>
                <p className={styles['header__mobile-user-email']}>{user?.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Nav Links */}
          <nav className={styles['header__mobile-nav']} aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={styles['header__mobile-nav-link']}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Drawer Footer */}
          <footer className={styles['header__mobile-footer']}>
            <div className={styles['header__mobile-theme']}>
              <span className={styles['header__mobile-theme-label']}>Theme</span>
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                className={styles['header__mobile-logout']}
                onClick={handleLogout}
              >
                <LogOut size={16} aria-hidden="true" />
                Log Out
              </button>
            ) : (
              <div className={styles['header__mobile-auth']}>
                <Link to="/login"    className={styles['header__mobile-login-btn']}>Log In</Link>
                <Link to="/register" className={styles['header__mobile-signup-btn']}>Sign Up</Link>
              </div>
            )}
          </footer>

        </div>
      </div>
    </>
  );
};

export default Header;
