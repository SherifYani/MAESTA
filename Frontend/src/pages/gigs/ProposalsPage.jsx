/**
 * @file ProposalsPage.jsx
 * @description Page for freelancers to view and manage their submitted proposals.
 *              Allows filtering by status and withdrawing pending proposals.
 * @author Antigravity
 * @date 2026-06-20
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-06-20
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Trash2, Briefcase, ExternalLink 
} from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { Button, LoadingSpinner, Alert } from '../../components/common';
import gigService from '../../services/gigService';
import styles from './ProposalsPage.module.css';

/**
 * ProposalsPage component.
 * Renders a list of the freelancer's proposals with details and filtering.
 * @returns {JSX.Element} The proposals page element.
 */
const ProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /**
   * Fetch proposals from backend API.
   */
  const loadProposals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gigService.getMyProposals();
      
      // Handle array vs object responses
      const proposalsList = Array.isArray(data) ? data : data?.data || data?.items || [];
      setProposals(proposalsList);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err.message || 'Failed to fetch proposals. Please check your connection.');
      
      // Fallback fallback mock data for testing in development if backend is not active
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock proposals fallback in development mode.');
        setProposals([
          {
            id: 1,
            gigId: 101,
            gigTitle: 'Full-Stack React & Node Developer Needed',
            proposedRate: 45,
            estimatedDuration: '2 weeks',
            status: 'Pending',
            coverLetter: 'I am an experienced full-stack developer with 5+ years of React and Node.js expertise. I have built several projects similar to Job Magnet and would love to help you build your dashboard components.',
            createdAt: '2026-06-18T10:00:00Z',
          },
          {
            id: 2,
            gigId: 102,
            gigTitle: 'Design UI/UX Mockups for Job Portal',
            proposedRate: 35,
            estimatedDuration: '1 month',
            status: 'Accepted',
            coverLetter: 'I have designed several premium user interfaces focusing on glassmorphism, smooth animations, and clean layouts. Let me help you design your frontend pages.',
            createdAt: '2026-06-15T12:00:00Z',
          },
          {
            id: 3,
            gigId: 103,
            gigTitle: 'Python Web Scraping Automation Script',
            proposedRate: 50,
            estimatedDuration: '3 days',
            status: 'Rejected',
            coverLetter: 'I specialize in Python and web scraping scripts using Scrapy and Selenium. I can build your scraper quickly.',
            createdAt: '2026-06-10T14:30:00Z',
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  /**
   * Handle withdrawing a pending proposal.
   * @param {string|number} proposalId - The proposal ID.
   */
  const handleWithdraw = async (proposalId) => {
    if (!window.confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoadingId(proposalId);
      await gigService.withdrawProposal(proposalId);
      setProposals(prev => prev.filter(p => p.id !== proposalId));
    } catch (err) {
      alert(err.message || 'Failed to withdraw proposal. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter proposals list based on active tab
  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'all') return true;
    return proposal.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PageContainer className={styles.pageContainer} size="lg">
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>My Proposals</h1>
          <p className={styles.subtitle}>Track and manage your submitted bids and project proposals</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.filterBar} role="tablist" aria-label="Filter proposals by status">
        {['all', 'pending', 'accepted', 'rejected'].map(tab => (
          <button
            key={tab}
            className={`${styles.filterTab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </div>
      ) : error && proposals.length === 0 ? (
        <div className={styles.errorContainer}>
          <Alert type="error" message={error} />
          <Button onClick={loadProposals} variant="secondary" className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase className={styles.emptyIcon} size={48} />
          <h3 className={styles.emptyTitle}>No proposals found</h3>
          <p className={styles.emptyText}>
            {activeTab === 'all' 
              ? 'You have not submitted any proposals yet.' 
              : `You have no proposals with status "${activeTab}".`}
          </p>
          {activeTab === 'all' && (
            <Link to="/gigs">
              <Button variant="primary">Browse Available Gigs</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.proposalsList}>
          {filteredProposals.map(proposal => {
            const statusClass = styles[proposal.status?.toLowerCase()] || '';
            const isPending = proposal.status?.toLowerCase() === 'pending';

            return (
              <article key={proposal.id} className={styles.proposalCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <Link to={`/gigs/${proposal.gigId || proposal.projectId}`} className={styles.gigTitle}>
                      {proposal.gigTitle || proposal.gigName || 'Freelance Project'}
                      <ExternalLink size={16} />
                    </Link>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        Submitted: {formatDate(proposal.createdAt || proposal.submittedAt)}
                      </span>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${statusClass}`}>
                    {proposal.status || 'Pending'}
                  </span>
                </div>

                <div className={styles.coverLetter}>
                  {proposal.coverLetter || proposal.proposalText || 'No cover letter provided.'}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.bidDetails}>
                    <div className={styles.bidValue}>
                      <span>Proposed Rate</span>
                      ${proposal.proposedRate || proposal.bidAmount || 'Negotiable'}/hr
                    </div>
                    {proposal.estimatedDuration && (
                      <div className={styles.bidValue}>
                        <span>Est. Duration</span>
                        {proposal.estimatedDuration}
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <button
                      className={styles.withdrawButton}
                      onClick={() => handleWithdraw(proposal.id)}
                      disabled={actionLoadingId === proposal.id}
                      aria-label="Withdraw this proposal"
                    >
                      <Trash2 size={14} />
                      {actionLoadingId === proposal.id ? 'Withdrawing...' : 'Withdraw Bid'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default ProposalsPage;
