/**
 * @file SystemHealth.jsx
 * @description Widget to display system health status
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Server, Database, HardDrive, Activity } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import styles from './AdminOverviewWidgets.module.css';

/**
 * Status indicator component for system health.
 * @param {Object} props - Component props.
 * @param {string} props.status - The status (operational, issues).
 * @param {string} props.label - Accessibility label.
 * @returns {JSX.Element} The rendered status indicator.
 */
const StatusIndicator = ({ status, label }) => (
    <span
        className={`${styles.health__statusDot} ${styles[`health__statusDot--${status}`]}`}
        role="img"
        aria-label={label}
        title={label}
    />
);

StatusIndicator.propTypes = {
    status: PropTypes.oneOf(['operational', 'issues']).isRequired,
    label: PropTypes.string.isRequired
};

/**
 * System Health widget component.
 * @param {Object} props - Component props.
 * @param {Object} props.healthData - System health data object.
 * @returns {JSX.Element} The rendered system health widget.
 */
const SystemHealth = ({ healthData }) => {
    const { uptime } = healthData;
    const uptimePercentage = uptime ? parseInt(uptime.replace('%', '')) : 99.9;

    /**
     * Calculates system health score based on statuses.
     * @returns {number} Health score from 0-100.
     */
    const calculateHealthScore = () => {
        const components = [healthData.api, healthData.database, healthData.storage];
        const operationalCount = components.filter(comp => comp.status === 'operational').length;
        return Math.round((operationalCount / components.length) * 100);
    };

    return (
        <Card className={styles.widget}>
            <header className={styles.widget__header}>
                <h2 className={styles.widget__title}>System Health</h2>
                <Activity
                    size={18}
                    aria-hidden="true"
                    color={calculateHealthScore() >= 80 ? 'var(--color-chart-2)' : 'var(--color-chart-3)'}
                />
            </header>
            <div className={styles.health__grid} role="list" aria-label="System health metrics">
                <div className={styles.health__item} role="listitem">
                    <div className={styles.health__label}>
                        <Server size={14} aria-hidden="true" />
                        API Service
                    </div>
                    <div className={styles.health__value}>
                        <StatusIndicator
                            status={healthData.api.status}
                            label={`API status: ${healthData.api.status}`}
                        />
                        <span title={`Latency: ${healthData.api.latency}`}>
                            {healthData.api.latency}
                        </span>
                    </div>
                </div>
                <div className={styles.health__item} role="listitem">
                    <div className={styles.health__label}>
                        <Database size={14} aria-hidden="true" />
                        Database
                    </div>
                    <div className={styles.health__value}>
                        <StatusIndicator
                            status={healthData.database.status}
                            label={`Database status: ${healthData.database.status}`}
                        />
                        <span title={`Load: ${healthData.database.load}`}>
                            {healthData.database.load}
                        </span>
                    </div>
                </div>
                <div className={styles.health__item} role="listitem">
                    <div className={styles.health__label}>
                        <HardDrive size={14} aria-hidden="true" />
                        Storage
                    </div>
                    <div className={styles.health__value}>
                        <StatusIndicator
                            status={healthData.storage.status}
                            label={`Storage status: ${healthData.storage.status}`}
                        />
                        <span title={`Usage: ${healthData.storage.usage}`}>
                            {healthData.storage.usage}
                        </span>
                    </div>
                </div>
                <div className={styles.health__graph} role="presentation">
                    <div
                        className={styles.health__graphBar}
                        style={{ width: `${uptimePercentage}%` }}
                        title={`Uptime: ${uptime}`}
                        aria-label={`System uptime: ${uptime}`}
                    />
                </div>
            </div>
        </Card>
    );
};

SystemHealth.propTypes = {
    /** System health data object */
    healthData: PropTypes.shape({
        api: PropTypes.shape({
            status: PropTypes.oneOf(['operational', 'issues']).isRequired,
            latency: PropTypes.string.isRequired
        }).isRequired,
        database: PropTypes.shape({
            status: PropTypes.oneOf(['operational', 'issues']).isRequired,
            load: PropTypes.string.isRequired
        }).isRequired,
        storage: PropTypes.shape({
            status: PropTypes.oneOf(['operational', 'issues']).isRequired,
            usage: PropTypes.string.isRequired
        }).isRequired,
        uptime: PropTypes.string
    }).isRequired
};

export default SystemHealth;