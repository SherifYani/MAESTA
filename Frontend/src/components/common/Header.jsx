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
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Header.module.css';

// Navigation configuration moved inside the component to use the translation hook.

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
  const { t } = useTranslation(['common', 'dashboard', 'jobs', 'gigs']);

  const NAV_GUEST = [
    { name: t('jobs:jobs', 'Jobs'),         path: '/jobs' },
    { name: t('gigs:gigs', 'Gigs'),         path: '/gigs' },
    { name: t('common:aiAssistant', 'AI Assistant'), path: '/ai/cv-builder' },
  ];

  const NAV_AUTHENTICATED = {
    jobseeker: [
      { name: t('common:dashboard', 'Dashboard'),    path: '/dashboard' },
      { name: t('jobs:jobs', 'Jobs'),         path: '/jobs' },
      { name: t('jobs:applications', 'Applications'), path: '/dashboard/applications' },
      { name: t('gigs:gigs', 'Gigs'),         path: '/gigs' },
      { name: t('common:messages', 'Messages'),     path: '/chat' },
    ],
    freelancer: [
      { name: t('common:dashboard', 'Dashboard'), path: '/dashboard' },
      { name: t('gigs:findGigs', 'Find Gigs'), path: '/gigs' },
      { name: t('gigs:myGigs', 'My Gigs'),   path: '/gigs/manage' },
      { name: t('gigs:proposals', 'Proposals'), path: '/gigs/manage' },
      { name: t('common:messages', 'Messages'),  path: '/chat' },
    ],
    company: [
      { name: t('common:dashboard', 'Dashboard'),       path: '/dashboard' },
      { name: t('jobs:postJob', 'Post Job'),        path: '/jobs/post' },
      { name: t('dashboard:company.myJobs', 'My Jobs'),         path: '/dashboard/published-jobs' },
      { name: t('dashboard:company.candidates', 'Candidates'),      path: '/dashboard/applicants' },
      { name: t('common:messages', 'Messages'),        path: '/chat' },
    ],
  };

  const DROPDOWN_ITEMS = [
    { icon: <LayoutDashboard size={15} />, label: t('common:dashboard', 'Dashboard'), to: '/dashboard' },
    { icon: <User size={15} />,          label: t('common:profile', 'Profile'),   to: '/dashboard/profile' },
    { icon: <Settings size={15} />,      label: t('common:settings', 'Settings'),  to: '/dashboard/profile/edit' },
  ];

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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

            <LanguageSwitcher />
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
                        {DROPDOWN_ITEMS.map((item) => (
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
                        {t('common:logout', 'Log Out')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest Auth Buttons */
              <div className={styles['header__auth-group']}>
                <Link to="/login"    className={styles['header__login-btn']}>{t('common:login', 'Log In')}</Link>
                <Link to="/register" className={styles['header__signup-btn']}>{t('common:register', 'Sign Up')}</Link>
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
              <span className={styles['header__mobile-theme-label']}>Language</span>
              <LanguageSwitcher />
            </div>
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
                {t('common:logout', 'Log Out')}
              </button>
            ) : (
              <div className={styles['header__mobile-auth']}>
                <Link to="/login"    className={styles['header__mobile-login-btn']}>{t('common:login', 'Log In')}</Link>
                <Link to="/register" className={styles['header__mobile-signup-btn']}>{t('common:register', 'Sign Up')}</Link>
              </div>
            )}
          </footer>

        </div>
      </div>
    </>
  );
};

export default Header;
