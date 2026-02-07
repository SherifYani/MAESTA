/**
 * @file LandingHeader.jsx
 * @description Responsive header component for the landing page with navigation and theme toggle
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 07-02-2026
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 07-02-2026
 */
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import styles from "./LandingHeader.module.css";

/**
 * Landing page header with responsive navigation
 * @returns {JSX.Element} The rendered header
 */
const LandingHeader = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  /* Ref to store multiple dropdown elements */
  const dropdownRefs = useRef({});

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside of ALL dropdown containers
      const isOutside = Object.values(dropdownRefs.current).every(
        (ref) => !ref || !ref.contains(event.target)
      );

      if (isOutside) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to section on landing page
  const scrollToSection = (sectionId) => {
    closeMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Navigation links for landing page
  const navLinks = [
    {
      id: "jobs",
      label: "Jobs",
      isDropdown: true,
      items: [
        { label: "Browse Jobs", path: "/jobs" },
        { label: "Saved Jobs", path: "/jobs/saved" },
        { label: "Post a Job", path: "/jobs/post" },
      ]
    },
    {
      id: "gigs",
      label: "Gigs",
      isDropdown: true,
      items: [
        { label: "Browse Gigs", path: "/gigs" },
        { label: "My Gigs", path: "/gigs/manage" },
        { label: "Post a Gig", path: "/gigs/new" },
      ]
    },
    {
      id: "ai",
      label: "AI",
      isDropdown: true,
      items: [
        { label: "Smart Search", path: "/ai/smart-search" },
        { label: "CV Builder", path: "/ai/cv-builder" },
        { label: "Candidate Analysis", path: "/ai/candidate-analysis" },
        { label: "Post AI Job", path: "/ai/post-job" },
      ]
    },
    { id: "plans", label: "Plans", path: "/subscription/plans" },
    { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <a
            href="/"
            className={styles.logoLink}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              window.scrollTo({ top: 0, behavior: "smooth" });
              closeMenu();
            }}>
            <span className={styles.logoText}>MAESTA</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={styles.menuToggle}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}>
          <span className={styles.menuToggleLine}></span>
          <span className={styles.menuToggleLine}></span>
          <span className={styles.menuToggleLine}></span>
        </button>

        {/* Navigation Section */}
        <nav
          className={`${styles.navSection} ${isMenuOpen ? styles.navOpen : ""}`}
          aria-label="Main navigation">
          <ul className={styles.navMenu}>
            {navLinks.map((link) => (
              <li
                key={link.id}
                className={styles.navItem}
                ref={(el) => {
                  if (link.isDropdown) {
                    dropdownRefs.current[link.id] = el;
                  }
                }}
              >
                {link.isDropdown ? (
                  <div className={styles.dropdownContainer}>
                    <button
                      className={`${styles.navLink} ${activeDropdown === link.id ? styles.active : ''}`}
                      onClick={() => toggleDropdown(link.id)}
                      aria-expanded={activeDropdown === link.id}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <span className={styles.dropdownArrow}>▼</span>
                    </button>
                    <div className={`${styles.dropdownMenu} ${activeDropdown === link.id ? styles.show : ''}`}>
                      {link.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={styles.dropdownItem}
                          onClick={closeMenu}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : link.isScroll ? (
                  <span
                    className={styles.navLink}
                    onClick={() => scrollToSection(link.id)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    className={styles.navLink}
                    to={link.path}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Auth Buttons inside navigation for mobile */}
          <div className={styles.authButtons}>
            <Link
              to="/login"
              className={`${styles.authButton} ${styles.authButtonLogin}`}
              onClick={closeMenu}
              aria-label="Go to login page">
              Login
            </Link>
            <Link
              to="/register"
              className={`${styles.authButton} ${styles.authButtonRegister}`}
              onClick={closeMenu}
              aria-label="Go to registration page">
              Get Started
            </Link>
          </div>

          {/* Theme Toggle inside navigation for mobile */}
          <div className={styles.mobileThemeToggle}>
            <ThemeToggle />
          </div>
        </nav>

        {/* Desktop Actions Section */}
        <div className={styles.actions}>
          <div className={styles.authButtons}>
            <Link
              to="/login"
              className={`${styles.authButton} ${styles.authButtonLogin}`}
              onClick={closeMenu}
              aria-label="Go to login page">
              Login
            </Link>
            <Link
              to="/register"
              className={`${styles.authButton} ${styles.authButtonRegister}`}
              onClick={closeMenu}
              aria-label="Go to registration page">
              Get Started
            </Link>
          </div>

          {/* Theme Toggle desktop */}
          <div className={styles.themeToggle}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
