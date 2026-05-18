/**
 * @file RegistrationPage.jsx
 * @description Main registration page with 3D background and welcome content
 * @author Shahd Mohay
 * @version 2.2.0
 * @date 11-10-2025
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import { ArrowLeft, Sparkles, TrendingUp, Users } from "lucide-react";
import "../../styles/pages/registration-page.css";
import "../../styles/globals.css";
import RegisterForm from "../../components/forms/RegisterForm";
import EnhancedBubble from "../../components/EnhancedBubble";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { useTranslation } from "react-i18next";

/**
 * RegistrationPage Component
 * @description Main registration page component with 3D background and form
 * @returns {JSX.Element} The rendered registration page
 */
function RegistrationPage() {
  const { t } = useTranslation(['auth']);

  const features = [
    { icon: Sparkles, text: t('auth:aiMatching', "AI-Powered Matching") },
    { icon: TrendingUp, text: t('auth:careerGrowth', "Career Growth Tools") },
    { icon: Users, text: t('auth:globalNetwork', "Global Network") },
  ];

  /**
   * Navigates back to the previous page.
   */
  const handleBackNavigation = () => {
    window.history.back();
  };

  return (
    <div>
      <Header />
      <div className="registration-page">
        <button
          className="registration-page__back-button"
          aria-label="Go back"
          onClick={handleBackNavigation}>
          <ArrowLeft size={20} />
        </button>

        <div className="registration-page__left-section">
          <div className="register__canvas">
            <EnhancedBubble />
          </div>

          <div className="registration-page__welcome-content">
            <div className="registration-page__badge">
              <Sparkles size={14} className="registration-page__badge-icon" />
              <span>{t('auth:trustedBadge', 'Trusted by 100K+ professionals')}</span>
            </div>

            <h1 className="registration-page__welcome-title">
              {t('auth:transformYour', 'Transform Your')}
              <br />
              <span className="registration-page__gradient-text">
                {t('auth:careerJourney', 'Career Journey')}
              </span>
            </h1>

            <p className="registration-page__welcome-description">
              {t('auth:registerDescription', 'Join the next generation of professionals. Connect with opportunities, grow your network, and unlock your full potential.')}
            </p>

            <div className="registration-page__features-list">
              {features.map((feature, index) => (
                <div key={index} className="registration-page__feature-item">
                  <div className="registration-page__feature-icon">
                    <feature.icon size={18} />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="registration-page__right-section">
          <RegisterForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegistrationPage;
