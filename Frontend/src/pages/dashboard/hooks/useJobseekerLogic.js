/**
 * @file useJobseekerLogic.js
 * @description Custom hook for Jobseeker Dashboard logic
 * @author Sherif Talaat
 * @date 2026-01-29
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getJobSeekerDashboardData,
    getJobSeekerStatistics,
    getApplicationStatusSummary,
    getSavedJobsSummary
} from '../config/dashboard.config';

/**
 * Custom hook to manage jobseeker dashboard state and logic
 * @returns {Object} Dashboard data and handlers
 */
export const useJobseekerLogic = (initialData) => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(() => {
        return initialData || getJobSeekerDashboardData();
    });
    const [loading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Derived Data
    const jobSeekerStats = getJobSeekerStatistics();
    const applicationSummary = getApplicationStatusSummary();
    const savedJobsSummary = getSavedJobsSummary();

    const profile = dashboardData.profile || {};
    const applications = dashboardData.applications || [];
    const savedJobs = dashboardData.savedJobs || [];
    const skillsAnalysis = dashboardData.skillsAnalysis || {};
    const recentActivity = dashboardData.recentActivity || [];
    const performance = dashboardData.performance || {};
    const recommendedJobs = dashboardData.recommendedJobs || [];

    // Actions
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setDashboardData(getJobSeekerDashboardData());
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleQuickAction = useCallback((action) => {
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
    }, [navigate]);

    const handleRemoveSavedJob = useCallback((jobId) => {
        // API call simulation
        setDashboardData(prev => ({
            ...prev,
            savedJobs: prev.savedJobs.filter(job => job.id !== jobId)
        }));
    }, []);

    const handleSaveJob = useCallback((jobId, saved) => {
        // API call simulation
        setDashboardData(prev => ({
            ...prev,
            recommendedJobs: prev.recommendedJobs.map(job =>
                job.id === jobId ? { ...job, isSaved: saved } : job
            )
        }));
    }, []);

    const handleWithdrawApplication = useCallback((applicationId) => {
        // API call simulation
        setDashboardData(prev => ({
            ...prev,
            applications: prev.applications.filter(app => app.id !== applicationId)
        }));
    }, []);

    return {
        // State
        dashboardData,
        loading,
        refreshing,

        // Data Groupings
        stats: {
            jobSeeker: jobSeekerStats,
            applications: applicationSummary,
            savedJobs: savedJobsSummary
        },
        profile,
        applications,
        savedJobs,
        skillsAnalysis,
        recentActivity,
        performance,
        recommendedJobs,

        // Handlers
        handleRefresh,
        handleQuickAction,
        handleRemoveSavedJob,
        handleSaveJob,
        handleWithdrawApplication,
        navigate
    };
};

export default useJobseekerLogic;
