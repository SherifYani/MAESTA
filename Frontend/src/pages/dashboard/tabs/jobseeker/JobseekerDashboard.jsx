/**
 * @file JobseekerDashboard.jsx - Enhanced Version
 * @description Jobseeker-specific dashboard with comprehensive SRS compliance
 * @author Sherif Talaat
 * @version 6.0.0
 * @date 2026-01-23
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-01-23
 * @changes Integrated complete test data from dashboard.config.js
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatsGrid from '../../components/StatsGrid';
import RecentActivity from '../../components/RecentActivity';
import ApplicationsWidget from './components/DetailedApplications/ApplicationsWidget';
import SavedJobsWidget from './components/SavedJobs/SavedJobsWidget';
import RecommendedJobsWidget from './components/RecommendedJobs/RecommendedJobsWidget';
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
  Mail,
  Calendar,
  Check,
  X,
  Eye,
  TrendingUp,
  Star,
  Download,
  RefreshCw
} from 'lucide-react';
import styles from './JobseekerDashboard.module.css';

// Import test data functions
import {
  getJobSeekerDashboardData,
  getJobSeekerStatistics,
  getApplicationStatusSummary,
  getSavedJobsSummary
} from '../../config/dashboard.config';

/**
 * Profile Completion Component - FR-105.15
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @returns {JSX.Element} Profile completion component
 */
const ProfileCompletion = ({ progress }) => (
  <div className={styles.profileCompletion}>
    <div className={styles.progressLabel}>
      <span>Profile Completion</span>
      <span className={styles.progressPercentage}>{progress}%</span>
    </div>
    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

/**
 * Helper function to determine skill level - MOVED BEFORE COMPACT JOB CARD
 */
const getSkillLevel = (percentage) => {
  if (percentage >= 85) return "expert";
  if (percentage >= 70) return "advanced";
  if (percentage >= 50) return "intermediate";
  return "beginner";
};

/**
 * Status Helper Functions - MOVED BEFORE COMPACT JOB CARD
 */
const getStatusVariant = (status) => {
  const variants = {
    'review': 'pending',
    'interview': 'active',
    'offer': 'success',
    'rejected': 'destructive',
    'withdrawn': 'outline',
    'under-review': 'pending',
    'accepted': 'success'
  };
  return variants[status] || 'outline';
};

const formatStatus = (status) => {
  const statusMap = {
    'review': 'Under Review',
    'interview': 'Interview',
    'offer': 'Offer Received',
    'rejected': 'Rejected',
    'withdrawn': 'Withdrawn',
    'under-review': 'Under Review',
    'accepted': 'Accepted'
  };
  return statusMap[status] || status;
};



/**
 * Enhanced JobseekerDashboard with Complete Test Data Integration
 * @param {Object} props
 * @param {Object} props.data - Dashboard data from API (optional)
 * @returns {JSX.Element} Jobseeker dashboard component
 */
const JobseekerDashboard = ({ data }) => {
  const navigate = useNavigate();

  // Initialize with test data if no API data provided
  const [dashboardData, setDashboardData] = useState(() => {
    return data || getJobSeekerDashboardData();
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate API refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setDashboardData(getJobSeekerDashboardData());
      setRefreshing(false);
    }, 1000);
  };

  // Extract data from dashboardData
  const profile = dashboardData.profile || {};
  const applications = dashboardData.applications || [];
  const savedJobs = dashboardData.savedJobs || [];
  const skillsAnalysis = dashboardData.skillsAnalysis || {};
  const recentActivity = dashboardData.recentActivity || [];
  const performance = dashboardData.performance || {};
  const recommendedJobs = dashboardData.recommendedJobs || [];
  const activities = dashboardData.activities || [];
  const pendingActions = dashboardData.pendingActions || [];

  // Get calculated statistics
  const jobSeekerStats = getJobSeekerStatistics();
  const applicationSummary = getApplicationStatusSummary();
  const savedJobsSummary = getSavedJobsSummary();

  // Profile data for ProfileSummary component
  const profileData = {
    name: profile.name || "Sherif Talaat",
    email: profile.email || "sherif.talaat@example.com",
    phone: profile.phone || "+20 100 000 0000",
    location: profile.location || "Cairo, Egypt",
    avatar: profile.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ST",
    completionPercentage: profile.completionPercentage || 85,
    title: profile.headline || "Senior Frontend Developer | React & TypeScript Expert",
    status: "active",
    skills: skillsAnalysis.matchedSkills?.map(skill => skill.name) || ["React", "TypeScript", "Next.js", "JavaScript"],
    verified: profile.verification?.email || false,
    summary: profile.summary || "Experienced Frontend Developer with 5+ years building scalable web applications."
  };

  // Calculate application statistics
  const applicationStats = {
    total: applications.length,
    underReview: applications.filter(app =>
      app.status === 'review' || app.status === 'under-review'
    ).length,
    interview: applications.filter(app => app.status === 'interview').length,
    offers: applications.filter(app =>
      app.status === 'offer' || app.status === 'accepted'
    ).length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  // Quick Insights Metrics for StatsGrid
  const quickInsightsMetrics = [
    {
      title: "Total Applications",
      value: applicationStats.total,
      change: `${applicationStats.underReview} active`,
      icon: FileText,
      trendType: "positive",
      description: "Submitted job applications",
      color: "primary"
    },
    {
      title: "Interview Rate",
      value: `${applicationStats.total > 0 ?
        Math.round((applicationStats.interview / applicationStats.total) * 100) : 0}%`,
      change: `${applicationStats.interview} scheduled`,
      icon: Target,
      trendType: applicationStats.interview > 0 ? "positive" : "neutral",
      description: "Applications to interview",
      color: "success"
    },
    {
      title: "Profile Match",
      value: `${skillsAnalysis.overallMatch || 87}%`,
      change: "with job requirements",
      icon: Award,
      trendType: "positive",
      description: "Average job match score",
      color: "warning"
    },
    {
      title: "Response Rate",
      value: performance.applicationMetrics?.avgResponseTime || "3.2d",
      change: "average response time",
      icon: Clock,
      trendType: "positive",
      description: "Average employer response time",
      color: "info"
    }
  ];

  // Skill data for Skill Development card - NOW getSkillLevel IS DEFINED BEFORE THIS
  const skillData = skillsAnalysis.matchedSkills?.slice(0, 4).map(skill => ({
    label: skill.name,
    percentage: skill.level || 70,
    level: getSkillLevel(skill.level || 70),
    category: skill.category || "Frontend",
    demand: skill.demand || "High"
  })) || [
      {
        label: "React 19",
        percentage: 95,
        level: "expert",
        category: "Frontend",
        demand: "Very High"
      },
      {
        label: "TypeScript",
        percentage: 90,
        level: "expert",
        category: "Frontend",
        demand: "High"
      },
      {
        label: "Next.js",
        percentage: 85,
        level: "advanced",
        category: "Frontend",
        demand: "High"
      },
      {
        label: "UI/UX Design",
        percentage: 60,
        level: "intermediate",
        category: "Design",
        demand: "Medium"
      }
    ];

  // Event handlers
  const handleJobSearch = () => {
    navigate('/dashboard/recommended-jobs');
  };

  const handleViewProfile = () => {
    navigate('/dashboard/profile');
  };

  const handleViewAllApplications = () => {
    navigate('/dashboard/applications');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'search-jobs':
        navigate('/dashboard/recommended-jobs');
        break;
      case 'update-profile':
        navigate('/dashboard/profile/edit');
        break;
      case 'track-applications':
        navigate('/dashboard/applications');
        break;
      case 'set-alerts':
        console.log('Set job alerts');
        break;
      case 'download-resume':
        console.log('Download resume');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleJobClick = (jobId) => {
    console.log(`Job ${jobId} clicked`);
    // In real app: navigate to job details
    // navigate(`/jobs/${jobId}`);
  };

  const handleRemoveSavedJob = (jobId) => {
    console.log(`Remove saved job ${jobId}`);
    // In real app: API call to remove from saved jobs
    // Update local state
    const updatedSavedJobs = savedJobs.filter(job => job.id !== jobId);
    setDashboardData(prev => ({
      ...prev,
      savedJobs: updatedSavedJobs
    }));
  };

  const handleViewJob = (jobId) => {
    console.log(`View job details ${jobId}`);
    // In real app: navigate to job details
  };

  const handleViewApplication = (applicationId) => {
    console.log(`View application ${applicationId}`);
    // In real app: navigate to application details
  };

  const handleWithdrawApplication = (applicationId) => {
    console.log(`Withdraw application ${applicationId}`);
    // In real app: API call to withdraw application
    // Update local state
    const updatedApplications = applications.filter(app => app.id !== applicationId);
    setDashboardData(prev => ({
      ...prev,
      applications: updatedApplications
    }));
  };

  const handleSaveJob = (jobId, saved) => {
    console.log(`${saved ? 'Save' : 'Unsave'} job ${jobId}`);
    // In real app: API call to save/unsave job
    // Update local state for recommended jobs
    if (recommendedJobs) {
      const updatedRecommendedJobs = recommendedJobs.map(job =>
        job.id === jobId ? { ...job, isSaved: saved } : job
      );
      setDashboardData(prev => ({
        ...prev,
        recommendedJobs: updatedRecommendedJobs
      }));
    }
  };

  const handleApplyJob = (jobId) => {
    console.log(`Apply to job ${jobId}`);
    // In real app: API call to apply to job
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className={styles.jobseekerDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Welcome back, {profileData.name.split(' ')[0]}!
            {refreshing && <span className={styles.refreshingBadge}>Refreshing...</span>}
          </h1>
          <p className={styles.subtitle}>
            Track your applications, interviews, and job recommendations in one place
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            loading={refreshing}
            className={styles.refreshButton}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={Search}
            onClick={handleJobSearch}
            className={styles.primaryButton}
          >
            Search Jobs
          </Button>
          <Button
            variant="outline"
            icon={Bell}
            onClick={() => handleQuickAction('set-alerts')}
            className={styles.secondaryButton}
          >
            Set Alerts
          </Button>
        </div>
      </header>

      {/* Application Stats Section - FR-701.4 */}
      <section className={styles.metricsSection}>
        <div className={styles.metricsHeader}>
          <h2 className={styles.sectionTitle}>Application Overview</h2>
          <div className={styles.statsSummary}>
            <span className={styles.statsItem}>
              <strong>{jobSeekerStats.totalApplications}</strong> Total Applications
            </span>
            <span className={styles.statsItem}>
              <strong>{jobSeekerStats.interviewsScheduled}</strong> Interviews
            </span>
            <span className={styles.statsItem}>
              <strong>{jobSeekerStats.offersReceived}</strong> Offers
            </span>
          </div>
        </div>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiItem}>
            <div className={styles.kpiIconWrapper}>
              <Mail size={20} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Total Applications</span>
              <span className={styles.kpiValue}>{applicationStats.total}</span>
              <span className={styles.kpiChange}>
                {applicationStats.underReview} under review
              </span>
            </div>
          </div>
          <div className={styles.kpiItem}>
            <div className={styles.kpiIconWrapper}>
              <Clock size={20} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Under Review</span>
              <span className={styles.kpiValue}>{applicationStats.underReview}</span>
              <span className={styles.kpiChange}>
                Awaiting response
              </span>
            </div>
          </div>
          <div className={styles.kpiItem}>
            <div className={styles.kpiIconWrapper}>
              <Calendar size={20} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Interviews</span>
              <span className={styles.kpiValue}>{applicationStats.interview}</span>
              <span className={styles.kpiChange}>
                Scheduled & upcoming
              </span>
            </div>
          </div>
          <div className={styles.kpiItem}>
            <div className={styles.kpiIconWrapper}>
              <Check size={20} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Offers</span>
              <span className={styles.kpiValue}>{applicationStats.offers}</span>
              <span className={styles.kpiChange}>
                Pending acceptance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid - 2 Column Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Profile Summary Card - FR-701.2 */}
          <Card
            title="Profile Summary"
            subtitle="Complete your profile to get better matches"
            className={styles.statusCard}
            action={
              <Button
                variant="ghost"
                size="small"
                onClick={handleViewProfile}
                className={styles.viewAllBtn}
              >
                Edit Profile <ArrowUpRight size={14} />
              </Button>
            }
          >
            <div className={styles.profileSummary}>
              <div className={styles.avatarSection}>
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className={styles.avatar}
                />
                <div className={styles.profileInfo}>
                  <h4>{profileData.name}</h4>
                  <p>{profileData.email}</p>
                  <p className={styles.profileTitle}>{profileData.title}</p>
                  <div className={styles.verificationStatus}>
                    {profileData.verified && (
                      <Badge variant="success" size="sm">
                        <Check size={12} /> Verified
                      </Badge>
                    )}
                    <Badge variant="outline" size="sm">
                      Member since 2024
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Completion - FR-105.15 */}
              <div className={styles.completionSection}>
                <ProfileCompletion progress={profileData.completionPercentage} />
                <Button
                  variant="primary"
                  onClick={() => navigate('/dashboard/profile/edit')}
                  className={styles.editProfileBtn}
                  fullWidth
                >
                  Complete Profile ({profileData.completionPercentage}%)
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card
            title="Recent Activity"
            subtitle="Application updates and notifications"
            className={styles.activityCard}
            action={
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            }
          >
            <RecentActivity
              activities={recentActivity.slice(0, 5)}
              limit={5}
              showTimeline
            />
          </Card>

          {/* Quick Actions Panel */}
          <Card
            title="Quick Actions"
            subtitle="Common job search tasks"
            className={styles.quickActionsCard}
          >
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction('search-jobs')}
              >
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
                onClick={() => handleQuickAction('update-profile')}
              >
                <Briefcase size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>
                    Update Resume
                  </span>
                  <span className={styles.quickActionDesc}>
                    Enhance your CV
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction('download-resume')}
              >
                <Download size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>
                    Download Resume
                  </span>
                  <span className={styles.quickActionDesc}>
                    Latest version
                  </span>
                </div>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Saved Jobs Component - FR-701.5 */}
          <Card
            title="Saved Jobs"
            subtitle={`${savedJobsSummary.totalSaved} jobs saved, ${savedJobsSummary.appliedFromSaved} applied`}
            className={styles.savedJobsCard}
            action={
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/dashboard/saved-jobs')}
                className={styles.viewAllBtn}
              >
                View All <ArrowUpRight size={14} />
              </Button>
            }
          >
            <div className={styles.savedJobsList}>
              <SavedJobsWidget
                jobs={savedJobs}
                onRemove={handleRemoveSavedJob}
                onApply={handleApplyJob}
                onView={handleViewJob}
              />
            </div>
          </Card>

          {/* Detailed Applications Component - FR-701.4 */}
          {/* Applications Widget */}
          <Card
            title="Recent Applications"
            subtitle={`${applicationStats.total} total applications`}
            className={styles.applicationsCard}
            action={
              <Button
                variant="ghost"
                size="small"
                onClick={handleViewAllApplications}
                className={styles.viewAllBtn}
              >
                View All <ArrowUpRight size={14} />
              </Button>
            }
          >
            <ApplicationsWidget
              applications={applications}
              onViewApplication={handleViewApplication}
            />
          </Card>

          {/* Quick Stats Section */}
          <Card
            title="Performance Insights"
            subtitle="Your job search performance"
            className={styles.insightsCard}
          >
            <StatsGrid
              metrics={quickInsightsMetrics}
              columns={2}
              compact
            />
          </Card>

          {/* Skill Development Card - Skills at the end as requested */}
          <Card
            title="Skill Analysis"
            subtitle={`Overall match: ${skillsAnalysis.overallMatch || 87}%`}
            className={styles.skillsCard}
            action={
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/dashboard/profile/edit#skills')}
                className={styles.editBtn}
              >
                Edit Skills
              </Button>
            }
          >
            <div className={styles.skillsGrid}>
              {skillData.map((skill, index) => (
                <div
                  key={index}
                  className={styles.skillItem}
                  data-skill-level={skill.level}
                >
                  <div className={styles.skillHeader}>
                    <span className={styles.skillLabel}>
                      {skill.label}
                      {skill.demand && (
                        <Badge
                          variant="outline"
                          size="xs"
                          className={styles.demandBadge}
                        >
                          {skill.demand}
                        </Badge>
                      )}
                    </span>
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
            {skillsAnalysis.recommendations && (
              <div className={styles.skillsRecommendations}>
                <h5>Recommendations:</h5>
                <ul>
                  {skillsAnalysis.recommendations.slice(0, 2).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.skillsFooter}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Take skill assessment')}
                className={styles.skillAssessmentBtn}
              >
                Take Skill Assessment
              </Button>
            </div>
          </Card>

          {/* Recent Job Recommendations */}
          <Card
            title="Recommended For You"
            subtitle={`${recommendedJobs.length} jobs matching your profile`}
            className={styles.jobsCard}
            action={
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/dashboard/recommended-jobs')}
                className={styles.viewAllBtn}
              >
                View All <ArrowUpRight size={14} />
              </Button>
            }
          >
            <div className={styles.compactJobsList}>
              <RecommendedJobsWidget
                jobs={recommendedJobs}
                onJobClick={handleJobClick}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobseekerDashboard;