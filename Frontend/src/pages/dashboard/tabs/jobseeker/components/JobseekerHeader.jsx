/**
 * @file JobseekerHeader.jsx
 * @description Header component for Jobseeker Dashboard
 * @author Sherif Talaat
 */
import React from 'react';
import Button from '../../../components/ui/Button';
import { RefreshCw, Search, Bell } from 'lucide-react';
import styles from '../JobseekerDashboard.module.css';

const JobseekerHeader = ({
    userName,
    refreshing,
    onRefresh,
    onSearch,
    onAlerts
}) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <h1 className={styles.title}>
                    Welcome back, {userName}!
                    {refreshing && <span className={styles.refreshingBadge}>Refreshing...</span>}
                </h1>
                <p className={styles.subtitle}>
                    Track your applications, interviews, and job recommendations in one place
                </p>
            </div>
            <div className={styles.headerActions}>
                <Button
                    variant="outline"
                    icon={RefreshCw}
                    onClick={onRefresh}
                    loading={refreshing}
                    className={`${styles.refreshButton} ${refreshing ? styles.spinning : ''}`}
                >
                    Refresh
                </Button>
                <Button
                    variant="primary"
                    icon={Search}
                    onClick={onSearch}
                    className={styles.primaryButton}
                >
                    Search Jobs
                </Button>
                <Button
                    variant="outline"
                    icon={Bell}
                    onClick={onAlerts}
                    className={styles.secondaryButton}
                >
                    Set Alerts
                </Button>
            </div>
        </header>
    );
};

export default JobseekerHeader;
