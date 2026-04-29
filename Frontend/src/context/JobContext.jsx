/**
 * @file JobContext.jsx
 * @description Job context - manages job listings, applications, and search state globally
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import React, { createContext, useState, useContext, useCallback } from 'react';
import jobService from '../services/jobService';
import { useAuth } from './AuthContext';

const JobContext = createContext({});

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchFilters, setSearchFilters] = useState({});
    const [pagination, setPagination] = useState({ page: 1, total: 0, hasMore: true });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search and filter jobs
    const searchJobs = useCallback(async (filters = {}, page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const data = await jobService.searchJobs({ ...filters, page });

            if (page === 1) {
                setJobs(data.jobs || data);
            } else {
                setJobs(prev => [...prev, ...(data.jobs || data)]);
            }

            setPagination({
                page,
                total: data.total || data.length,
                hasMore: data.hasMore ?? (data.jobs?.length === 20)
            });
            setSearchFilters(filters);
        } catch (err) {
            setError(err.message || 'Failed to search jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load more jobs
    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || loading) return;
        await searchJobs(searchFilters, pagination.page + 1);
    }, [searchFilters, pagination, loading, searchJobs]);

    // Get job details
    const getJobDetails = useCallback(async (jobId) => {
        try {
            setLoading(true);
            const job = await jobService.getJobById(jobId);
            setSelectedJob(job);
            return job;
        } catch (err) {
            setError(err.message || 'Failed to load job details');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get recommended jobs
    const getRecommendedJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await jobService.getRecommendedJobs();
            return data;
        } catch (err) {
            setError(err.message || 'Failed to load recommendations');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Save/unsave job
    const toggleSaveJob = useCallback(async (jobId) => {
        try {
            const isSaved = savedJobs.some(j => j.id === jobId);

            if (isSaved) {
                await jobService.unsaveJob(jobId);
                setSavedJobs(prev => prev.filter(j => j.id !== jobId));
            } else {
                await jobService.saveJob(jobId);
                const job = jobs.find(j => j.id === jobId) || selectedJob;
                if (job) {
                    setSavedJobs(prev => [...prev, job]);
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to update saved jobs');
            throw err;
        }
    }, [savedJobs, jobs, selectedJob]);

    // Load saved jobs
    const loadSavedJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await jobService.getSavedJobs();
            setSavedJobs(data);
        } catch (err) {
            setError(err.message || 'Failed to load saved jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    // Apply to job
    const applyToJob = useCallback(async (jobId, applicationData) => {
        try {
            setError(null);
            const application = await jobService.applyToJob(jobId, applicationData);
            setMyApplications(prev => [...prev, application]);
            return application;
        } catch (err) {
            setError(err.message || 'Application failed');
            throw err;
        }
    }, []);

    // Load my applications
    const loadMyApplications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await jobService.getMyApplications();
            setMyApplications(data);
        } catch (err) {
            setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Withdraw application
    const withdrawApplication = useCallback(async (applicationId) => {
        try {
            await jobService.withdrawApplication(applicationId);
            setMyApplications(prev => prev.filter(a => a.id !== applicationId));
        } catch (err) {
            setError(err.message || 'Failed to withdraw application');
            throw err;
        }
    }, []);

    // Check if job is saved
    const isJobSaved = useCallback((jobId) => {
        return savedJobs.some(j => j.id === jobId);
    }, [savedJobs]);

    // Check if applied to job
    const hasApplied = useCallback((jobId) => {
        return myApplications.some(a => a.jobId === jobId);
    }, [myApplications]);

    const value = {
        jobs,
        savedJobs,
        myApplications,
        selectedJob,
        searchFilters,
        pagination,
        loading,
        error,
        searchJobs,
        loadMore,
        getJobDetails,
        getRecommendedJobs,
        toggleSaveJob,
        loadSavedJobs,
        applyToJob,
        loadMyApplications,
        withdrawApplication,
        isJobSaved,
        hasApplied,
        setSelectedJob,
        setSearchFilters,
        setError
    };

    return (
        <JobContext.Provider value={value}>
            {children}
        </JobContext.Provider>
    );
};

export default JobContext;
