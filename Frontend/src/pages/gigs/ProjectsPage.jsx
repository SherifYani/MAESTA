/**
 * @file ProjectsPage.jsx
 * @description Page for clients and freelancers to manage active and completed contracts.
 *              Displays milestone progress, budgets, statuses, and links to the workspaces.
 * @author Antigravity
 * @date 2026-06-20
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-06-20
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, ExternalLink
} from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { Button, LoadingSpinner, Alert } from '../../components/common';
import gigService from '../../services/gigService';
import { useAuth } from '../../context/AuthContext';
import styles from './ProjectsPage.module.css';

/**
 * ProjectsPage component.
 * Displays freelancer/client projects and contracts.
 * @returns {JSX.Element} The rendered Projects page.
 */
const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const role = (user?.role || user?.userType || '').toLowerCase();
  const isClient = role === 'client' || role === 'company';

  /**
   * Fetch active contracts from backend API.
   */
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gigService.getMyContracts();
      
      const projectList = Array.isArray(data) ? data : data?.data || data?.items || [];
      setProjects(projectList);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load projects. Please check your network connection.');
      
      // Fallback mock projects in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock contracts in development mode.');
        setProjects([
          {
            contractId: 201,
            gigId: 101,
            gigTitle: 'Full-Stack React & Node Developer Needed',
            clientName: 'TechCorp International',
            freelancerName: 'Sherif Talaat',
            budget: 2500,
            status: 'Active',
            startDate: '2026-06-10T00:00:00Z',
            completedMilestones: 2,
            totalMilestones: 4,
          },
          {
            contractId: 202,
            gigId: 102,
            gigTitle: 'Design UI/UX Mockups for Job Portal',
            clientName: 'MediaSoft Solutions',
            freelancerName: 'Sherif Talaat',
            budget: 1500,
            status: 'Completed',
            startDate: '2026-05-15T00:00:00Z',
            completedMilestones: 3,
            totalMilestones: 3,
          },
          {
            contractId: 203,
            gigId: 103,
            gigTitle: 'Python Web Scraping Automation Script',
            clientName: 'Alpha Data Systems',
            freelancerName: 'Sherif Talaat',
            budget: 350,
            status: 'Active',
            startDate: '2026-06-18T00:00:00Z',
            completedMilestones: 0,
            totalMilestones: 1,
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    return project.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <PageContainer className={styles.pageContainer} size="lg">
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>My Projects</h1>
          <p className={styles.subtitle}>Track active gigs, milestone progress, budgets, and open workspaces</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.filterBar} role="tablist" aria-label="Filter projects by status">
        {['all', 'active', 'completed'].map(tab => (
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
      ) : error && projects.length === 0 ? (
        <div className={styles.errorContainer}>
          <Alert type="error" message={error} />
          <Button onClick={loadProjects} variant="secondary" className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase className={styles.emptyIcon} size={48} />
          <h3 className={styles.emptyTitle}>No projects found</h3>
          <p className={styles.emptyText}>
            {activeTab === 'all' 
              ? 'You do not have any active or completed projects.' 
              : `You have no projects with status "${activeTab}".`}
          </p>
          {isClient && activeTab === 'all' && (
            <Link to="/gigs/new">
              <Button variant="primary">Post a New Gig</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {filteredProjects.map(project => {
            const statusClass = styles[project.status?.toLowerCase()] || '';
            const total = project.totalMilestones || 1;
            const completed = project.completedMilestones || 0;
            const percentage = Math.round((completed / total) * 100);

            return (
              <article key={project.contractId || project.id} className={styles.projectCard}>
                <div>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.projectTitle}>
                        {project.gigTitle || project.title || 'Freelance Project'}
                      </h3>
                      <span className={styles.partnerName}>
                        {isClient 
                          ? `Freelancer: ${project.freelancerName || 'Assigned Freelancer'}` 
                          : `Client: ${project.clientName || 'Project Client'}`}
                      </span>
                    </div>
                    <span className={`${styles.statusBadge} ${statusClass}`}>
                      {project.status || 'Active'}
                    </span>
                  </div>

                  {/* Progress bar section */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressLabel}>
                      <span>Milestones: {completed}/{total}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.footerSection}>
                  <div className={styles.budgetInfo}>
                    <span>Contract Budget</span>
                    ${(project.budget || project.amount || 0).toLocaleString()}
                  </div>
                  <Link 
                    to={`/gigs/${project.gigId || project.projectId || project.contractId}/workspace`} 
                    className={styles.workspaceLink}
                  >
                    Open Workspace
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default ProjectsPage;
