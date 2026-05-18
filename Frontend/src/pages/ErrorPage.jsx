/**
 * @file Error404.jsx
 * @description Modern 404 error page with animations and navigation options
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-01-19
 */

import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./ErrorPage.module.css";

/**
 * Error 404 Page Component
 * @description Displays a user-friendly 404 error page with navigation options
 * @returns {JSX.Element} The rendered 404 error page
 */
const ErrorPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);

  /**
   * Navigate to home page
   * @function
   */
  const handleGoHome = () => {
    navigate("/");
  };

  /**
   * Navigate back to previous page
   * @function
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  /**
   * Navigate to search page
   * @function
   */
  const handleSearch = () => {
    navigate("/search");
  };

  /**
   * Navigate to contact/support
   * @function
   */
  const handleContact = () => {
    navigate("/contact");
  };

  return (
    <div className={styles.errorContainer}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* 404 Number with Animation */}
        <div className={styles.errorNumber}>
          <span className={styles.four}>4</span>
          <span className={styles.zero}>0</span>
          <span className={styles.fourTwo}>4</span>
        </div>

        {/* Error Message */}
        <h1 className={styles.title}>{t('common:error404.title', "Page Not Found")}</h1>
        <p className={styles.description}>
          {t('common:error404.description', "Oops! The page you're looking for seems to have wandered off. Don't worry, we'll help you find your way back.")}
        </p>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleGoHome}>
            <Home size={20} />
            <span>{t('common:error404.goHome', "Go Home")}</span>
          </button>

          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={handleGoBack}>
            <ArrowLeft size={20} />
            <span>{t('common:error404.goBack', "Go Back")}</span>
          </button>
        </div>

        {/* Additional Links */}
        <div className={styles.links}>
          <button className={styles.link} onClick={handleSearch}>
            <Search size={18} />
            <span>{t('common:error404.search', "Search")}</span>
          </button>

          <span className={styles.separator}>•</span>

          <button className={styles.link} onClick={handleContact}>
            <Mail size={18} />
            <span>{t('common:error404.contactSupport', "Contact Support")}</span>
          </button>
        </div>

        {/* Helpful Suggestions */}
        <div className={styles.suggestions}>
          <h3 className={styles.suggestionsTitle}>{t('common:error404.suggestionsTitle', "You might be looking for:")}</h3>
          <ul className={styles.suggestionsList}>
            <li>
              <a href="/dashboard" className={styles.suggestionLink}>
                {t('common:error404.dashboard', "Dashboard")}
              </a>
            </li>
            <li>
              <a href="/jobs" className={styles.suggestionLink}>
                {t('common:error404.browseJobs', "Browse Jobs")}
              </a>
            </li>
            <li>
              <a href="/profile" className={styles.suggestionLink}>
                {t('common:error404.yourProfile', "Your Profile")}
              </a>
            </li>
            <li>
              <a href="/help" className={styles.suggestionLink}>
                {t('common:error404.helpCenter', "Help Center")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>{t('common:footer.copyright', "© {{year}} MAESTA. All rights reserved.", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default ErrorPage;
