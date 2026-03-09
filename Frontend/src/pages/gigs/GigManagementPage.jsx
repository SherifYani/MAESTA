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
import { Button, LoadingSpinner, Alert } from '../../components/common';
import GigCard from '../../components/gigs/GigCard';
import { Plus } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import styles from './GigManagementPage.module.css';

const GigManagementPage = () => {
    const navigate = useNavigate();
    const { userGigs, isLoading, error, fetchUserGigs } = useGig();
    const { isClient, isFreelancer } = useRole();
    const [activeTab, setActiveTab] = useState('active');

    const isClientUser = isClient();

    useEffect(() => {
        // Fetch gigs based on role and status
        fetchUserGigs(isClientUser ? 'client' : 'freelancer', activeTab);
    }, [fetchUserGigs, isClientUser, activeTab]);

    const filteredGigs = userGigs; // functionality depends on service implementation

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
                    {filteredGigs?.length > 0 ? (
                        filteredGigs.map(gig => (
                            <div key={gig.id} className={styles.cardWrapper}>
                                <GigCard
                                    gig={gig}
                                    onClick={() => navigate(`/gigs/${gig.id}`)}
                                />
                                <div className={styles.cardActions}>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleViewWorkspace(gig.id)}
                                    >
                                        Open Workspace
                                    </Button>
                                    {isClient() && gig.status === 'active' && (
                                        <Button variant="outline" size="small">Manage Bids</Button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No {activeTab} gigs found.</p>
                            {isClient() && activeTab === 'active' && (
                                <Button variant="secondary" onClick={handleCreateGig}>Get Started</Button>
                            )}
                        </div>
                    )}
                </div>
            </PageContainer>
        </div>
    );
};

export default GigManagementPage;
