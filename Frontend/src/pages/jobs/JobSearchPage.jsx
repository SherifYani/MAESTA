/**
 * @file JobSearchPage.jsx
 * @description Job search page with filters, pagination, and job cards
 * @author Sherif Talaat
 * @date 2026-02-05
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter } from 'lucide-react';
import { Input, Button } from '../../components/common';
import GeneralSelect from '../../components/common/GeneralSelect';
import jobService from '../../services/jobService';
import JobFilters from '../../components/jobs/JobFilters';
import { PageContainer } from '../../components/layout';
import styles from './JobSearchPage.module.css';

/**
 * JobSearchPage component for searching and filtering jobs
 * @component
 * @returns {JSX.Element} The rendered job search page
 */
const JobSearchPage = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        jobType: '',
        skills: [],
        experienceLevel: '',
        salaryRange: { min: '', max: '' },
        datePosted: 'all'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Mock available skills - in a real app, these would come from an API
    const availableSkills = [
        'React', 'Node.js', 'Python', 'Java', 'TypeScript',
        'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
        'UI/UX Design', 'Project Management', 'Agile'
    ];

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            const response = await jobService.searchJobs(params);
            setJobs(response.data?.jobs || response.jobs || []);
            setPagination(prev => ({
                ...prev,
                total: response.data?.total || response.total || 0,
                totalPages: response.data?.totalPages || response.totalPages || 0
            }));
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    /**
     * Handles search input changes
     * @param {Object} searchParams - The search parameters to update
     */
    const handleSearch = (searchParams) => {
        setFilters(prev => ({ ...prev, ...searchParams }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    /**
     * Handles filter changes
     * @param {Object} newFilters - The new filter values
     */
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    /**
     * Handles pagination page changes
     * @param {number} newPage - The new page number
     */
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo(0, 0);
    };

    /**
     * Handles job card click to navigate to job details
     * @param {string} jobId - The ID of the job to view
     */
    const handleJobClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    /**
     * Handles saving or unsaving a job
     * @async
     * @param {string} jobId - The ID of the job
     * @param {boolean} isSaved - Current saved state
     * @returns {Promise<void>}
     */
    const handleSaveJob = async (jobId, isSaved) => {
        try {
            if (isSaved) {
                await jobService.unsaveJob(jobId);
            } else {
                await jobService.saveJob(jobId);
            }

            setJobs(prev => prev.map(job =>
                job._id === jobId ? { ...job, isSaved: !isSaved } : job
            ));
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    /**
     * Resets all filters to their default values
     */
    const resetFilters = () => {
        setFilters({
            keyword: '',
            location: '',
            jobType: '',
            skills: [],
            experienceLevel: '',
            salaryRange: { min: '', max: '' },
            datePosted: 'all'
        });
    };

    return (
        <PageContainer>
            <div className={styles.header}>
                <h1 className={styles.title}>Job Search</h1>
                <p className={styles.subtitle}>
                    Find the perfect job that matches your skills and interests
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.controlsBar}>
                    <div className={styles.searchSection}>
                        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
                        <Input
                            type="text"
                            placeholder="Search jobs..."
                            value={filters.keyword || ''}
                            onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                            className={styles.searchInput}
                            aria-label="Search jobs by keyword"
                        />
                    </div>

                    <div className={styles.searchSection}>
                        <MapPin size={18} className={styles.locationIcon} aria-hidden="true" />
                        <Input
                            type="text"
                            placeholder="City, state, or remote"
                            value={filters.location || ''}
                            onChange={(e) => handleFilterChange({ location: e.target.value })}
                            className={styles.locationInput}
                            aria-label="Filter by location"
                        />
                    </div>

                    <Button
                        variant="primary"
                        onClick={fetchJobs}
                        className={styles.searchButton}
                    >
                        Search
                    </Button>

                    <button
                        type="button"
                        className={`${styles.filterToggleButton} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="job-filters"
                    >
                        <Filter size={16} aria-hidden="true" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div id="job-filters">
                        <JobFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onApplyFilters={fetchJobs}
                            onClearFilters={resetFilters}
                            availableSkills={availableSkills}
                        />
                    </div>
                )}

                <main className={styles.mainContent}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Loading jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon} aria-hidden="true">🔍</div>
                            <h3 className={styles.emptyTitle}>No jobs found</h3>
                            <p className={styles.emptySubtitle}>
                                Try adjusting your search criteria
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.jobsHeader}>
                                <div className={styles.resultsInfo}>
                                    <span className={styles.resultsCount}>
                                        Showing {jobs.length} of {pagination.total} jobs
                                    </span>
                                </div>
                                <div className={styles.sortOptions}>
                                    <GeneralSelect
                                        value={filters.sortBy || "relevance"}
                                        onChange={(selectedValue) => handleFilterChange({ sortBy: selectedValue })}
                                        options={[
                                            { value: "relevance", label: "Most Relevant" },
                                            { value: "date", label: "Newest" },
                                            { value: "salary", label: "Highest Salary" }
                                        ]}
                                        className={styles.sortSelect}
                                        aria-label="Sort jobs by"
                                    />
                                </div>
                            </div>

                            <div className={styles.jobsGrid}>
                                {jobs.map((job) => (
                                    <article
                                        key={job._id || job.id}
                                        className={styles.jobCard}
                                        onClick={() => handleJobClick(job._id || job.id)}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleJobClick(job._id || job.id);
                                            }
                                        }}
                                        aria-label={`View ${job.title} at ${job.company?.name || job.companyName}`}
                                    >
                                        <div className={styles.jobHeader}>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                            <button
                                                className={`${styles.saveButton} ${job.isSaved ? styles.saveButtonSaved : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveJob(job._id || job.id, job.isSaved);
                                                }}
                                                aria-label={job.isSaved ? 'Remove from saved jobs' : 'Save this job'}
                                            >
                                                {job.isSaved ? '★' : '☆'}
                                            </button>
                                        </div>
                                        <p className={styles.companyName}>
                                            {job.company?.name || job.companyName}
                                        </p>
                                        <p className={styles.jobLocation}>{job.location}</p>
                                        <div className={styles.jobMeta}>
                                            <span className={styles.jobType}>
                                                {job.type || job.jobType}
                                            </span>
                                            {job.salary && (
                                                <span className={styles.salary}>{job.salary}</span>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <nav className={styles.pagination} aria-label="Job search pagination">
                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                className={`${styles.paginationButton} ${pagination.page === pageNum ? styles.paginationButtonActive : ''
                                                    }`}
                                                onClick={() => handlePageChange(pageNum)}
                                                aria-label={`Page ${pageNum}`}
                                                aria-current={pagination.page === pageNum ? 'page' : undefined}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </nav>
                            )}
                        </>
                    )}
                </main>
            </div>
        </PageContainer>
    );
};

export default JobSearchPage;