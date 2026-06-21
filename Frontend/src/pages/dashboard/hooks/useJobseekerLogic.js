/**
 * @file useJobseekerLogic.js
 * @description Custom hook for Jobseeker Dashboard logic.
 *              Fetches live data from the API and falls back to mock data
 *              gracefully for sections that don't yet have API endpoints.
 * @author Sherif Talaat
 * @date 2026-01-29
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-05-01
 * @changes
 * - Phase 1: Replaced static mock init with async API fetching
 * - Wired recommendedJobs, applications, savedJobs to real endpoints
 * - Save/unsave and withdrawApplication now call real API methods
 * - Retained mock config as fallback for stats/activity (no API endpoints yet)
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import jobService from '../../../services/jobService';
import dashboardService from '../../../services/dashboardService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise a backend Job object into the shape the UI widgets expect.
 * Keeps every original field and adds display-friendly aliases.
 */
const normalizeJob = (job) => ({
    ...job,
    id: job.id || job.jobId,
    title: job.title || job.jobTitle || 'Untitled Job',
    company: job.company || job.companyName || 'Unknown Company',
    location: job.location || job.jobLocation || 'Remote',
    salary: job.salary || job.salaryRange || null,
    type: job.type || job.jobType || 'Full-time',
    postedAt: job.postedAt || job.createdAt || null,
    isSaved: job.isSaved || false,
    skills: job.skills || job.requiredSkills || [],
    status: job.status || 'active',
});

/**
 * Normalise a backend Application object into the shape the UI widgets expect.
 */
const normalizeApplication = (app) => ({
    ...app,
    id: app.id || app.applicationId,
    jobTitle: app.jobTitle || app.job?.title || 'Unknown Position',
    company: app.company || app.job?.company || 'Unknown Company',
    status: app.status || 'pending',
    appliedAt: app.appliedAt || app.createdAt || null,
    location: app.location || app.job?.location || 'Remote',
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Custom hook to manage jobseeker dashboard state and logic.
 * @returns {Object} Dashboard data, loading/error state, and action handlers
 */
export const useJobseekerLogic = (initialData) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // ── State ──────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Live API data
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);

    // Live data from DashboardService
    const [stats, setStats] = useState({
        totalApplications: 0,
        interviews: 0,
        offers: 0,
        savedJobs: 0
    });
    const [pendingActions, setPendingActions] = useState([]);

    // ── Profile merge ──────────────────────────────────────────────────────────
    const jobSeekerProfile = user?.jobSeekerProfile || {};

    const profile = {
        name:              user?.name           || '',
        email:             user?.email          || '',
        avatar:            user?.profilePicture || null,
        title:             jobSeekerProfile.professionalTitle || '',
        bio:               jobSeekerProfile.bio || '',
        experienceYears:   jobSeekerProfile.experienceYears || 0,
        preferredJobType:  jobSeekerProfile.preferredJobType || '',
    };

    // ── Data fetching ──────────────────────────────────────────────────────────
    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [dbResult, applicationsResult, savedJobsResult, recommendedResult] = await Promise.allSettled([
                dashboardService.getJobSeekerDashboard(),
                jobService.getMyApplications(),
                jobService.getSavedJobs(),
                jobService.getRecommendedJobs()
            ]);

            if (dbResult.status === 'fulfilled') {
                const data = dbResult.value;
                setStats({
                    totalApplications: data.totalApplications || 0,
                    interviews: data.interviewsCount || 0,
                    offers: data.offersCount || 0,
                    savedJobs: data.savedJobsCount || 0
                });
            }

            if (applicationsResult.status === 'fulfilled') {
                const data = applicationsResult.value;
                const items = Array.isArray(data) ? data : (data.items || data.data || []);
                setApplications(items.map(normalizeApplication));
            }

            if (savedJobsResult.status === 'fulfilled') {
                const data = savedJobsResult.value;
                const items = Array.isArray(data) ? data : (data.items || data.data || []);
                setSavedJobs(items.map(normalizeJob));
            }

            if (recommendedResult.status === 'fulfilled') {
                const data = recommendedResult.value;
                const items = Array.isArray(data) ? data : (data.items || data.data || []);
                setRecommendedJobs(items.map(normalizeJob));
            }

            // Generate contextual pending actions
            const generatedActions = [];
            if (!profile.bio) {
                generatedActions.push({
                    id: 'complete-profile',
                    title: 'Complete your profile',
                    description: 'Add a bio and experience to stand out to employers.',
                    type: 'warning',
                    buttonText: 'Update Profile',
                    actionUrl: '/dashboard/profile/edit'
                });
            }

            setPendingActions(generatedActions);

        } catch (err) {
            console.error('[useJobseekerLogic] Unexpected fetch error:', err);
            setError('Failed to load dashboard data. Please refresh.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [profile.bio]);

    // Fetch on mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, [fetchDashboardData]);

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
                navigate('/dashboard/account');
                break;
            case 'download-resume':
                navigate('/dashboard/profile');
                break;
            default:
                console.log(`Quick action: ${action}`);
        }
    }, [navigate]);

    /**
     * Save a job — optimistic update, then API call.
     * Reverts on failure.
     */
    const handleSaveJob = useCallback(async (jobId, saved) => {
        // Optimistic update
        setRecommendedJobs(prev =>
            prev.map(job => job.id === jobId ? { ...job, isSaved: saved } : job)
        );
        setSavedJobs(prev =>
            saved
                ? [...prev, recommendedJobs.find(j => j.id === jobId)].filter(Boolean)
                : prev.filter(j => j.id !== jobId)
        );

        try {
            if (saved) {
                await jobService.saveJob(jobId);
            } else {
                await jobService.unsaveJob(jobId);
            }
        } catch (err) {
            console.error('[handleSaveJob] API error — reverting optimistic update:', err);
            // Revert
            setRecommendedJobs(prev =>
                prev.map(job => job.id === jobId ? { ...job, isSaved: !saved } : job)
            );
            setSavedJobs(prev =>
                saved
                    ? prev.filter(j => j.id !== jobId)
                    : [...prev, recommendedJobs.find(j => j.id === jobId)].filter(Boolean)
            );
        }
    }, [recommendedJobs]);


    /**
     * Withdraw an application — optimistic update, then API call.
     */
    const handleWithdrawApplication = useCallback(async (applicationId) => {
        // Optimistic remove
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        try {
            await jobService.withdrawApplication(applicationId);
        } catch (err) {
            console.error('[handleWithdrawApplication] API error:', err);
            // Re-fetch to restore correct state
            jobService.getMyApplications()
                .then(raw => {
                    const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
                    setApplications(items.map(normalizeApplication));
                })
                .catch(() => { });
        }
    }, []);

    // ── Return value ───────────────────────────────────────────────────────────
    return {
        // State
        loading,
        error,
        refreshing,

        // Legacy compat — components that still use dashboardData.pendingActions etc.
        dashboardData: {
            recommendedJobs,
            applications,
            savedJobs,
            pendingActions,
        },

        // Convenience aliases (preferred — components should use these)
        stats: {
            jobSeeker: stats,
            applications: {
                total: stats.totalApplications,
                interviews: stats.interviews,
                offers: stats.offers
            },
            savedJobs: {
                totalSaved: stats.savedJobs
            },
        },
        profile,
        applications,
        savedJobs,
        // Handlers
        handleRefresh,
        handleQuickAction,
        handleRemoveSavedJob: (jobId) => handleSaveJob(jobId, false),
        handleSaveJob,
        handleWithdrawApplication,
        navigate,

        // Placeholders for legacy data
        skillsAnalysis: { topSkills: [], skillGaps: [] },
        recentActivity: [],
        performance: { applicationRate: 0, responseRate: 0 },
    };
};

export default useJobseekerLogic;

