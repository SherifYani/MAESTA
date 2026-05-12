import React from 'react';
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import styles from '../JobseekerDashboard.module.css';

/**
 * ApplicationStats Component
 * @description Renders application statistics for the job seeker dashboard using premium KPI styles
 */
const ApplicationStats = ({ stats = {}, jobSeekerStats = {} }) => {
  const kpiItems = [
    { label: 'Total Applications', value: stats.total || 0, icon: FileText, change: '+2 this week' },
    { label: 'Interviews', value: stats.interviews || 0, icon: Calendar, change: '1 scheduled' },
    { label: 'Offers', value: stats.offers || 0, icon: CheckCircle, change: 'Keep it up!' },
    { label: 'In Review', value: stats.review || 0, icon: Clock, change: 'Awaiting feedback' },
  ];

  return (
    <section className={styles.metricsSection}>
      <div className={styles.metricsHeader}>
        <h2 className={styles.sectionTitle}>Application Metrics</h2>
        <div className={styles.statsSummary}>
          <div className={styles.statsItem}>
            <strong>{stats.total || 0}</strong> Active
          </div>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {kpiItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={styles.kpiItem}>
              <div className={styles.kpiIconWrapper}>
                <Icon size={24} />
              </div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>{item.label}</span>
                <span className={styles.kpiValue}>{item.value}</span>
                <span className={styles.kpiChange}>{item.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ApplicationStats;
