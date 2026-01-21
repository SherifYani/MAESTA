/**
 * @file AuthHeader.jsx
 * @description Header component for login and register pages
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 17-1-2026
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 17-1-2026
 */

import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import styles from "./AuthHeader.module.css";

/**
 * Header for authentication pages (login/register)
 * @returns {JSX.Element} The rendered header
 */
const AuthHeader = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logoLink}>
            {/* <img
              src="../../../public/favicons/favicon-192x192.png"
              alt="MAESTA Logo"
              className={styles.logoImage}
              width="192"
              height="192"
              loading="eager"
            /> */}
            <span className={styles.logoText}>MAESTA</span>
          </Link>
        </div>

        {/* Actions Section */}
        <div className={styles.actions}>
          <div className={styles.authButtons}>
            {isRegisterPage ? (
              <Link
                to="/login"
                className={`${styles.authButton} ${styles.authButtonLogin}`}
                aria-label="Go to login page">
                Login
              </Link>
            ) : isLoginPage ? (
              <Link
                to="/register"
                className={`${styles.authButton} ${styles.authButtonRegister}`}
                aria-label="Go to registration page">
                Sign Up
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${styles.authButton} ${styles.authButtonLogin}`}
                  aria-label="Go to login page">
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${styles.authButton} ${styles.authButtonRegister}`}
                  aria-label="Go to registration page">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className={styles.themeToggle}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
