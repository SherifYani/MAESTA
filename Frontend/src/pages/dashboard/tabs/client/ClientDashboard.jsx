/**
 * @file ClientDashboard.jsx
 * @description Client-specific dashboard with metrics, activities, and job posts
 * @author Sherif Talaat
 * @version 2.0.0
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
import { Plus, Users, DollarSign, Calendar } from "lucide-react";
import styles from "./ClientDashboard.module.css";

/**
 * ClientDashboard component
 * @returns {JSX.Element} Rendered client dashboard
 */
const ClientDashboard = () => {
  const { currentRole } = useContext(DashboardContext);

  // Get role-specific data
  const metrics = ROLE_METRICS[ROLES.CLIENT]?.metrics || [];
  const activities = SAMPLE_ACTIVITIES[ROLES.CLIENT] || [];
  const pendingActions = SAMPLE_PENDING_ACTIONS[ROLES.CLIENT] || [];
  const jobPosts = SAMPLE_JOB_POSTS[ROLES.CLIENT] || [];

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
    <div className={styles.clientDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Client Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your projects, talent, and hiring pipeline
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-job")}>
            Post New Job
          </Button>
          <Button
            variant="outline"
            icon={Users}
            onClick={() => handleQuickAction("hire-talent")}>
            Hire Talent
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
            <DollarSign className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>$125K</h3>
              <p className={styles.quickStatLabel}>Total Saved</p>
            </div>
          </div>
        </Card>

        <Card className={styles.quickStatCard}>
          <div className={styles.quickStatContent}>
            <Calendar className={styles.quickStatIcon} />
            <div>
              <h3 className={styles.quickStatValue}>94%</h3>
              <p className={styles.quickStatLabel}>On-Time Delivery</p>
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
            subtitle="Project updates and notifications"
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
            title="Active Job Posts"
            subtitle="Your current job openings"
            footer={
              <Button variant="ghost" size="small">
                Manage Jobs
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
            title="Budget Overview"
            subtitle="Monthly spending and allocation"
            className={styles.budgetCard}>
            <div className={styles.budgetContent}>
              <div className={styles.budgetMetric}>
                <span className={styles.budgetLabel}>This Month</span>
                <span className={styles.budgetValue}>$8,450</span>
              </div>
              <div className={styles.budgetMetric}>
                <span className={styles.budgetLabel}>Remaining</span>
                <span className={styles.budgetValue}>$16,550</span>
              </div>
              <div className={styles.budgetProgress}>
                <div className={styles.progressBar} style={{ width: "34%" }} />
              </div>
              <p className={styles.budgetNote}>
                You've used 34% of your monthly budget
              </p>
            </div>
          </Card>

          <Card
            title="Talent Pipeline"
            subtitle="Current hiring progress"
            className={styles.pipelineCard}>
            <div className={styles.pipelineContent}>
              <div className={styles.pipelineStage}>
                <span className={styles.stageLabel}>Screening</span>
                <span className={styles.stageCount}>12</span>
              </div>
              <div className={styles.pipelineStage}>
                <span className={styles.stageLabel}>Interview</span>
                <span className={styles.stageCount}>8</span>
              </div>
              <div className={styles.pipelineStage}>
                <span className={styles.stageLabel}>Offer</span>
                <span className={styles.stageCount}>3</span>
              </div>
              <div className={styles.pipelineStage}>
                <span className={styles.stageLabel}>Hired</span>
                <span className={styles.stageCount}>5</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
