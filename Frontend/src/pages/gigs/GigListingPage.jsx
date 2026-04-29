/**
 * @file GigListingPage.jsx
 * @description Page for browsing and searching available gigs
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGig } from '../../context/GigContext';
import GigCard from '../../components/gigs/GigCard';
import GigFilters from '../../components/gigs/GigFilters';
import { PageContainer } from '../../components/layout';
import { Button, Input, LoadingSpinner } from '../../components/common';
import { Filter, Search } from 'lucide-react';
import styles from './GigListingPage.module.css';

/**
 * Gig listing page component
 * @returns {JSX.Element} Gig listing page
 */
const GigListingPage = () => {
    const navigate = useNavigate();
    const { gigs, isLoading, error, fetchGigs } = useGig();
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        budget: {
            min: '',
            max: ''
        },
        type: '',
        duration: '',
        skills: [],
        experienceLevel: ''
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    /**
     * Handle filter changes
     * @param {Object} newFilters - Updated filters
     */
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    /**
     * Apply filters and fetch gigs
     */
    const applyFilters = useCallback(() => {
        fetchGigs(filters, pagination.page, pagination.limit);
    }, [fetchGigs, filters, pagination.page, pagination.limit]);

    /**
     * Navigate to gig details
     * @param {string|number} gigId - Gig ID
     */
    const navigateToGigDetails = useCallback((gigId) => {
        navigate(`/gigs/${gigId}`);
    }, [navigate]);

    /**
     * Navigate to gig posting
     */
    const navigateToPostGig = useCallback(() => {
        navigate('/gigs/new');
    }, [navigate]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    if (isLoading && gigs.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <PageContainer className={styles.pageContainer} size="lg">
            <header className={styles.header}>
                <h1 className={styles.title}>Find Your Next Project</h1>
                <p className={styles.subtitle}>
                    Browse through available gigs and find the perfect match for your skills
                </p>
                <Button
                    variant="primary"
                    onClick={navigateToPostGig}
                    className={styles.postButton}
                >
                    Post a New Gig
                </Button>
            </header>

            <div className={styles.content}>
                <div className={styles.controlsBar}>
                    <div className={styles.searchSection}>
                        <Search className={styles.searchIcon} size={18} />
                        <Input
                            type="text"
                            placeholder="Search gigs by title, skills..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                            className={styles.searchInput}
                        />
                        <Button
                            variant="primary"
                            onClick={applyFilters}
                            className={styles.searchButton}
                        >
                            Search
                        </Button>
                    </div>

                    <button
                        className={`${styles.filterToggleButton} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filters {Object.values(filters).some(f => f && f !== 'all' && f.length !== 0 && typeof f !== 'object') ? '•' : ''}
                    </button>
                </div>

                {showFilters && (
                    <GigFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onApplyFilters={applyFilters}
                    />
                )}

                <main className={styles.mainContent}>
                    {error && (
                        <div className={styles.errorAlert}>
                            <p>{error}</p>
                            <Button onClick={applyFilters}>Try Again</Button>
                        </div>
                    )}

                    <div className={styles.resultsInfo}>
                        <p className={styles.resultsCount}>
                            Showing {gigs.length} gigs
                        </p>
                    </div>

                    <div className={styles.gigsGrid}>
                        {gigs.length === 0 ? (
                            <div className={styles.noResults}>
                                <h3>No gigs found</h3>
                                <p>Try adjusting your search filters</p>
                            </div>
                        ) : (
                            gigs.map(gig => (
                                <GigCard
                                    key={gig.id}
                                    gig={gig}
                                    onClick={() => navigateToGigDetails(gig.id)}
                                />
                            ))
                        )}
                    </div>

                    {pagination.total > pagination.limit && (
                        <div className={styles.pagination}>
                            <Button
                                variant="secondary"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                Previous
                            </Button>
                            <span className={styles.pageInfo}>
                                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                            </span>
                            <Button
                                variant="secondary"
                                disabled={pagination.page * pagination.limit >= pagination.total}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </PageContainer>
    );
};

export default GigListingPage;