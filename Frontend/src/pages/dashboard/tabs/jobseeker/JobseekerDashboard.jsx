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
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Profile Summary */}
          <ProfileSummaryCard
            profile={profile}
            onEdit={() => handleQuickAction('update-profile')}
          />

          {/* Recent Applications */}
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

          {/* Skills Analysis */}
          <SkillsAnalysisCard
            skillsAnalysis={skillsAnalysis}
            onEdit={() => navigate('/dashboard/profile/skills')}
            onAssess={() => navigate('/dashboard/assessments')}
          />
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Recommended Jobs */}
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

          {/* Saved Jobs */}
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

          {/* Recent Activity */}
          <Card
            title="Recent Activity"
            subtitle="Your latest interactions"
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small" onClick={() => navigate('/dashboard/activity')}>
                View History <ArrowUpRight size={14} />
              </Button>
            }
          >
            <RecentActivity
              activities={recentActivity}
              limit={5}
            />
          </Card>

          {/* Pending Actions */}
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
        </div>
      </div>
    </div>
  );
};

export default JobseekerDashboard;