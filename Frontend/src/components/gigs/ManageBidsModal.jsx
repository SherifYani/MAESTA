import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import gigService from '../../services/gigService';
import { LoadingSpinner, Alert, Button } from '../common';
import styles from './ManageBidsModal.module.css';

/**
 * @file ManageBidsModal.jsx
 * @description Modal component to view and manage (accept/reject) gig bids/proposals
 * @author Antigravity (AI)
 * @date 2026-05-01
 */

/**
 * ManageBidsModal component
 * @param {Object} props - The component props.
 * @param {string} props.gigId - The ID of the gig to manage bids for.
 * @param {function} props.onClose - The function to close the modal.
 * @returns {JSX.Element} The rendered modal component.
 */
const ManageBidsModal = ({ gigId, onClose }) => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchProposals();
    }, [gigId, fetchProposals]);

    /**
     * Fetches proposals from the API.
     * @returns {Promise<void>}
     */
    const fetchProposals = async () => {
        try {
            setLoading(true);
            const data = await gigService.getGigProposals(gigId);
            setProposals(data);
        } catch (err) {
            setError(err.message || 'Failed to load proposals');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles accepting a proposal.
     * @param {string} proposalId - The ID of the proposal.
     * @returns {Promise<void>}
     */
    const handleAccept = async (proposalId) => {
        try {
            setProcessingId(proposalId);
            await gigService.acceptProposal(proposalId);
            // Refresh proposals to reflect status change
            fetchProposals();
        } catch (err) {
            alert(err.message || 'Failed to accept proposal');
        } finally {
            setProcessingId(null);
        }
    };

    /**
     * Handles rejecting a proposal.
     * @param {string} proposalId - The ID of the proposal.
     * @returns {Promise<void>}
     */
    const handleReject = async (proposalId) => {
        try {
            setProcessingId(proposalId);
            await gigService.rejectProposal(proposalId);
            // Refresh proposals to reflect status change
            fetchProposals();
        } catch (err) {
            alert(err.message || 'Failed to reject proposal');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className={styles['manage-bids__overlay']} onClick={onClose}>
            <div className={styles['manage-bids__content']} onClick={e => e.stopPropagation()}>
                <header className={styles['manage-bids__header']}>
                    <h2 className={styles['manage-bids__title']}>Manage Proposals</h2>
                    <button className={styles['manage-bids__close-button']} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </header>
                
                <div className={styles['manage-bids__body']}>
                    {loading ? (
                        <div className={styles['manage-bids__loading-container']}>
                            <LoadingSpinner size="medium" />
                            <p>Loading proposals...</p>
                        </div>
                    ) : error ? (
                        <div className={styles['manage-bids__error-container']}>
                            <Alert type="error" message={error} />
                            <Button onClick={fetchProposals} variant="secondary">Retry</Button>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className={styles['manage-bids__empty-state']}>
                            <p>No proposals received yet for this gig.</p>
                        </div>
                    ) : (
                        proposals.map(proposal => (
                            <div key={proposal.id} className={styles['manage-bids__proposal-card']}>
                                <div className={styles['manage-bids__proposal-header']}>
                                    <div>
                                        <h4 className={styles['manage-bids__freelancer-name']}>{proposal.freelancerName || 'Freelancer'}</h4>
                                        <div className={styles['manage-bids__rate']}>
                                            Rate: ${proposal.proposedRate || proposal.bidAmount || 'Negotiable'}
                                            {proposal.estimatedDuration && ` • ${proposal.estimatedDuration}`}
                                        </div>
                                    </div>
                                    <span className={`${styles['manage-bids__status']} ${styles[`manage-bids__status--${proposal.status?.toLowerCase() || 'pending'}`]}`}>
                                        {proposal.status || 'Pending'}
                                    </span>
                                </div>
                                <div className={styles['manage-bids__cover-letter']}>
                                    {proposal.coverLetter || proposal.proposalText || 'No cover letter provided.'}
                                </div>
                                
                                {(!proposal.status || proposal.status.toLowerCase() === 'pending') && (
                                    <div className={styles['manage-bids__actions']}>
                                        <button 
                                            className={`${styles['manage-bids__button']} ${styles['manage-bids__button--reject']}`}
                                            onClick={() => handleReject(proposal.id)}
                                            disabled={processingId === proposal.id}
                                        >
                                            {processingId === proposal.id ? 'Processing...' : 'Reject'}
                                        </button>
                                        <button 
                                            className={`${styles['manage-bids__button']} ${styles['manage-bids__button--accept']}`}
                                            onClick={() => handleAccept(proposal.id)}
                                            disabled={processingId === proposal.id}
                                        >
                                            {processingId === proposal.id ? 'Processing...' : 'Accept'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBidsModal;
