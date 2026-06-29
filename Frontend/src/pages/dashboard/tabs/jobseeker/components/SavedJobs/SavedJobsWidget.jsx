import React from 'react';
import { Bookmark, MapPin, Clock, ArrowRight } from 'lucide-react';
import styles from './SavedJobsWidget.module.css';

/**
 * SavedJobsWidget Component
 * @description A condensed view of saved jobs for the dashboard
 */
const SavedJobsWidget = ({ jobs = [], onRemove = () => {}, onView = () => {}, onApply = () => {} }) => {
  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Bookmark size={32} />
        <p>No saved jobs yet. Explore recommended jobs to save them!</p>
      </div>
    );
  }

  return (
    <div className={styles.savedJobsWidget}>
      <div className={styles.jobsList}>
        {jobs.slice(0, 3).map((job) => (
          <div 
            key={job.id} 
            className={styles.jobItem}
            onClick={() => onView(job.id)}
          >
            <div className={styles.itemHeader}>
              <div className={styles.jobInfo}>
                <h4>{job.title}</h4>
                <div className={styles.company}>{job.company}</div>
              </div>
              <div className={styles.metaRow}>
                <div className={styles.location}>
                  <MapPin size={12} />
                  {job.location}
                </div>
                <div className={styles.postedDate}>
                  <Clock size={12} />
                  {job.postedDate}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedJobsWidget;
