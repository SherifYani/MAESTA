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
import {
    getJobSeekerDashboardData,
    getJobSeekerStatistics,
    getApplicationStatusSummary,
    getSavedJobsSummary,
} from '../config/dashboard.config';
import { useAuth } from '../../../context/AuthContext';
import jobService from '../../../services/jobService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise a backend Job object into the shape the UI widgets expect.
 * Keeps every original field and adds display-friendly aliases.
 */
const normalizeJob = (job) => ({
    ...job,
    id:          job.id          || job.jobId,
    title:       job.title       || job.jobTitle        || 'Untitled Job',
    company:     job.company     || job.companyName      || 'Unknown Company',
    location:    job.location    || job.jobLocation      || 'Remote',
    salary:      job.salary      || job.salaryRange      || null,
    type:        job.type        || job.jobType          || 'Full-time',
    postedAt:    job.postedAt    || job.createdAt        || null,
    isSaved:     job.isSaved     || false,
    skills:      job.skills      || job.requiredSkills   || [],
    status:      job.status      || 'active',
});

/**
 * Normalise a backend Application object into the shape the UI widgets expect.
 */
const normalizeApplication = (app) => ({
    ...app,
    id:          app.id               || app.applicationId,
    jobTitle:    app.jobTitle         || app.job?.title   || 'Unknown Position',
    company:     app.company          || app.job?.company || 'Unknown Company',
    status:      app.status           || 'pending',
    appliedAt:   app.appliedAt        || app.createdAt   || null,
    location:    app.location         || app.job?.location || 'Remote',
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Custom hook to manage jobseeker dashboard state and logic.
 * @returns {Object} Dashboard data, loading/error state, and action handlers
 */
export const useJobseekerLogic = (initialData) => {
    const navigate    = useNavigate();
    const { user }   = useAuth();

    // ── State ──────────────────────────────────────────────────────────────────
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Live API data
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [applications,    setApplications]    = useState([]);
    const [savedJobs,       setSavedJobs]       = useState([]);

    // Static / mock-backed data (no API endpoints yet)
    const mockSnapshot      = initialData || getJobSeekerDashboardData();
    const [skillsAnalysis]  = useState(mockSnapshot.skillsAnalysis || {});
    const [recentActivity]  = useState(mockSnapshot.recentActivity || []);
    const [performance]     = useState(mockSnapshot.performance    || {});
    const [pendingActions, setPendingActions] = useState([]);

    // ── Profile merge ──────────────────────────────────────────────────────────
    const mockProfile = mockSnapshot.profile || {};
    const profile = {
        ...mockProfile,
        name:   user?.name           || mockProfile.name,
        email:  user?.email          || mockProfile.email,
        avatar: user?.profilePicture || mockProfile.avatar,
    };

    // ── Derived stats (still from mock until stats API exists) ─────────────────
    const jobSeekerStats     = getJobSeekerStatistics();
    const applicationSummary = {
        total: applications.length,
        interviews: applications.filter(a => a.status === 'interview').length,
        offers: applications.filter(a => a.status === 'offer' || a.status === 'accepted').length,
        review: applications.filter(a => a.status === 'review' || a.status === 'pending').length,
    };
    const savedJobsSummary   = {
        totalSaved: savedJobs.length,
        recentlySaved: savedJobs.length
    };

    // ── Data fetching ──────────────────────────────────────────────────────────
    const fetchDashboardData = useCallback(async () => {
        setError(null);
        try {
            // Fetch all three in parallel for speed
            const [jobsResult, applicationsResult, savedJobsResult] =
                await Promise.allSettled([
                    // /api/jobs/recommended may not exist yet — fall back to getJobs
                    jobService.getRecommendedJobs().catch(() => jobService.getJobs()),
                    jobService.getMyApplications(),
                    jobService.getSavedJobs(),
                ]);

            if (jobsResult.status === 'fulfilled') {
                const raw = jobsResult.value;
                // Backend may return { items, total } pagination envelope or plain array
                const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
                setRecommendedJobs(items.map(normalizeJob));
            }

            if (applicationsResult.status === 'fulfilled') {
                const raw = applicationsResult.value;
                const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
                setApplications(items.map(normalizeApplication));
            }

            if (savedJobsResult.status === 'fulfilled') {
                const raw = savedJobsResult.value;
                const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
                setSavedJobs(items.map(normalizeJob));
            }

            // Dynamically generate pending actions based on real API data
            const generatedActions = [];
            
            // Check if profile is incomplete
            if (!user?.name || user?.name === 'Unknown' || (applicationsResult.status === 'fulfilled' && applicationsResult.value?.length === 0)) {
                generatedActions.push({
                    id: 'action-1',
                    title: 'Complete your profile',
                    description: 'Add more details to increase your chances of getting hired.',
                    type: 'warning',
                    buttonText: 'Update Profile',
                    actionUrl: '/dashboard/profile/edit'
                });
            }

            // Check for upcoming interviews
            if (applicationsResult.status === 'fulfilled') {
                const rawApps = applicationsResult.value;
                const items = Array.isArray(rawApps) ? rawApps : (rawApps?.items ?? rawApps?.data ?? []);
                const interviewApps = items.filter(a => a.status === 'interview' || a.status === 'scheduled');
                if (interviewApps.length > 0) {
                    generatedActions.push({
                        id: 'action-2',
                        title: 'Upcoming Interview',
                        description: `You have an interview scheduled for ${interviewApps[0].jobTitle || 'a job'}.`,
                        type: 'info',
                        buttonText: 'View Details',
                        actionUrl: '/dashboard/applications'
                    });
                }
            }

            // Add mock actions if none were generated, to avoid empty state
            if (generatedActions.length === 0 && mockSnapshot.pendingActions) {
                 setPendingActions(mockSnapshot.pendingActions);
            } else {
                 setPendingActions(generatedActions);
            }

        } catch (err) {
            console.error('[useJobseekerLogic] Unexpected fetch error:', err);
            setError('Failed to load dashboard data. Please refresh.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

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
                navigate('/dashboard/profile/edit'); // Job alerts managed in profile settings
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
     * Remove a saved job — optimistic update, then API call.
     */
    const handleRemoveSavedJob = useCallback(async (jobId) => {
        // Optimistic remove
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
        try {
            await jobService.unsaveJob(jobId);
        } catch (err) {
            console.error('[handleRemoveSavedJob] API error:', err);
            // Re-fetch to restore correct state
            jobService.getSavedJobs()
                .then(raw => {
                    const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
                    setSavedJobs(items.map(normalizeJob));
                })
                .catch(() => {});
        }
    }, []);

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
                .catch(() => {});
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
            ...mockSnapshot,
            recommendedJobs,
            applications,
            savedJobs,
            pendingActions,
        },

        // Convenience aliases (preferred — components should use these)
        stats: {
            jobSeeker:    jobSeekerStats,
            applications: applicationSummary,
            savedJobs:    savedJobsSummary,
        },
        profile,
        applications,
        savedJobs,
        skillsAnalysis,
        recentActivity,
        performance,
        recommendedJobs,
        pendingActions,

        // Handlers
        handleRefresh,
        handleQuickAction,
        handleRemoveSavedJob,
        handleSaveJob,
        handleWithdrawApplication,
        navigate,
    };
};

export default useJobseekerLogic;

