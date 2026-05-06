/**
 * @file JobseekerDashboard.jsx - Refactored Version
 * @description Jobseeker-specific dashboard with comprehensive SRS compliance
 * @author Sherif Talaat
 * @version 7.0.0
 * @date 2026-01-29
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Logic Hook
import useJobseekerLogic from '../../hooks/useJobseekerLogic';

// UI Components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Sub-components
import JobseekerHeader from './components/JobseekerHeader';
import ApplicationStats from './components/ApplicationStats';
import ProfileSummaryCard from './components/ProfileSummaryCard';
import SkillsAnalysisCard from './components/SkillsAnalysisCard';

// Widgets
import RecommendedJobsWidget from './components/RecommendedJobs/RecommendedJobsWidget';
import SavedJobsWidget from './components/SavedJobs/SavedJobsWidget';
import ApplicationsWidget from './components/DetailedApplications/ApplicationsWidget';
import PendingActions from '../../components/PendingActions';
import RecentActivity from '../../components/RecentActivity';

import styles from './JobseekerDashboard.module.css';

const JobseekerDashboard = () => {
  const {
    dashboardData,
    loading,
    refreshing,
    stats,
    profile,
    applications,
    savedJobs,
    skillsAnalysis,
    recentActivity,
    recommendedJobs,
    handleRefresh,
    handleQuickAction,
    handleRemoveSavedJob,
    handleSaveJob,
    navigate
  } = useJobseekerLogic();

  if (loading || !dashboardData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.jobSeekerDashboard}>
      {/* Header Section */}
      <JobseekerHeader
        userName={profile.name}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onSearch={() => handleQuickAction('search-jobs')}
        onAlerts={() => handleQuickAction('set-alerts')}
      />

      {/* Stats Section */}
      <ApplicationStats
        stats={stats.applications}
        jobSeekerStats={stats.jobSeeker}
      />

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>

        {/* Row 1: Profile Summary + Skills Analysis (side by side) */}
        <div className={styles.twoColRow}>
          <Card 
            title="Profile Summary" 
            subtitle="Your account overview" 
            variant="glass"
            className={styles.profileCard}
          >
            <ProfileSummaryCard
              profile={profile}
              onEdit={() => handleQuickAction('update-profile')}
            />
          </Card>
          
          <Card 
            title="Skills Match Analysis" 
            subtitle="Based on your profile data"
            variant="glass"
            className={styles.skillsCard}
          >
            <SkillsAnalysisCard
              skillsAnalysis={skillsAnalysis}
              onEdit={() => navigate('/dashboard/profile')}
              onAssess={() => navigate('/dashboard/assessments')}
            />
          </Card>
        </div>

        {/* Row 2: Recent Applications (full width) */}
        <Card
          title="Recent Applications"
          subtitle={`${applications.length} active applications`}
          className={styles.applicationsCard}
          variant="glass"
          action={
            <Link to="/dashboard/applications">
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            </Link>
          }
        >
          <ApplicationsWidget
            applications={applications}
            onViewApplication={(id) => navigate(`/dashboard/applications/${id}`)}
          />
        </Card>

        {/* Row 3: Recommended Jobs (full width) */}
        <Card
          title="Recommended For You"
          subtitle="Based on your skills and preferences"
          className={styles.recommendedCard}
          variant="glass"
          action={
            <Link to="/dashboard/recommended-jobs">
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            </Link>
          }
        >
          <RecommendedJobsWidget
            jobs={recommendedJobs}
            onViewJob={(id) => navigate(`/jobs/${id}`)}
            onSaveJob={(id) => handleSaveJob(id, true)}
          />
        </Card>

        {/* Row 4: Saved Jobs (full width) */}
        <Card
          title="Saved Jobs"
          subtitle={`${savedJobs.length} jobs saved for later`}
          className={styles.savedJobsCard}
          variant="glass"
          action={
            <Link to="/dashboard/saved-jobs">
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            </Link>
          }
        >
          <SavedJobsWidget
            jobs={savedJobs}
            onRemove={handleRemoveSavedJob}
            onApply={(id) => navigate(`/jobs/${id}/apply`)}
            onView={(id) => navigate(`/jobs/${id}`)}
          />
        </Card>

        {/* Row 5: Pending Actions + Recent Activity (side by side) */}
        <div className={styles.twoColRow}>
          <Card
            title="Pending Actions"
            subtitle={`${dashboardData.pendingActions?.length || 0} tasks to complete`}
            className={styles.actionsCard}
            variant="glass"
          >
            <PendingActions
              actions={dashboardData.pendingActions || []}
              onActionComplete={(id) => console.log('Complete', id)}
            />
          </Card>
          <Card
            title="Recent Activity"
            subtitle="Your latest interactions"
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small" onClick={() => navigate('/dashboard/applications')}>
                View History <ArrowUpRight size={14} />
              </Button>
            }
          >
            <RecentActivity
              activities={recentActivity}
              limit={5}
              onViewAll={() => navigate('/dashboard/applications')}
            />
          </Card>
        </div>

      </div>
    </div>
  );
};

export default JobseekerDashboard;