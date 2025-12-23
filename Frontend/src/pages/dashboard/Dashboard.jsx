/**
 * @file Dashboard.jsx
 * @description Main dashboard component that renders role-specific content
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import { useContext } from "react";
import { DashboardContext } from "./layout/DashboardLayout";
import { getCompleteDashboardData } from "./config/dashboard.config"; // ADD THIS

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

  // Get data for current role
  const dashboardData = getCompleteDashboardData(currentRole);

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
        return <ClientDashboard data={dashboardData} />;
    }
  };
  return (
    <div className={styles.dashboardContainer}>{renderDashboardContent()}</div>
  );
};

export default Dashboard;
