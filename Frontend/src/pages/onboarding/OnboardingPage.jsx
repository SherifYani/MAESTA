import JobSeekerOnboarding from "./JobSeekerOnboarding";
// import FreelancerOnboarding from "./FreelancerOnboarding";
import CompanyOnboarding from "./CompanyOnBoarding";
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

  return (
    <div className="min-h-screen">
      {/* {renderForm()} */}
      <JobSeekerOnboarding />
      {/* <FreelancerOnboarding /> */}
      {/* <CompanyOnboarding /> */}
    </div>
  );
}
