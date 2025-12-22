/**
 * @file JobseekerDashboard.jsx - Enhanced Version
 * @description Jobseeker-specific dashboard with metrics, activities, and job posts - Similar to ClientDashboard
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-21
 */

import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import PendingActions from "../../components/PendingActions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  ROLES,
  SAMPLE_ACTIVITIES,
  SAMPLE_PENDING_ACTIONS,
  SAMPLE_JOB_POSTS,
  JOB_APPLICATIONS,
  SKILL_ANALYSIS,
  PERFORMANCE_METRICS,
} from "../../config/dashboard.config";
import {
  Search,
  Target,
  Award,
  Bell,
  Briefcase,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  MapPin,
  FileText,
} from "lucide-react";
import styles from "./JobseekerDashboard.module.css";

/**
 * Compact Job Post Card Component
 */
const CompactJobCard = ({ job, onClick }) => (
  <div className={styles.compactJobCard} onClick={() => onClick?.(job.id)}>
    <div className={styles.jobCardHeader}>
      <div className={styles.jobCardTitle}>
        <Briefcase size={16} className={styles.jobCardIcon} />
        <h4>{job.title}</h4>
      </div>
      <Badge
        variant={job.status?.toLowerCase() === "active" ? "active" : "pending"}>
        {job.status}
      </Badge>
    </div>

    <div className={styles.jobCardMeta}>
      <span className={styles.jobMetaItem}>
        {job.budget}
      </span>
      <span className={styles.jobMetaItem}>
        <MapPin size={14} />
        {job.location}
      </span>
      <span className={styles.jobMetaItem}>
        <Users size={14} />
        {job.applicants} applicants
      </span>
    </div>
  </div>
);

/**
 * Enhanced JobseekerDashboard - Similar to ClientDashboard
 */
const JobseekerDashboard = () => {
  // Get all role-specific data from dashboard.config.js
  const activities = SAMPLE_ACTIVITIES[ROLES.JOBSEEKER] || [];
  const pendingActions = SAMPLE_PENDING_ACTIONS[ROLES.JOBSEEKER] || [];
  const jobPosts = SAMPLE_JOB_POSTS[ROLES.JOBSEEKER] || [];
  const jobApplications = JOB_APPLICATIONS[ROLES.JOBSEEKER] || [];
  const skillAnalysis = SKILL_ANALYSIS[ROLES.JOBSEEKER];
  const performanceMetrics = PERFORMANCE_METRICS[ROLES.JOBSEEKER];

  // Calculate application status counts
  const getApplicationStatusCounts = () => {
    if (jobApplications.length > 0) {
      const counts = {
        submitted: 0,
        underReview: 0,
        interview: 0,
        offers: 0,
      };

      jobApplications.forEach((app) => {
        switch (app.status) {
          case "applied":
            counts.submitted++;
            counts.underReview++;
            break;
          case "interview":
            counts.interview++;
            break;
          case "offer":
            counts.offers++;
            break;
          default:
            counts.submitted++;
        }
      });

      return counts;
    }

    // Fallback to original data
    return {
      submitted: 15,
      underReview: 8,
      interview: 4,
      offers: 1,
    };
  };

  const applicationCounts = getApplicationStatusCounts();
  const totalApplications =
    applicationCounts.submitted +
    applicationCounts.underReview +
    applicationCounts.interview +
    applicationCounts.offers;

  // Calculate skill data
  const getSkillData = () => {
    if (skillAnalysis?.matchedSkills) {
      const allSkills = [
        ...(skillAnalysis.matchedSkills || []),
        ...(skillAnalysis.missingSkills || []),
      ];

      return allSkills.slice(0, 4).map((skill, index) => ({
        label: skill,
        percentage: skillAnalysis.matchedSkills?.includes(skill) ? 85 : 60,
        level: skillAnalysis.matchedSkills?.includes(skill)
          ? "expert"
          : "intermediate",
      }));
    }

    // Fallback to original data
    return [
      { label: "React 19", percentage: 85, level: "expert" },
      { label: "TypeScript", percentage: 70, level: "advanced" },
      { label: "UI/UX Design", percentage: 60, level: "intermediate" },
      { label: "Project Mgmt", percentage: 45, level: "beginner" },
    ];
  };

  const skillData = getSkillData();

  // Calculate quick stats
  const profileMatch = skillAnalysis?.matchPercentage || 87;

  // Quick Insights Metrics for StatsGrid
  const quickInsightsMetrics = [
    {
      title: "Total Applications",
      value: totalApplications,
      change: "active applications",
      icon: FileText,
      trendType: "positive",
      description: "Submitted job applications",
    },
    {
      title: "Interview Rate",
      value: `${
        Math.round((applicationCounts.interview / totalApplications) * 100) ||
        20
      }%`,
      change: "of applications",
      icon: Target,
      trendType: "positive",
      description: "Applications to interview",
    },
    {
      title: "Profile Match",
      value: `${profileMatch}%`,
      change: "with job requirements",
      icon: Award,
      trendType: "positive",
      description: "Job match score",
    },
    {
      title: "Response Time",
      value: `${performanceMetrics?.responseTime || "2.5"}d`,
      change: "average response",
      icon: Clock,
      trendType: "positive",
      description: "Average response time",
    },
  ];

  // Event handlers
  const handleActionToggle = (id, completed) => {
    console.log(
      `Action ${id} toggled to ${completed ? "completed" : "pending"}`
    );
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

      {/* Quick Insights Section using StatsGrid */}
      <section className={styles.quickInsightsSection}>
        <StatsGrid metrics={quickInsightsMetrics} />
      </section>

      {/* Main Content Grid - 2 Column Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column - Activities, Pending Actions & Application Status */}
        <div className={styles.leftColumn}>
          {/* Recent Activity with Card Wrapper */}
          <Card
            title="Recent Activity"
            subtitle="Application updates and notifications"
            className={styles.activityCard}
            action={
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            }>
            <RecentActivity activities={activities} limit={5} />
          </Card>

          {/* Pending Actions with Card Wrapper */}
          <Card
            title="Pending Actions"
            subtitle={`${pendingActions.length} tasks to improve your job search`}
            className={styles.actionsCard}
            action={
              <Badge variant="warning">{pendingActions.length} pending</Badge>
            }>
            <PendingActions
              actions={pendingActions}
              onActionComplete={handleActionToggle}
            />
          </Card>

          {/* Application Status - Compact View */}
          <Card
            title="Application Status"
            subtitle="Breakdown of your job applications"
            className={styles.statusCard}>
            <div className={styles.kpiGrid}>
              {Object.entries(applicationCounts).map(
                ([status, count], index) => {
                  const statusConfig = {
                    submitted: { label: "Submitted", icon: FileText },
                    underReview: { label: "Review", icon: Clock },
                    interview: { label: "Interview", icon: Target },
                    offers: { label: "Offers", icon: Award },
                  };

                  const config = statusConfig[status];
                  if (!config) return null;

                  const Icon = config.icon;

                  return (
                    <div key={index} className={styles.kpiItem}>
                      <div className={styles.kpiIconWrapper}>
                        <Icon size={20} />
                      </div>
                      <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>{config.label}</span>
                        <span className={styles.kpiValue}>{count}</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Jobs, Skills & Performance */}
        <div className={styles.rightColumn}>
          {/* Compact Job Posts */}
          <Card
            title="Recommended Jobs"
            subtitle={`${jobPosts.length} matches based on your profile`}
            className={styles.jobsCard}
            action={
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            }>
            <div className={styles.compactJobsList}>
              {jobPosts.slice(0, 4).map((job) => (
                <CompactJobCard
                  key={job.id}
                  job={job}
                  onClick={handleJobClick}
                />
              ))}
            </div>
          </Card>

          {/* Skill Development - Compact View */}
          <Card
            title="Skill Development"
            subtitle="Areas to improve for better matches"
            className={styles.skillsCard}>
            <div className={styles.skillsGrid}>
              {skillData.map((skill, index) => (
                <div
                  key={index}
                  className={styles.skillItem}
                  data-skill-level={skill.level}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillLabel}>{skill.label}</span>
                    <span className={styles.skillPercentage}>
                      {skill.percentage}%
                    </span>
                  </div>
                  <div className={styles.skillProgress}>
                    <div
                      className={styles.skillFill}
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                  <div className={styles.skillLevel}>
                    <Badge variant={skill.level}>{skill.level}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Metrics - Compact View */}
          <Card
            title="Job Search Metrics"
            subtitle="Your job search performance indicators"
            className={styles.metricsCard}>
            <div className={styles.kpiGrid}>
              {performanceMetrics &&
                Object.entries(performanceMetrics).map(([key, value]) => {
                  const metricConfig = {
                    responseTime: {
                      label: "Response",
                      icon: Clock,
                      format: (v) => `${v}d`,
                    },
                    profileCompleteness: {
                      label: "Profile",
                      icon: CheckCircle,
                      format: (v) => `${v}%`,
                    },
                    applicationSuccess: {
                      label: "Success",
                      icon: Target,
                      format: (v) => `${v}%`,
                    },
                    interviewRate: {
                      label: "Interview",
                      icon: Users,
                      format: (v) => `${v}%`,
                    },
                  };

                  const config = metricConfig[key];
                  if (!config) return null;

                  const displayValue = config.format
                    ? config.format(value)
                    : value;
                  const Icon = config.icon;

                  return (
                    <div key={key} className={styles.kpiItem}>
                      <div className={styles.kpiIconWrapper}>
                        <Icon size={20} />
                      </div>
                      <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>{config.label}</span>
                        <span className={styles.kpiValue}>{displayValue}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card
            title="Quick Actions"
            subtitle="Common job search tasks"
            className={styles.quickActionsCard}>
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("search-jobs")}>
                <Search size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>Search Jobs</span>
                  <span className={styles.quickActionDesc}>
                    Find new opportunities
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("update-profile")}>
                <Briefcase size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>
                    Update Profile
                  </span>
                  <span className={styles.quickActionDesc}>
                    Enhance your resume
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("track-applications")}>
                <BarChart3 size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>Track Apps</span>
                  <span className={styles.quickActionDesc}>
                    Monitor applications
                  </span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobseekerDashboard;
