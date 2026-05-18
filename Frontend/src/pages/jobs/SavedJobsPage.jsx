/**
 * @file SavedJobsPage.jsx
 * @description Saved jobs page displaying all bookmarked jobs for the user
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import PropTypes from "prop-types";
import jobService from "../../services/jobService";
import { PageContainer } from "../../components/layout";
import { Pagination } from "../../components/common";
import styles from "./SavedJobsPage.module.css";

/**
 * Component for displaying saved/bookmarked jobs
 * @returns {JSX.Element} Rendered saved jobs page
 */
const SavedJobsPage = () => {
    const { t } = useTranslation(['jobs', 'common']);
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const ITEMS_PER_PAGE = 20;
    const totalPages = Math.ceil(savedJobs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedJobs = savedJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    /**
     * Fetches saved jobs from the API
     * @async
     * @returns {Promise<void>}
     */
    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await jobService.getSavedJobs();
            setSavedJobs(data);
        } catch (err) {
            setError(err.message || t('jobs:saved.errorLoad', "Failed to load saved jobs"));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Removes a job from saved jobs
     * @async
     * @param {string} jobId - ID of the job to unsave
     * @returns {Promise<void>}
     */
    const handleUnsaveJob = async (jobId) => {
        try {
            await jobService.unsaveJob(jobId);
            setSavedJobs((prev) => prev.filter((job) => (job._id || job.id) !== jobId));
        } catch (err) {
            console.error("Error removing job:", err);
        }
    };

    /**
     * Navigates to job details page
     * @param {string} jobId - ID of the job to view
     */
    const handleJobClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    /**
     * Navigates to job application page
     * @param {string} jobId - ID of the job to apply for
     * @param {Event} e - Click event
     */
    const handleApply = (jobId, e) => {
        e.stopPropagation();
        navigate(`/jobs/${jobId}/apply`);
    };

    /**
     * Formats date string to localized format
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date string
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <PageContainer size="xl" data-testid="loading-container" className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>{t('jobs:saved.loading', 'Loading saved jobs...')}</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer size="xl">
            <header className={styles.header}>
                <h1>{t('jobs:saved.title', 'Saved Jobs')}</h1>
                <p>{t('jobs:saved.count', '{{count}} saved', { count: savedJobs.length })}</p>
            </header>

            {error && (
                <div className={styles.errorAlert} role="alert">
                    {error}
                </div>
            )}

            {savedJobs.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon} aria-hidden="true">☆</div>
                    <h2>{t('jobs:saved.noJobsTitle', 'No saved jobs yet')}</h2>
                    <p>{t('jobs:saved.noJobsDesc', 'Jobs you save will appear here for easy access')}</p>
                    <button
                        className={styles.browseButton}
                        onClick={() => navigate("/jobs")}
                        aria-label={t('jobs:saved.browseAria', 'Browse available jobs')}
                    >
                        {t('jobs:saved.browseButton', 'Browse Jobs')}
                    </button>
                </div>
            ) : (
                <>
                <ul className={styles.jobsList} aria-label={t('jobs:saved.listAria', 'Saved jobs list')}>
                    {paginatedJobs.map((job) => (
                        <li
                            key={job._id || job.id}
                            className={styles.jobCard}
                            onClick={() => handleJobClick(job._id || job.id)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === "Enter" && handleJobClick(job._id || job.id)}
                            aria-label={t('jobs:saved.viewDetailsAria', 'View details for {{title}} at {{company}}', { title: job.title, company: job.company?.name })}
                        >
                            <div className={styles.jobLogo}>
                                {job.company?.logo ? (
                                    <img
                                        src={job.company.logo}
                                        alt={`${job.company.name} logo`}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.logoPlaceholder}>
                                        {job.company?.name?.charAt(0) || "C"}
                                    </div>
                                )}
                            </div>

                            <div className={styles.jobContent}>
                                <div className={styles.jobHeader}>
                                    <h3 className={styles.jobTitle}>{job.title}</h3>
                                    <button
                                        className={styles.unsaveButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnsaveJob(job._id || job.id);
                                        }}
                                        title={t('jobs:search.removeSaved', 'Remove from saved jobs')}
                                        aria-label={t('jobs:saved.unsaveAria', 'Unsave {{title}}', { title: job.title })}
                                    >
                                        ★
                                    </button>
                                </div>

                                <p className={styles.companyName}>{job.company?.name}</p>

                                <div className={styles.jobMeta}>
                                    <span className={styles.location}>📍 {job.location}</span>
                                    <span className={styles.jobType}>💼 {job.type || job.jobType}</span>
                                    {job.salary && <span className={styles.salary}>💰 {job.salary}</span>}
                                </div>

                                {job.savedAt && (
                                    <p className={styles.savedDate}>
                                        {t('jobs:saved.savedOn', 'Saved on {{date}}', { date: formatDate(job.savedAt) })}
                                    </p>
                                )}
                            </div>

                            <div className={styles.jobActions}>
                                <button
                                    className={styles.applyButton}
                                    onClick={(e) => handleApply(job._id || job.id, e)}
                                    aria-label={t('jobs:saved.applyAria', 'Apply for {{title}}', { title: job.title })}
                                >
                                    {t('jobs:details.applyNow', 'Apply Now')}
                                </button>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => handleJobClick(job._id || job.id)}
                                    aria-label={t('jobs:saved.viewAria', 'View details for {{title}}', { title: job.title })}
                                >
                                    {t('jobs:saved.viewDetails', 'View Details')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={ITEMS_PER_PAGE}
                        showTotal={true}
                        totalItems={savedJobs.length}
                    />
                )}
                </>
            )}
        </PageContainer>
    );
};

export default SavedJobsPage;