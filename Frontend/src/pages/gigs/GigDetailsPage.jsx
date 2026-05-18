/**
 * @file GigDetailsPage.jsx
 * @description Page for viewing gig details and submitting bids
 * @author Sherif Talaat
 * @date 05-02-2026
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGig } from '../../context/GigContext';
import { useRole } from '../../hooks/useRole';
import GigCard from '../../components/gigs/GigCard';
import BidForm from '../../components/gigs/BidForm';
import { Button, LoadingSpinner, Alert } from '../../components/common';
import { PageContainer } from '../../components/layout';
import styles from './GigDetailsPage.module.css';

const GigDetailsPage = () => {
    const { t } = useTranslation(['gigs', 'common']);
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentGig, isLoading, error, fetchGigById } = useGig();
    const { isFreelancer, canBidOnGigs } = useRole();

    const [showBidForm, setShowBidForm] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (id) {
            fetchGigById(id);
        }
    }, [id, fetchGigById]);

    const handleBidSubmit = async (bidData) => {
        // Implement bid submission logic
        console.log('Bid submitted:', bidData);
        // Here you would typically call submitBid from context
        setShowBidForm(false);
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <Alert type="error" message={error} />
                <Button onClick={() => navigate('/gigs')}>{t('gigs:details.backToGigs', 'Back to Gigs')}</Button>
            </div>
        );
    }

    if (!currentGig) {
        return (
            <div className={styles.notFound}>
                <h2>{t('gigs:details.notFound', 'Gig not found')}</h2>
                <Button onClick={() => navigate('/gigs')}>{t('gigs:details.browseGigs', 'Browse Gigs')}</Button>
            </div>
        );
    }

    return (
        <PageContainer>
            <header className={styles.header}>
                <Button variant="secondary" onClick={() => navigate('/gigs')}>
                    ← {t('gigs:details.backToGigs', 'Back to Gigs')}
                </Button>

                <div className={styles.headerActions}>
                    <Button variant="secondary">{t('gigs:details.saveGig', 'Save Gig')}</Button>
                    <Button variant="secondary">{t('gigs:details.share', 'Share')}</Button>
                    {isFreelancer() && canBidOnGigs() && (
                        <Button variant="primary" onClick={() => navigate(`/gigs/${id}/bid`)}>
                            {t('gigs:details.submitProposal', 'Submit Proposal')}
                        </Button>
                    )}
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.gigOverview}>
                    <GigCard gig={currentGig} onClick={() => { }} className={styles.detailCard} />
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        {t('gigs:details.tabs.details', 'Details')}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'skills' ? styles.active : ''}`}
                        onClick={() => setActiveTab('skills')}
                    >
                        {t('gigs:details.tabs.requiredSkills', 'Required Skills')}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'milestones' ? styles.active : ''}`}
                        onClick={() => setActiveTab('milestones')}
                    >
                        {t('gigs:details.tabs.milestones', 'Milestones')}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'qna' ? styles.active : ''}`}
                        onClick={() => setActiveTab('qna')}
                    >
                        {t('gigs:details.tabs.qna', 'Q&A')}
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'details' && (
                        <div className={styles.detailsContent}>
                            <h3>{t('gigs:details.projectDesc', 'Project Description')}</h3>
                            <div className={styles.description}>
                                {currentGig.description}
                            </div>

                            <div className={styles.metadataGrid}>
                                <div className={styles.metadataItem}>
                                    <strong>{t('gigs:details.budget', 'Budget:')}</strong>
                                    <span>
                                        {currentGig.budget?.min
                                            ? `$${currentGig.budget.min} - $${currentGig.budget.max}`
                                            : `$${currentGig.budget || t('gigs:details.negotiable', 'Negotiable')}`}
                                    </span>
                                </div>
                                <div className={styles.metadataItem}>
                                    <strong>{t('gigs:details.duration', 'Duration:')}</strong>
                                    <span>{t('gigs:details.durationDays', '{{duration}} days', { duration: currentGig.duration })}</span>
                                </div>
                                <div className={styles.metadataItem}>
                                    <strong>{t('gigs:details.experienceLevel', 'Experience Level:')}</strong>
                                    <span>{currentGig.experienceLevel}</span>
                                </div>
                                <div className={styles.metadataItem}>
                                    <strong>{t('gigs:details.location', 'Location:')}</strong>
                                    <span>{currentGig.location || t('gigs:details.remote', 'Remote')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className={styles.skillsContent}>
                            <h3>{t('gigs:details.tabs.requiredSkills', 'Required Skills')}</h3>
                            <div className={styles.skillsList}>
                                {currentGig.requiredSkills?.map((skill, index) => (
                                    <span key={index} className={styles.skillTag}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'milestones' && (
                        <div className={styles.detailsContent}>
                            <h3>{t('gigs:details.tabs.milestones', 'Milestones')}</h3>
                            {currentGig.milestones && currentGig.milestones.length > 0 ? (
                                <div className={styles.milestonesList}>
                                    {currentGig.milestones.map((milestone) => (
                                        <div key={milestone.id} className={styles.milestoneItem}>
                                            <div className={styles.milestoneHeader}>
                                                <span className={styles.milestoneDescription}>{milestone.description}</span>
                                                <span className={styles.milestoneAmount}>${milestone.amount}</span>
                                            </div>
                                            <div className={styles.milestoneMeta}>
                                                <span>{t('gigs:details.due', 'Due: {{date}}', { date: new Date(milestone.deadline).toLocaleDateString() })}</span>
                                                <span className={`${styles.statusTag} ${styles[milestone.status]}`}>
                                                    {milestone.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>{t('gigs:details.noMilestones', 'No milestones defined for this gig yet.')}</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'qna' && (
                        <div className={styles.detailsContent}>
                            <h3>{t('gigs:details.qnaTitle', 'Questions & Answers')}</h3>
                            {currentGig.qna && currentGig.qna.length > 0 ? (
                                <div className={styles.qnaList}>
                                    {currentGig.qna.map((item) => (
                                        <div key={item.id} className={styles.qnaItem}>
                                            <div className={styles.question}>
                                                <strong>{t('gigs:details.questionPrefix', 'Q: {{question}}', { question: item.question })}</strong>
                                                <span className={styles.qnaMeta}>
                                                    {t('gigs:details.askedBy', 'asked by {{asker}} on {{date}}', { asker: item.asker, date: new Date(item.date).toLocaleDateString() })}
                                                </span>
                                            </div>
                                            {item.answer && (
                                                <div className={styles.answer}>
                                                    <strong>{t('gigs:details.answerPrefix', 'A:')}</strong> {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>{t('gigs:details.noQuestions', 'No questions yet.')}</p>
                            )}
                        </div>
                    )}
                </div>

                {showBidForm && (
                    <div className={styles.bidFormSection}>
                        <BidForm
                            gigId={currentGig.id}
                            onSubmit={handleBidSubmit}
                            onCancel={() => setShowBidForm(false)}
                        />
                    </div>
                )}
            </main>
        </PageContainer>
    );
};

export default GigDetailsPage;
