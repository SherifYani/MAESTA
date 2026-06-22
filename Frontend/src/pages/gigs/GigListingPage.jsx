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
import { Button, Input, LoadingSpinner, Pagination } from '../../components/common';
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

    if (isLoading && (gigs?.length ?? 0) === 0) {
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
                        Filters {Object.values(filters).some(f => f && f !== 'all' && (f?.length ?? 0) !== 0 && typeof f !== 'object') ? '•' : ''}
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
                            Showing {gigs?.length ?? 0} gigs
                        </p>
                    </div>

                    <div className={styles.gigsGrid}>
                        {(gigs?.length ?? 0) === 0 ? (
                            <div className={styles.noResults}>
                                <h3>No gigs found</h3>
                                <p>Try adjusting your search filters</p>
                            </div>
                        ) : (
                            gigs.map(gig => {
                                const gigId = gig.id || gig.projectId;
                                return (
                                    <GigCard
                                        key={gigId || Math.random()}
                                        gig={gig}
                                        onClick={() => navigateToGigDetails(gigId)}
                                    />
                                );
                            })
                        )}
                    </div>

                    {pagination.total > pagination.limit && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={Math.ceil(pagination.total / pagination.limit)}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                            pageSize={pagination.limit}
                            onPageSizeChange={(newSize) => {
                                setPagination(prev => ({ ...prev, limit: newSize, page: 1 }));
                            }}
                            showTotal={true}
                            totalItems={pagination.total}
                        />
                    )}
                </main>
            </div>
        </PageContainer>
    );
};

export default GigListingPage;