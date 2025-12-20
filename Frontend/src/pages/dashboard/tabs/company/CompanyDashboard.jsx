/**
 * @file CompanyDashboard.jsx
 * @description Company-specific dashboard with metrics, activities, and job posts
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 *
 */

import { useContext } from "react";
import { DashboardContext } from "../../layout/DashboardLayout";
import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import RecentJobPosts from "../../components/RecentJobPosts";
import PendingActions from "../../components/PendingActions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  ROLES,
  ROLE_METRICS,
  SAMPLE_ACTIVITIES,
  SAMPLE_PENDING_ACTIONS,
  SAMPLE_JOB_POSTS,
} from "../../config/dashboard.config";
import { Plus, Users, BarChart, Building } from "lucide-react";
import styles from "./CompanyDashboard.module.css";

/**
 * CompanyDashboard component
 * @returns {JSX.Element} Rendered company dashboard
 */
const CompanyDashboard = () => {
  const { currentRole } = useContext(DashboardContext);

  // Get role-specific data
  const metrics = ROLE_METRICS[ROLES.COMPANY]?.metrics || [];
  const activities = SAMPLE_ACTIVITIES[ROLES.COMPANY] || [];
  const pendingActions = SAMPLE_PENDING_ACTIONS[ROLES.COMPANY] || [];
  const jobPosts = SAMPLE_JOB_POSTS[ROLES.COMPANY] || [];

  const handleActionToggle = (id, completed) => {
    console.log(
      `Action ${id} toggled to ${completed ? "completed" : "pending"}`
    );
  };

  const handleActionClick = (id) => {
    console.log(`Action ${id} clicked`);
  };

  const handleJobClick = (jobId) => {
    console.log(`Job ${jobId} clicked`);
  };

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
  };

  return (
    <div className={styles.companyDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Company Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your team, hiring pipeline, and business growth
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-job")}>
            Create Job Post
          </Button>
          <Button
            variant="outline"
            icon={Users}
            onClick={() => handleQuickAction("manage-team")}>
            Team Management
          </Button>
        </div>
      </header>

      {/* Metrics Section */}
      <section className={styles.metricsSection}>
        <StatsGrid metrics={metrics} />
      </section>

      {/* Quick Stats Cards */}
      <div className={styles.quickStats}>
        <Card className={styles.quickStatCard}>
          <div className={styles.quickStatContent}>
            <Building className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>42</h3>
              <p className={styles.quickStatLabel}>Total Employees</p>
            </div>
          </div>
        </Card>

        <Card className={styles.quickStatCard}>
          <div className={styles.quickStatContent}>
            <BarChart className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>$2.1M</h3>
              <p className={styles.quickStatLabel}>Annual Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <Card
            title="Recent Activity"
            subtitle="Team updates and company notifications"
            className={styles.activityCard}>
            <RecentActivity activities={activities} title="" />
          </Card>

          <Card
            title="Pending Actions"
            subtitle="HR and management tasks"
            className={styles.actionsCard}>
            <PendingActions
              actions={pendingActions}
              onActionToggle={handleActionToggle}
              onActionClick={handleActionClick}
              title=""
            />
          </Card>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          <Card
            title="Active Job Posts"
            subtitle="Current hiring opportunities"
            footer={
              <Button variant="ghost" size="small">
                View All Posts
              </Button>
            }
            className={styles.jobsCard}>
            <RecentJobPosts
              jobs={jobPosts}
              onJobClick={handleJobClick}
              title=""
            />
          </Card>

          <Card
            title="Team Distribution"
            subtitle="Department-wise employee count"
            className={styles.teamCard}>
            <div className={styles.teamContent}>
              <div className={styles.teamDepartment}>
                <span className={styles.departmentLabel}>Engineering</span>
                <div className={styles.departmentBar}>
                  <div className={styles.barFill} style={{ width: "45%" }} />
                </div>
                <span className={styles.departmentCount}>19</span>
              </div>
              <div className={styles.teamDepartment}>
                <span className={styles.departmentLabel}>Sales</span>
                <div className={styles.departmentBar}>
                  <div className={styles.barFill} style={{ width: "25%" }} />
                </div>
                <span className={styles.departmentCount}>10</span>
              </div>
              <div className={styles.teamDepartment}>
                <span className={styles.departmentLabel}>Marketing</span>
                <div className={styles.departmentBar}>
                  <div className={styles.barFill} style={{ width: "15%" }} />
                </div>
                <span className={styles.departmentCount}>6</span>
              </div>
              <div className={styles.teamDepartment}>
                <span className={styles.departmentLabel}>Operations</span>
                <div className={styles.departmentBar}>
                  <div className={styles.barFill} style={{ width: "15%" }} />
                </div>
                <span className={styles.departmentCount}>7</span>
              </div>
            </div>
          </Card>

          <Card
            title="Hiring Timeline"
            subtitle="Average time to hire by department"
            className={styles.timelineCard}>
            <div className={styles.timelineContent}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineLabel}>Tech Roles</span>
                <span className={styles.timelineValue}>21 days</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineLabel}>Sales</span>
                <span className={styles.timelineValue}>14 days</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineLabel}>Marketing</span>
                <span className={styles.timelineValue}>18 days</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineLabel}>Management</span>
                <span className={styles.timelineValue}>28 days</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
