import React from 'react';
import { Briefcase, MapPin, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import styles from './RecommendedJobsWidget.module.css';

/**
 * RecommendedJobsWidget Component
 * @description A condensed view of job recommendations for the dashboard
 */
const RecommendedJobsWidget = ({ jobs = [], onViewJob = () => {}, onSaveJob = () => {} }) => {
  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Briefcase size={32} />
        <p>No recommendations yet. Complete your profile to get matched!</p>
      </div>
    );
  }

  return (
    <div className={styles.recommendedJobsWidget}>
      <div className={styles.jobsList}>
        {jobs.slice(0, 3).map((job) => (
          <div 
            key={job.id} 
            className={styles.jobItem}
            onClick={() => onViewJob(job.id)}
          >
            <div className={styles.itemHeader}>
              <div className={styles.jobInfo}>
                <h4>
                  <Briefcase size={16} className={styles.briefcaseIcon} />
                  {job.title}
                </h4>
                <div className={styles.company}>{job.company}</div>
              </div>
              <div className={styles.matchBadge}>
                <TrendingUp size={12} />
                {job.matchScore}%
              </div>
            </div>
            
            <div className={styles.itemMeta}>
              <div className={styles.location}>
                <MapPin size={12} />
                {job.location}
              </div>
              <div className={styles.salary}>
                <DollarSign size={12} />
                {job.salary}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobsWidget;
