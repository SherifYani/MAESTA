/**
 * @file registration-page.jsx
 * @description Centered Hero Redesign — Registration page with interactive 3D EnhancedBubble backdrop
 * @author Shahd Mohay / Sherif Talaat
 * @version 3.0.0
 * @date 2026-09-28
 */

import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import "../../styles/pages/registration-page.css";
import "../../styles/globals.css";
import RegisterForm from "../../components/forms/RegisterForm";
import EnhancedBubble from "../../components/EnhancedBubble";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

/**
 * RegistrationPage Component
 * @description Main registration page component with centered 3D bubble and floating glass form
 * @returns {JSX.Element} The rendered registration page
 */
export default function RegistrationPage() {
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, index) => ({
        id: `registration-star-${index}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: Math.random() * 0.7 + 0.3,
      })),
    []
  );

  /**
   * Navigates back to the previous page.
   */
  const handleBackNavigation = () => {
    window.history.back();
  };

  return (
    <div className="registration-page-wrapper">
      <Header />
      <main className="registration-page">
        <div className="registration-page__stars" aria-hidden="true">
          {stars.map((star) => (
            <div
              key={star.id}
              className="registration-page__star"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        {/* Back Button */}
        <button
          className="registration-page__back-button"
          aria-label="Go back to previous page"
          onClick={handleBackNavigation}
          type="button">
          <ArrowLeft size={20} />
        </button>

        {/* Centered 3D EnhancedBubble Canvas */}
        <div className="registration-page__bubble-backdrop" aria-hidden="true">
          <EnhancedBubble />
        </div>

        {/* Centered Registration Card Container */}
        <div className="registration-page__centered-content">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
