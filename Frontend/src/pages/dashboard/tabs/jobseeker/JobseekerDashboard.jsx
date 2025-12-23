/**
 * @file JobseekerDashboard.jsx - Enhanced Version
 * @description Jobseeker-specific dashboard with metrics, activities, and job posts - Similar to ClientDashboard
 * @author Sherif Talaat
 * @version 4.0.0
 * @date 2025-12-23
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-23
 * @changes Added SRS-required components: ProfileSummary, SavedJobs, DetailedApplications
 */

import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import PendingActions from "../../components/PendingActions";
import ProfileSummary from "./components/ProfileSummary/ProfileSummary";
import SavedJobs from "./components/SavedJobs/SavedJobs";
import DetailedApplications from "./components/DetailedApplications/DetailedApplications";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
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
  Plus,
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
      <span className={styles.jobMetaItem}>{job.budget}</span>
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
 * Enhanced JobseekerDashboard with SRS-required components
 */
const JobseekerDashboard = ({ data }) => {
  // Get all role-specific data from props
  const activities = data?.activities || [];
  const pendingActions = data?.pendingActions || [];
  const recentJobPosts = data?.recentJobPosts || [];
  const jobApplications = data?.jobApplications || [];
  const skillAnalysis = data?.skillAnalysis || {};
  const performanceMetrics = data?.performanceMetrics || {};
  const metrics = data?.metrics || [];

  // Create user data for ProfileSummary from available data
  const userData = {
    name: "John Doe", // Would come from user profile in real app
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    avatar: null,
    completionPercentage: skillAnalysis?.matchPercentage || 78,
    title: "Senior Frontend Developer",
    status: "active",
    skills: skillAnalysis?.matchedSkills || [
      "React",
      "TypeScript",
      "CSS",
      "Git",
    ],
    verified: true,
  };

  // Create saved jobs data (would come from backend in real app)
  const savedJobsData = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      salary: "$120,000 - $150,000",
      dateSaved: "2024-01-15",
      jobType: "Full-time",
      status: "active",
      matchScore: skillAnalysis?.matchPercentage || 92,
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "CreativeStudio",
      location: "New York, NY",
      salary: "$90,000 - $110,000",
      dateSaved: "2024-01-12",
      jobType: "Full-time",
      status: "active",
      matchScore: 85,
    },
    {
      id: 3,
      title: "React Native Developer",
      company: "MobileFirst",
      location: "San Francisco, CA",
      salary: "$110,000 - $130,000",
      dateSaved: "2024-01-10",
      jobType: "Contract",
      status: "expired",
      matchScore: 78,
    },
  ];

  // Calculate application status counts for DetailedApplications
  const calculateApplicationStats = () => {
    if (jobApplications.length > 0) {
      const stats = {
        total: jobApplications.length,
        underReview: jobApplications.filter((app) => app.status === "applied")
          .length,
        interview: jobApplications.filter((app) => app.status === "interview")
          .length,
        offers: jobApplications.filter((app) => app.status === "offer").length,
        rejected: jobApplications.filter((app) => app.status === "rejected")
          .length,
      };
      return stats;
    }

    // Fallback stats
    return {
      total: 4,
      underReview: 1,
      interview: 1,
      offers: 1,
      rejected: 1,
    };
  };

  const applicationStats = calculateApplicationStats();

  // Quick Insights Metrics for StatsGrid
  const quickInsightsMetrics =
    metrics.length > 0
      ? metrics
      : [
          {
            title: "Total Applications",
            value: applicationStats.total,
            change: "active applications",
            icon: FileText,
            trendType: "positive",
            description: "Submitted job applications",
          },
          {
            title: "Interview Rate",
            value: `${
              Math.round(
                (applicationStats.interview / applicationStats.total) * 100
              ) || 25
            }%`,
            change: "of applications",
            icon: Target,
            trendType: "positive",
            description: "Applications to interview",
          },
          {
            title: "Profile Match",
            value: `${skillAnalysis?.matchPercentage || 87}%`,
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

  // Skill data for Skill Development card
  const skillData = skillAnalysis?.matchedSkills
    ? skillAnalysis.matchedSkills.slice(0, 4).map((skill, index) => ({
        label: skill,
        percentage: 60 + index * 10, // Simulated progress
        level:
          index === 0 ? "expert" : index === 1 ? "advanced" : "intermediate",
      }))
    : [
        { label: "React 19", percentage: 85, level: "expert" },
        { label: "TypeScript", percentage: 70, level: "advanced" },
        { label: "UI/UX Design", percentage: 60, level: "intermediate" },
        { label: "Project Mgmt", percentage: 45, level: "beginner" },
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

  const handleRemoveJob = (jobId) => {
    console.log(`Remove saved job ${jobId}`);
  };

  const handleViewJob = (jobId) => {
    console.log(`View job details ${jobId}`);
  };

  const handleViewApplication = (applicationId) => {
    console.log(`View application ${applicationId}`);
  };

  const handleWithdrawApplication = (applicationId) => {
    console.log(`Withdraw application ${applicationId}`);
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

      {/* Main Content Grid - 2 Column Layout with SRS Components */}
      <div className={styles.contentGrid}>
        {/* Left Column - Profile, Activities, & Pending Actions */}
        <div className={styles.leftColumn}>
          {/* ProfileSummary Component (FR-701.2) */}
          <ProfileSummary user={userData} />

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
        </div>

        {/* Right Column - Saved Jobs, Applications, & Insights */}
        <div className={styles.rightColumn}>
          {/* SavedJobs Component (FR-701.5) */}
          <SavedJobs
            jobs={savedJobsData}
            onRemoveJob={handleRemoveJob}
            onViewJob={handleViewJob}
          />

          {/* DetailedApplications Component (FR-701.4) */}
          <DetailedApplications
            applications={jobApplications}
            stats={applicationStats}
            onViewApplication={handleViewApplication}
            onWithdrawApplication={handleWithdrawApplication}
          />

          {/* Quick Stats Section using StatsGrid */}
          <section className={styles.quickStatsSection}>
            <StatsGrid metrics={quickInsightsMetrics} />
          </section>

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
