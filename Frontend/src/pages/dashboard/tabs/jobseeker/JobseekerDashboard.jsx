/**
 * @file JobseekerDashboard.jsx
 * @description Jobseeker-specific dashboard with metrics, activities, and job posts
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-12
 *
 * @last-modified-by [Your Name]
 * @last-modified-date 2025-12-12
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
import { Search, Target, Award, Bell } from "lucide-react";
import styles from "./JobseekerDashboard.module.css";

/**
 * JobseekerDashboard component
 * @returns {JSX.Element} Rendered jobseeker dashboard
 */
const JobseekerDashboard = () => {
  const { currentRole } = useContext(DashboardContext);

  // Get role-specific data
  const metrics = ROLE_METRICS[ROLES.JOBSEEKER]?.metrics || [];
  const activities = SAMPLE_ACTIVITIES[ROLES.JOBSEEKER] || [];
  const pendingActions = SAMPLE_PENDING_ACTIONS[ROLES.JOBSEEKER] || [];
  const jobPosts = SAMPLE_JOB_POSTS[ROLES.JOBSEEKER] || [];

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
    <div className={styles.jobseekerDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Job Seeker Dashboard</h1>
          <p className={styles.subtitle}>
            Track applications, interviews, and job recommendations
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Search}
            onClick={() => handleQuickAction("search-jobs")}>
            Search Jobs
          </Button>
          <Button
            variant="outline"
            icon={Bell}
            onClick={() => handleQuickAction("set-alerts")}>
            Set Alerts
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
            <Target className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>87%</h3>
              <p className={styles.quickStatLabel}>Profile Match</p>
            </div>
          </div>
        </Card>

        <Card className={styles.quickStatCard}>
          <div className={styles.quickStatContent}>
            <Award className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>Top 10%</h3>
              <p className={styles.quickStatLabel}>Platform Rank</p>
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
            subtitle="Application updates and notifications"
            className={styles.activityCard}>
            <RecentActivity activities={activities} title="" />
          </Card>

          <Card
            title="Pending Actions"
            subtitle="Tasks to improve your job search"
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
            title="Recommended Jobs"
            subtitle="Matches based on your profile"
            footer={
              <Button variant="ghost" size="small">
                View All Matches
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
            title="Application Status"
            subtitle="Breakdown of your job applications"
            className={styles.statusCard}>
            <div className={styles.statusContent}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Submitted</span>
                <span className={styles.statusCount}>15</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Under Review</span>
                <span className={styles.statusCount}>8</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Interview</span>
                <span className={styles.statusCount}>4</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Offers</span>
                <span className={styles.statusCount}>1</span>
              </div>
            </div>
          </Card>

          <Card
            title="Skill Development"
            subtitle="Areas to improve for better matches"
            className={styles.skillsCard}>
            <div className={styles.skillsContent}>
              <div className={styles.skillItem}>
                <span className={styles.skillLabel}>React 19</span>
                <div className={styles.skillProgress}>
                  <div className={styles.skillFill} style={{ width: "85%" }} />
                </div>
                <span className={styles.skillPercentage}>85%</span>
              </div>
              <div className={styles.skillItem}>
                <span className={styles.skillLabel}>TypeScript</span>
                <div className={styles.skillProgress}>
                  <div className={styles.skillFill} style={{ width: "70%" }} />
                </div>
                <span className={styles.skillPercentage}>70%</span>
              </div>
              <div className={styles.skillItem}>
                <span className={styles.skillLabel}>UI/UX Design</span>
                <div className={styles.skillProgress}>
                  <div className={styles.skillFill} style={{ width: "60%" }} />
                </div>
                <span className={styles.skillPercentage}>60%</span>
              </div>
              <div className={styles.skillItem}>
                <span className={styles.skillLabel}>Project Mgmt</span>
                <div className={styles.skillProgress}>
                  <div className={styles.skillFill} style={{ width: "45%" }} />
                </div>
                <span className={styles.skillPercentage}>45%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobseekerDashboard;
