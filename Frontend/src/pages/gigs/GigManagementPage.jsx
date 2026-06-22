/**
 * @file GigManagementPage.jsx
 * @description Page for managing posted gigs or active bids
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGig } from '../../context/GigContext';
import { useRole } from '../../hooks/useRole';
import { Button, LoadingSpinner, Alert, Pagination } from '../../components/common';
import GigCard from '../../components/gigs/GigCard';
import ManageBidsModal from '../../components/gigs/ManageBidsModal';
import { Plus } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import styles from './GigManagementPage.module.css';

const GigManagementPage = () => {
    const navigate = useNavigate();
    const { userGigs, isLoading, error, fetchUserGigs } = useGig();
    const { isClient } = useRole();
    const [activeTab, setActiveTab] = useState('active');
    const [manageBidsGigId, setManageBidsGigId] = useState(null);

    const isClientUser = isClient();

    useEffect(() => {
        // Fetch gigs based on role and status
        fetchUserGigs(isClientUser ? 'client' : 'freelancer', activeTab);
    }, [fetchUserGigs, isClientUser, activeTab]);

    const filteredGigs = userGigs; // functionality depends on service implementation

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const totalPages = Math.ceil((filteredGigs?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedGigs = filteredGigs?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleCreateGig = () => {
        navigate('/gigs/new');
    };

    const handleViewWorkspace = (gigId) => {
        navigate(`/gigs/${gigId}/workspace`);
    };

    if (isLoading) {
        return (
            <PageContainer className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </PageContainer>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <PageContainer className={styles.headerContent}>
                    <h1 className={styles.title}>My Gigs</h1>
                    {isClient() && (
                        <Button variant="primary" onClick={handleCreateGig} className={styles.createButton}>
                            <Plus size={16} /> Post New Gig
                        </Button>
                    )}
                </PageContainer>
            </header>

            <PageContainer as="main" className={styles.main}>
                <div className={styles.tabs}>
                    {['active', 'completed', 'drafts'].map(status => (
                        <button
                            key={status}
                            className={`${styles.tab} ${activeTab === status ? styles.active : ''}`}
                            onClick={() => setActiveTab(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {error && <Alert type="error" message={error} />}

                <div className={styles.grid}>
                    {paginatedGigs?.length > 0 ? (
                        paginatedGigs.map(gig => {
                            const gigId = gig.id || gig.projectId;
                            return (
                            <div key={gigId || Math.random()} className={styles.cardWrapper}>
                                <GigCard
                                    gig={gig}
                                    onClick={() => navigate(`/gigs/${gigId}`)}
                                />
                                <div className={styles.cardActions}>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleViewWorkspace(gigId)}
                                    >
                                        Open Workspace
                                    </Button>
                                    {isClient() && gig.status === 'active' && (
                                        <Button variant="outline" size="small" onClick={() => setManageBidsGigId(gigId)}>
                                            Manage Bids
                                        </Button>
                                    )}
                                </div>
                            </div>
                            );
                        })
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No {activeTab} gigs found.</p>
                            {isClient() && activeTab === 'active' && (
                                <Button variant="secondary" onClick={handleCreateGig}>Get Started</Button>
                            )}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={{ marginTop: '2rem' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={ITEMS_PER_PAGE}
                            showTotal={true}
                            totalItems={filteredGigs?.length || 0}
                        />
                    </div>
                )}
            </PageContainer>
            
            {manageBidsGigId && (
                <ManageBidsModal 
                    gigId={manageBidsGigId} 
                    onClose={() => setManageBidsGigId(null)} 
                />
            )}
        </div>
    );
};

export default GigManagementPage;
