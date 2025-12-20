/**
 * @file FreelancerDashboard.jsx
 * @description Freelancer-specific dashboard with metrics, activities, and job posts
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
import { Plus, TrendingUp, Award, Zap } from "lucide-react";
import styles from "./FreelancerDashboard.module.css";

/**
 * FreelancerDashboard component
 * @returns {JSX.Element} Rendered freelancer dashboard
 */
const FreelancerDashboard = () => {
  const { currentRole } = useContext(DashboardContext);

  // Get role-specific data
  const metrics = ROLE_METRICS[ROLES.FREELANCER]?.metrics || [];
  const activities = SAMPLE_ACTIVITIES[ROLES.FREELANCER] || [];
  const pendingActions = SAMPLE_PENDING_ACTIONS[ROLES.FREELANCER] || [];
  const jobPosts = SAMPLE_JOB_POSTS[ROLES.FREELANCER] || [];

  const handleActionToggle = (id, completed) => {
    console.log(
      `Action ${id} toggled to ${completed ? "completed" : "pending"}`
    );
    // In a real app, you would update state or make an API call
  };

  const handleActionClick = (id) => {
    console.log(`Action ${id} clicked`);
    // In a real app, you would navigate or show details
  };

  const handleJobClick = (jobId) => {
    console.log(`Job ${jobId} clicked`);
    // Navigate to job details
  };

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
    // Handle quick action
  };

  return (
    <div className={styles.freelancerDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Freelancer Dashboard</h1>
          <p className={styles.subtitle}>
            Track your projects, earnings, and find new opportunities
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-proposal")}>
            New Proposal
          </Button>
          <Button
            variant="outline"
            icon={Zap}
            onClick={() => handleQuickAction("quick-apply")}>
            Quick Apply
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
            <Award className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>Top Rated</h3>
              <p className={styles.quickStatLabel}>Platform ranking</p>
            </div>
          </div>
        </Card>

        <Card className={styles.quickStatCard}>
          <div className={styles.quickStatContent}>
            <TrendingUp className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>98%</h3>
              <p className={styles.quickStatLabel}>Client satisfaction</p>
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
            subtitle="Your latest updates and notifications"
            className={styles.activityCard}>
            <RecentActivity activities={activities} title="" />
          </Card>

          <Card
            title="Pending Actions"
            subtitle="Tasks requiring your attention"
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
                View All Jobs
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
            title="Earnings Overview"
            subtitle="This month's earnings and projections"
            className={styles.earningsCard}>
            <div className={styles.earningsContent}>
              <div className={styles.earningsMetric}>
                <span className={styles.earningsLabel}>Current Month</span>
                <span className={styles.earningsValue}>$3,850</span>
              </div>
              <div className={styles.earningsMetric}>
                <span className={styles.earningsLabel}>Projected Total</span>
                <span className={styles.earningsValue}>$9,200</span>
              </div>
              <div className={styles.earningsProgress}>
                <div className={styles.progressBar} style={{ width: "68%" }} />
              </div>
              <p className={styles.earningsNote}>
                On track to exceed monthly target by 15%
              </p>
            </div>
          </Card>

          <Card
            title="Profile Completeness"
            subtitle="Improve your profile visibility"
            className={styles.profileCard}>
            <div className={styles.profileContent}>
              <div className={styles.profileProgress}>
                <div className={styles.progressCircle} data-percentage="85">
                  <span className={styles.progressText}>85%</span>
                </div>
              </div>
              <div className={styles.profileTips}>
                <h4 className={styles.tipsTitle}>Quick tips:</h4>
                <ul className={styles.tipsList}>
                  <li>Add portfolio projects</li>
                  <li>Complete skill assessments</li>
                  <li>Request client reviews</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
