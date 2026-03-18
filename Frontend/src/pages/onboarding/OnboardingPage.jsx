/**
 * @file CompanyMemberOnboarding.jsx
 * @description Company member onboarding page with company search and database alignment
 * @author Sherif Talaat
 * @version 1.4.0
 * @date 24-10-2025
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */
import JobSeekerOnboarding from "./JobSeekerOnboarding";
// import FreelancerOnboarding from "./FreelancerOnboarding";
import CompanyOnboarding from "./CompanyOnBoarding";
import { ArrowLeft } from "lucide-react";
import AuthHeader from "../../components/common/AuthHeader";
import Footer from "../../components/common/Footer";
// import CompanyMemberOnboarding from "./CompanyMemberOnBoarding";

export default function OnboardingPage() {
  const userRole = localStorage.getItem("userRole");

  const renderForm = () => {
    switch (userRole) {
      case "jobseeker":
        return <JobSeekerOnboarding />;
      // case "freelancer":
      //   return <FreelancerOnboarding />;
      case "employer":
        return <CompanyOnboarding />;
      // case "CompanyMember":
      //     return <CompanyMemberOnboarding />;
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Role Not Selected</h2>
            <p>Please go back and select a role during registration.</p>
          </div>
        );
    }
  };

  /**
   * Navigates back to the previous page.
   */
  const handleBackNavigation = () => {
    window.history.back();
  };

  return (
    <div>
      <AuthHeader />
      <div className="min-h-screen">
        <button
          className="registration-page__back-button"
          aria-label="Go back"
          onClick={handleBackNavigation}>
          <ArrowLeft size={20} />
        </button>
        {/* {renderForm()} */}
        {/* <CompanyOnboarding /> */}
        <JobSeekerOnboarding />
        {/* <FreelancerOnboarding /> */}
        {/* <CompanyOnboarding /> */}
      </div>
      <Footer />
    </div>
  );
}
