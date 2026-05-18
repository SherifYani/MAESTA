/**
 * @file GigBiddingPage.jsx
 * @description Page for freelancers to submit bids
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGig } from '../../context/GigContext';
import BidForm from '../../components/gigs/BidForm';
import { LoadingSpinner, Alert, Button } from '../../components/common';
import { PageContainer } from '../../components/layout';
import styles from './GigBiddingPage.module.css';

const GigBiddingPage = () => {
    const { t } = useTranslation(['gigs', 'common']);
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
            <PageContainer className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Alert type="error" message={error} />
                <Button onClick={() => navigate('/gigs')}>{t('gigs:details.backToGigs', 'Back to Gigs')}</Button>
            </PageContainer>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <PageContainer className={styles.headerContent}>
                    <h1 className={styles.title}>{t('gigs:bidding.submitProposal', 'Submit a Proposal')}</h1>
                    <div className={styles.gigSummary}>
                        <h2 className={styles.gigTitle}>{currentGig.title}</h2>
                        <div className={styles.gigMeta}>
                            <span>{t('gigs:bidding.budgetRange', 'Budget: ${{min}} - ${{max}}', { min: currentGig.budget?.min || currentGig.budget, max: currentGig.budget?.max || t('gigs:details.negotiable', 'Negotiable') })}</span>
                            <span>•</span>
                            <span>{t('gigs:bidding.postedDate', 'Posted {{date}}', { date: new Date(currentGig.createdAt).toLocaleDateString() })}</span>
                        </div>
                    </div>
                </PageContainer>
            </header>

            <PageContainer as="main" className={styles.main}>
                <div className={styles.formContainer}>
                    <BidForm
                        gigId={id}
                        onSubmit={handleBidSubmit}
                        onCancel={() => navigate(`/gigs/${id}`)}
                    />
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.sidebarCard}>
                        <h3>{t('gigs:bidding.aboutClient', 'About the Client')}</h3>
                        <div className={styles.clientInfo}>
                            <div className={styles.avatarPlaceholder}>
                                {currentGig.client?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className={styles.clientName}>{currentGig.client?.name || t('gigs:bidding.anonymous', 'Anonymous')}</p>
                                <p className={styles.clientMeta}>{currentGig.client?.location || t('gigs:details.remote', 'Remote')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </div>
    );
};

export default GigBiddingPage;
