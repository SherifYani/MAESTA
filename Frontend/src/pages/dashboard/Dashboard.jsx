/**
 * @file Dashboard.jsx
 * @description Main dashboard component that renders role-specific content
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2026-1-20
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 * @changes:-
 * - Updated to use proper test data integration for all roles
 * - Simplified role-specific dashboard rendering
 */

import { useContext } from "react";
import { DashboardContext } from "./layout/DashboardLayout";
import { getCompleteDashboardData, getJobSeekerDashboardData } from "./config/dashboard.config";

// Import all role-specific dashboards
import ClientDashboard from "./tabs/client/ClientDashboard";
import CompanyDashboard from "./tabs/company/CompanyDashboard";
import FreelancerDashboard from "./tabs/freelancer/FreelancerDashboard";
import JobseekerDashboard from "./tabs/jobseeker/JobseekerDashboard";
import AdminDashboard from "./tabs/admin/AdminDashboard";

import styles from "./dashboard.module.css";

/**
 * Main dashboard component that conditionally renders role-specific content
 * @returns {JSX.Element} The rendered dashboard content
 */
const Dashboard = () => {
  const { currentRole } = useContext(DashboardContext);

  /**
   * Get dashboard data based on current role
   */
  const getDashboardData = () => {
    switch (currentRole) {
      case "jobseeker":
        return getJobSeekerDashboardData();
      default:
        return getCompleteDashboardData(currentRole);
    }
  };

  const dashboardData = getDashboardData();

  /**
   * Render dashboard content based on current role
   * @returns {JSX.Element} Role-specific dashboard component
   */
  const renderDashboardContent = () => {
    switch (currentRole) {
      case "client":
        return <ClientDashboard data={dashboardData} />;
      case "company":
        return <CompanyDashboard data={dashboardData} />;
      case "freelancer":
        return <FreelancerDashboard data={dashboardData} />;
      case "jobseeker":
        return <JobseekerDashboard data={dashboardData} />;
      case "admin":
        return <AdminDashboard data={dashboardData} />;
      default:
        return <div className={styles.roleNotFound}>Role not found</div>;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;