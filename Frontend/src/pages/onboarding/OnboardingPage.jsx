/**
 * @file OnboardingPage.jsx
 * @description Role-based onboarding router — renders JobSeekerOnboarding or CompanyOnBoarding
 *              based on the userRole stored in localStorage during registration Step 1.
 * @author Sherif Talaat
 * @version 1.5.0
 * @date 24-10-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Re-enabled role-based renderForm() switch (was hardcoded to JobSeekerOnboarding).
 */
import JobSeekerOnboarding from "./JobSeekerOnboarding";
// import FreelancerOnboarding from "./FreelancerOnboarding";
import CompanyOnboarding from "./CompanyOnBoarding";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
// import CompanyMemberOnboarding from "./CompanyMemberOnBoarding";

export default function OnboardingPage() {
  const { user } = useAuth();
  
  // Try localStorage first (from register flow), fall back to user object (if refreshed/logged in)
  const storedRole = localStorage.getItem("userRole");
  const userRole = storedRole || (user?.role === 'company' ? 'employer' : user?.role);

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
      <Header />
      <div className="min-h-screen">
        <button
          className="registration-page__back-button"
          aria-label="Go back"
          onClick={handleBackNavigation}>
          <ArrowLeft size={20} />
        </button>
        {renderForm()}
      </div>
      <Footer />
    </div>
  );
}
