/**
 * @file GigBiddingPage.jsx
 * @description Page for freelancers to submit bids
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGig } from '../../context/GigContext';
import BidForm from '../../components/gigs/BidForm';
import { LoadingSpinner, Alert, Button } from '../../components/common';
import styles from './GigBiddingPage.module.css';

const GigBiddingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentGig, fetchGigById, submitBid, isLoading, error } = useGig();

    useEffect(() => {
        if (id) {
            fetchGigById(id);
        }
    }, [id, fetchGigById]);

    const handleBidSubmit = async (gigId, bidData) => {
        try {
            await submitBid(gigId, bidData);
            navigate(`/gigs/${gigId}`); // Redirect back to gig details
        } catch (err) {
            console.error('Failed to submit bid:', err);
            // Error is handled in context/form, but could add local alert here
        }
    };

    if (isLoading || !currentGig) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Alert type="error" message={error} />
                <Button onClick={() => navigate('/gigs')}>Back to Gigs</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Submit a Proposal</h1>
                    <div className={styles.gigSummary}>
                        <h2 className={styles.gigTitle}>{currentGig.title}</h2>
                        <div className={styles.gigMeta}>
                            <span>Budget: ${currentGig.budget?.min || currentGig.budget} - ${currentGig.budget?.max || 'Negotiable'}</span>
                            <span>•</span>
                            <span>Posted {new Date(currentGig.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.formContainer}>
                    <BidForm
                        gigId={id}
                        onSubmit={handleBidSubmit}
                        onCancel={() => navigate(`/gigs/${id}`)}
                    />
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.sidebarCard}>
                        <h3>About the Client</h3>
                        <div className={styles.clientInfo}>
                            <div className={styles.avatarPlaceholder}>
                                {currentGig.client?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className={styles.clientName}>{currentGig.client?.name || 'Anonymous'}</p>
                                <p className={styles.clientMeta}>{currentGig.client?.location || 'Remote'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GigBiddingPage;
