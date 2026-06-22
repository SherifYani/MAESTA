/**
 * @file GigPostingPage.jsx
 * @description Page for clients to post new gigs
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGig } from '../../context/GigContext';
import draftService from '../../services/draftService';
import GigPostForm from '../../components/gigs/GigPostForm';
import { Button, Alert } from '../../components/common';
import { PageContainer } from '../../components/layout';
import styles from './GigPostingPage.module.css';

const GigPostingPage = () => {
    const navigate = useNavigate();
    const { createGig, error } = useGig();

    const handleSubmit = async (gigData) => {
        try {
            await createGig(gigData);
            navigate('/gigs'); // Redirect to listing or dashboard
        } catch (err) {
            console.error('Failed to post gig:', err);
        }
    };

    const handleSaveDraft = async (gigData) => {
        try {
            await draftService.saveDraft('gigPostingDraft', gigData);
        } catch (err) {
            console.error('Failed to save draft:', err);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <PageContainer className={styles.headerContent}>
                    <Button variant="ghost" onClick={() => navigate('/gigs')} className={styles.backButton}>
                        ← Back to Gigs
                    </Button>
                    <h1 className={styles.title}>Post a New Gig</h1>
                    <p className={styles.subtitle}>
                        Find the perfect talent for your next project.
                        Provide as much detail as possible to attract the best freelancers.
                    </p>
                </PageContainer>
            </header>

            <PageContainer as="main" className={styles.main}>
                {error && (
                    <div className={styles.alertWrapper}>
                        <Alert type="error" message={error} />
                    </div>
                )}

                <div className={styles.formWrapper}>
                    <GigPostForm
                        onSubmit={handleSubmit}
                        onSaveDraft={handleSaveDraft}
                    />
                </div>
            </PageContainer>
        </div>
    );
};

export default GigPostingPage;
