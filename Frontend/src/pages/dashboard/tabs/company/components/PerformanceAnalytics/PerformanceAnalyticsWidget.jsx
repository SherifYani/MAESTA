/**
 * @file PerformanceAnalyticsWidget.jsx
 * @description Lightweight performance analytics widget for company dashboard overview
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 202626-01-28
 */

import { TrendingUp, Target, Clock, Users, BarChart3 } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import PropTypes from "prop-types";
import styles from "./PerformanceAnalyticsWidget.module.css";

/**
 * Performance Analytics Widget Component
 * @param {Object} props - Component props
 * @param {Object} props.analytics - Analytics overview data
 * @param {Function} props.onViewDetails - Callback for viewing detailed analytics
 * @returns {JSX.Element} Widget component
 */
const PerformanceAnalyticsWidget = ({ analytics, onViewDetails }) => {
    const overview = analytics?.overview || {};

    const metrics = [
        {
            icon: BarChart3,
            label: "Active Jobs",
            value: overview.activeJobs || 0,
            badge: `${overview.totalJobsPosted || 0} total`,
            variant: "info"
        },
        {
            icon: Users,
            label: "Applications",
            value: overview.totalApplications?.toLocaleString() || "0",
            badge: `${overview.avgApplicationsPerJob || 0}/job`,
            variant: "success"
        },
        {
            icon: Target,
            label: "Hire Rate",
            value: `${overview.hireRate || 0}%`,
            badge: `${overview.totalHires || 0} hires`,
            variant: "warning"
        },
        {
            icon: Clock,
            label: "Avg Time",
            value: overview.avgTimeToHire || "N/A",
            badge: `${overview.applicationCompletionRate || 0}% completion`,
            variant: "primary"
        }
    ];

    return (
        <div className={styles.performanceWidget}>
            <div className={styles.metricsGrid}>
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} className={styles.metricItem}>
                            <div className={styles.metricIcon}>
                                <Icon size={20} />
                            </div>
                            <div className={styles.metricContent}>
                                <span className={styles.metricLabel}>{metric.label}</span>
                                <span className={styles.metricValue}>{metric.value}</span>
                                <Badge variant={metric.variant} className={styles.metricBadge}>
                                    {metric.badge}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>

            {analytics?.monthlyTrends && (
                <div className={styles.trendIndicator}>
                    <TrendingUp size={16} className={styles.trendIcon} />
                    <span>+12% applications this month</span>
                </div>
            )}
        </div>
    );
};

PerformanceAnalyticsWidget.propTypes = {
    analytics: PropTypes.shape({
        overview: PropTypes.object,
        monthlyTrends: PropTypes.object
    }),
    onViewDetails: PropTypes.func
};

PerformanceAnalyticsWidget.defaultProps = {
    analytics: {},
    onViewDetails: () => { }
};

export default PerformanceAnalyticsWidget;
