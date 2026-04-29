import React from 'react';
import { FileText, Clock, TrendingUp, Shell } from 'lucide-react';
import styles from './ApplicationsWidget.module.css';

/**
 * ApplicationsWidget Component
 * @description A condensed view of job applications for the dashboard using premium styles
 */
const ApplicationsWidget = ({ applications = [], onViewApplication = () => {} }) => {
  if (applications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={32} />
        <p>No applications yet. Start applying to track your progress!</p>
      </div>
    );
  }

  return (
    <div className={styles.applicationsWidget}>
      <div className={styles.appList}>
        {applications.slice(0, 3).map((app) => {
          const statusClass = `status_${(app.status || 'applied').toLowerCase().replace(' ', '-')}`;
          
          return (
            <div 
              key={app.id} 
              className={styles.applicationItem}
              onClick={() => onViewApplication(app.id)}
            >
              <div className={styles.itemHeader}>
                <div className={styles.jobInfo}>
                  <h4>{app.jobTitle || app.title}</h4>
                  <div className={styles.company}>{app.company}</div>
                </div>
                <div className={`${styles.statusBadge} ${styles[statusClass] || styles.status_applied}`}>
                  {app.status || "Applied"}
                </div>
              </div>
              
              <div className={styles.itemMeta}>
                <div className={styles.date}>
                  <Clock size={12} />
                  {app.appliedDate || app.date}
                </div>
                {app.matchScore && (
                  <div className={styles.matchScore}>
                    <TrendingUp size={12} />
                    {app.matchScore}% Match
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationsWidget;
