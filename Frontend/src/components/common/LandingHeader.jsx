/**
 * @file LandingHeader.jsx
 * @description Responsive header component for the landing page with navigation and theme toggle
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 18-1-2026
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 18-1-2026
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import styles from "./LandingHeader.module.css";

/**
 * Landing page header with responsive navigation
 * @returns {JSX.Element} The rendered header
 */
const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
    { id: "jobs", label: "Jobs" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Reviews" },
    { id: "pricing", label: "Pricing" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <a
            href="#hero"
            className={styles.logoLink}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              closeMenu();
            }}>
            {/* <img
              src="../../../public/favicons/favicon-192x192.png"
              alt="MAESTA Logo"
              className={styles.logoImage}
              width="192"
              height="192"
              loading="eager"
            /> */}
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
              <li key={link.id} className={styles.navItem}>
                <Link
                  className={styles.navLink}
                  onClick={() => scrollToSection(link.id)}
                  to={link.id === "dashboard" ? "/dashboard" : ""}>
                  {link.label}
                </Link>
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

          <div className={styles.themeToggle}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
