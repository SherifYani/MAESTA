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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['dashboards', 'common']);
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
        <p>{t('dashboards:common.loading', 'Loading your dashboard...')}</p>
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
            title={t('dashboards:jobseeker.profileSummary.title', 'Profile Summary')} 
            subtitle={t('dashboards:jobseeker.profileSummary.subtitle', 'Your account overview')} 
            variant="glass"
            className={styles.profileCard}
          >
            <ProfileSummaryCard
              profile={profile}
              onEdit={() => handleQuickAction('update-profile')}
            />
          </Card>
          
          <Card 
            title={t('dashboards:jobseeker.skillsMatch.title', 'Skills Match Analysis')} 
            subtitle={t('dashboards:jobseeker.skillsMatch.subtitle', 'Based on your profile data')}
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
          title={t('dashboards:jobseeker.recentApplications.title', 'Recent Applications')}
          subtitle={t('dashboards:jobseeker.recentApplications.subtitle', '{{count}} active applications', { count: applications.length })}
          className={styles.applicationsCard}
          variant="glass"
          action={
            <Link to="/dashboard/applications">
              <Button variant="ghost" size="small">
                {t('common:actions.viewAll', 'View All')} <ArrowUpRight size={14} />
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
          title={t('dashboards:jobseeker.recommendedJobs.title', 'Recommended For You')}
          subtitle={t('dashboards:jobseeker.recommendedJobs.subtitle', 'Based on your skills and preferences')}
          className={styles.recommendedCard}
          variant="glass"
          action={
            <Link to="/dashboard/recommended-jobs">
              <Button variant="ghost" size="small">
                {t('common:actions.viewAll', 'View All')} <ArrowUpRight size={14} />
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
          title={t('dashboards:jobseeker.savedJobs.title', 'Saved Jobs')}
          subtitle={t('dashboards:jobseeker.savedJobs.subtitle', '{{count}} jobs saved for later', { count: savedJobs.length })}
          className={styles.savedJobsCard}
          variant="glass"
          action={
            <Link to="/dashboard/saved-jobs">
              <Button variant="ghost" size="small">
                {t('common:actions.viewAll', 'View All')} <ArrowUpRight size={14} />
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
            title={t('dashboards:common.pendingActions.title', 'Pending Actions')}
            subtitle={t('dashboards:common.pendingActions.subtitle', '{{count}} tasks to complete', { count: dashboardData.pendingActions?.length || 0 })}
            className={styles.actionsCard}
            variant="glass"
          >
            <PendingActions
              actions={dashboardData.pendingActions || []}
              onActionComplete={(id) => console.log('Complete', id)}
            />
          </Card>
          <Card
            title={t('dashboards:common.recentActivity.title', 'Recent Activity')}
            subtitle={t('dashboards:common.recentActivity.subtitle', 'Your latest interactions')}
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small" onClick={() => navigate('/dashboard/applications')}>
                {t('dashboards:common.recentActivity.viewHistory', 'View History')} <ArrowUpRight size={14} />
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