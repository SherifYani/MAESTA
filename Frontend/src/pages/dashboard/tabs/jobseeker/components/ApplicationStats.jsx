/**
 * @file ApplicationStats.jsx
 * @description KPI Grid for Application Statistics
 * @author Sherif Talaat
 */
import React from 'react';
import { Mail, Clock, Calendar, Check } from 'lucide-react';
import styles from '../JobseekerDashboard.module.css';

const ApplicationStats = ({ stats, jobSeekerStats }) => {
    return (
        <section className={styles.metricsSection}>
            <div className={styles.metricsHeader}>
                <h2 className={styles.sectionTitle}>Application Overview</h2>
                <div className={styles.statsSummary}>
                    <span className={styles.statsItem}>
                        <strong>{jobSeekerStats.totalApplications}</strong> Total Applications
                    </span>
                    <span className={styles.statsItem}>
                        <strong>{jobSeekerStats.interviewsScheduled}</strong> Interviews
                    </span>
                    <span className={styles.statsItem}>
                        <strong>{jobSeekerStats.offersReceived}</strong> Offers
                    </span>
                </div>
            </div>
            <div className={styles.kpiGrid}>
                <div className={styles.kpiItem}>
                    <div className={styles.kpiIconWrapper}>
                        <Mail size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Total Applications</span>
                        <span className={styles.kpiValue}>{stats.total}</span>
                        <span className={styles.kpiChange}>
                            {stats.underReview} under review
                        </span>
                    </div>
                </div>
                <div className={styles.kpiItem}>
                    <div className={styles.kpiIconWrapper}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Under Review</span>
                        <span className={styles.kpiValue}>{stats.underReview}</span>
                        <span className={styles.kpiChange}>
                            Awaiting response
                        </span>
                    </div>
                </div>
                <div className={styles.kpiItem}>
                    <div className={styles.kpiIconWrapper}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Interviews</span>
                        <span className={styles.kpiValue}>{stats.interview}</span>
                        <span className={styles.kpiChange}>
                            Scheduled & upcoming
                        </span>
                    </div>
                </div>
                <div className={styles.kpiItem}>
                    <div className={styles.kpiIconWrapper}>
                        <Check size={20} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>Offers</span>
                        <span className={styles.kpiValue}>{stats.offers}</span>
                        <span className={styles.kpiChange}>
                            Pending acceptance
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ApplicationStats;
