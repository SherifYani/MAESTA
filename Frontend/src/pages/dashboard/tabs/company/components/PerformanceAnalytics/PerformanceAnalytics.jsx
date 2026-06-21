/**
 * @file PerformanceAnalytics.jsx
 * @description Comprehensive performance analytics dashboard with multiple chart visualizations using Recharts
 * @author Sherif Talaat
 * @date 2025-01-22
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-01-22
 */

import {
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    Clock,
    DollarSign,
    Award,
    BarChart3,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    Eye,
    Zap
} from "lucide-react";
import { useState, useMemo } from "react";
import JobMetricsChart from "../shared/JobMetricsChart";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import PropTypes from "prop-types";
import styles from "./PerformanceAnalytics.module.css";

/**
 * Performance Analytics Component
 * @param {Object} props - Component props
 * @param {Object} props.analyticsData - Analytics data from dashboard.config.js
 * @param {Function} props.onPeriodChange - Callback for changing time period
 * @param {Function} props.onExport - Callback for exporting analytics
 * @param {Function} props.onRefresh - Callback for refreshing data
 * @returns {JSX.Element} The rendered performance analytics component
 */
const PerformanceAnalytics = ({
    analyticsData,
    onPeriodChange,
    onExport,
    onRefresh
}) => {
    const [period, setPeriod] = useState("monthly");
    const [selectedMetric, setSelectedMetric] = useState("applications");
    const [loading, setLoading] = useState(false);

    /**
     * Processes data for different chart types in the correct format for Recharts
     * @returns {Object} Processed chart data object
     */
    const chartData = useMemo(() => {
        if (!analyticsData) return {};

        const processData = {
            // Applications trend - line chart
            applications: {
                type: "line",
                data: analyticsData.monthlyTrends?.applications?.map(item => ({
                    name: item.month,
                    value: item.count,
                    trend: item.count > 50 ? 1 : -1
                })) || [],
                title: "Applications Trend",
                subtitle: "Monthly application volume",
                config: {
                    colors: ["var(--color-chart-1)"],
                    line: {
                        strokeWidth: 3,
                        dotSize: 6
                    }
                }
            },

            // Hires trend - line chart
            hires: {
                type: "line",
                data: analyticsData.monthlyTrends?.hires?.map(item => ({
                    name: item.month,
                    value: item.count,
                    trend: item.count > 5 ? 1 : -1
                })) || [],
                title: "Hires Trend",
                subtitle: "Monthly hiring volume",
                config: {
                    colors: ["var(--color-chart-2)"],
                    line: {
                        strokeWidth: 3,
                        strokeDasharray: "5 5"
                    }
                }
            },

            // Time to hire - bar chart
            time: {
                type: "bar",
                data: analyticsData.monthlyTrends?.timeToHire?.map(item => ({
                    name: item.month,
                    value: item.days,
                    trend: item.days < 25 ? 1 : -1
                })) || [],
                title: "Time to Hire",
                subtitle: "Average days to hire",
                config: {
                    bar: {
                        barSize: 30
                    }
                }
            },

            // Application sources - pie chart
            sources: {
                type: "pie",
                data: analyticsData.applicationSources?.map(source => ({
                    name: source.source,
                    value: source.percentage,
                    count: source.count
                })) || [],
                title: "Application Sources",
                subtitle: "Where applicants come from",
                config: {
                    colors: [
                        "var(--color-chart-1)",
                        "var(--color-chart-2)",
                        "var(--color-chart-3)",
                        "var(--color-chart-4)",
                        "var(--color-chart-5)"
                    ]
                }
            },

            // Job performance - bar chart
            jobs: {
                type: "bar",
                data: analyticsData.jobPerformance?.map(job => ({
                    name: job.title.length > 15 ? `${job.title.substring(0, 15)}...` : job.title,
                    value: job.applications,
                    shortlisted: job.shortlisted,
                    hired: job.hired,
                    completionRate: job.completionRate
                })) || [],
                title: "Job Performance",
                subtitle: "Applications by job",
                config: {
                    bar: {
                        barSize: 40,
                        radius: [4, 4, 0, 0]
                    }
                }
            },

            // Recruitment funnel - bar chart
            funnel: {
                type: "bar",
                data: [
                    { name: "Applications", value: analyticsData.recruitmentFunnel?.applications || 0 },
                    { name: "Screened", value: analyticsData.recruitmentFunnel?.screened || 0 },
                    { name: "Shortlisted", value: analyticsData.recruitmentFunnel?.shortlisted || 0 },
                    { name: "Interviewed", value: analyticsData.recruitmentFunnel?.interviewed || 0 },
                    { name: "Offered", value: analyticsData.recruitmentFunnel?.offered || 0 },
                    { name: "Hired", value: analyticsData.recruitmentFunnel?.hired || 0 }
                ],
                title: "Recruitment Funnel",
                subtitle: "Conversion rates through hiring process",
                config: {
                    bar: {
                        barSize: 30
                    }
                }
            },

            // Overview metrics for cards
            overview: {
                totalJobs: analyticsData.overview?.totalJobsPosted || 0,
                activeJobs: analyticsData.overview?.activeJobs || 0,
                totalApplications: analyticsData.overview?.totalApplications || 0,
                avgApplications: analyticsData.overview?.avgApplicationsPerJob || 0,
                totalHires: analyticsData.overview?.totalHires || 0,
                hireRate: analyticsData.overview?.hireRate || 0,
                avgTime: analyticsData.overview?.avgTimeToHire || "N/A",
                completionRate: analyticsData.overview?.applicationCompletionRate || 0
            }
        };

        return processData;
    }, [analyticsData]);

    /**
     * Handles period change
     * @param {string} newPeriod - New period value
     */
    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);

        if (onPeriodChange) {
            onPeriodChange(newPeriod);
        }
    };

    /**
     * Handles export functionality
     */
    const handleExport = () => {
        if (onExport) {
            onExport({
                period,
                selectedMetric,
                data: chartData
            });
        }
    };

    /**
     * Handles data refresh
     */
    const handleRefresh = async () => {
        setLoading(true);

        try {
            if (onRefresh) {
                await onRefresh();
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles chart data point click
     * @param {Object} item - Clicked data item
     * @param {number} index - Index of clicked item
     */
    const handleChartClick = (item, index) => {
        setSelectedMetric(item?.id || item?.name || selectedMetric);
    };

    // Period options configuration
    const periodOptions = [
        { id: "weekly", label: "Weekly" },
        { id: "monthly", label: "Monthly" },
        { id: "quarterly", label: "Quarterly" },
        { id: "yearly", label: "Yearly" }
    ];

    // Metric options configuration
    const metricOptions = [
        { id: "applications", label: "Applications", icon: Users },
        { id: "hires", label: "Hires", icon: Target },
        { id: "time", label: "Time to Hire", icon: Clock },
        { id: "sources", label: "Sources", icon: DollarSign },
        { id: "funnel", label: "Funnel", icon: Award },
        { id: "jobs", label: "Jobs", icon: BarChart3 }
    ];

    /**
     * Gets data for the currently selected metric
     * @returns {Object|null} Metric data or null
     */
    const getActiveMetricData = () => {
        if (!chartData[selectedMetric]) return null;
        return chartData[selectedMetric];
    };

    // Get job performance data for insights section
    const jobPerformanceData = chartData.jobs?.data || [];

    return (
        <div className={styles.performanceAnalytics}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>Performance Analytics</h2>
                    <p className={styles.subtitle}>
                        Comprehensive insights into your recruitment performance
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <Button
                        variant="outline"
                        icon={Download}
                        onClick={handleExport}
                        size="medium"
                    >
                        Export
                    </Button>
                    <Button
                        variant="primary"
                        icon={RefreshCw}
                        onClick={handleRefresh}
                        size="medium"
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Period Selector */}
            <div className={styles.periodSelector}>
                <div className={styles.periodLabel}>
                    <Calendar size={20} />
                    <span>Time Period:</span>
                </div>
                <div className={styles.periodButtons}>
                    {periodOptions.map(option => (
                        <button
                            key={option.id}
                            className={`${styles.periodButton} ${period === option.id ? styles.active : ''}`}
                            onClick={() => handlePeriodChange(option.id)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Metrics */}
            {chartData.overview && (
                <div className={styles.overviewMetrics}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}>
                                <BarChart3 size={24} />
                            </div>
                            <div className={styles.metricTitle}>
                                <span className={styles.metricName}>Total Jobs</span>
                                <Badge variant="info">{chartData.overview.activeJobs} active</Badge>
                            </div>
                        </div>
                        <div className={styles.metricValue}>
                            {chartData.overview.totalJobs}
                        </div>
                        <div className={styles.metricChange}>
                            <span className={styles.changeLabel}>Posted this year</span>
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}>
                                <Users size={24} />
                            </div>
                            <div className={styles.metricTitle}>
                                <span className={styles.metricName}>Applications</span>
                                <Badge variant="success">
                                    {chartData.overview.avgApplications}/job
                                </Badge>
                            </div>
                        </div>
                        <div className={styles.metricValue}>
                            {chartData.overview.totalApplications.toLocaleString()}
                        </div>
                        <div className={styles.metricChange}>
                            <TrendingUp size={16} className={styles.trendUp} />
                            <span className={styles.changeValue}>+12% this month</span>
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}>
                                <Target size={24} />
                            </div>
                            <div className={styles.metricTitle}>
                                <span className={styles.metricName}>Hire Rate</span>
                                <Badge variant="warning">{chartData.overview.totalHires} hires</Badge>
                            </div>
                        </div>
                        <div className={styles.metricValue}>
                            {chartData.overview.hireRate}%
                        </div>
                        <div className={styles.metricChange}>
                            <TrendingDown size={16} className={styles.trendDown} />
                            <span className={styles.changeValue}>-2% from last month</span>
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}>
                                <Clock size={24} />
                            </div>
                            <div className={styles.metricTitle}>
                                <span className={styles.metricName}>Time to Hire</span>
                                <Badge variant="primary">
                                    {chartData.overview.completionRate}% completion
                                </Badge>
                            </div>
                        </div>
                        <div className={styles.metricValue}>
                            {chartData.overview.avgTime}
                        </div>
                        <div className={styles.metricChange}>
                            <span className={styles.changeLabel}>Average duration</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Navigation */}
            <div className={styles.metricsNav}>
                <div className={styles.navHeader}>
                    <Filter size={20} />
                    <span>Metrics View</span>
                </div>
                <div className={styles.navButtons}>
                    {metricOptions.map(option => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.id}
                                className={`${styles.navButton} ${selectedMetric === option.id ? styles.active : ''}`}
                                onClick={() => setSelectedMetric(option.id)}
                            >
                                <Icon size={18} />
                                <span>{option.label}</span>
                                {selectedMetric === option.id && (
                                    <div className={styles.activeIndicator}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Chart Area */}
            <div className={styles.mainChartArea}>
                {loading ? (
                    <div className={styles.chartLoading}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading analytics data...</p>
                    </div>
                ) : getActiveMetricData() ? (
                    <JobMetricsChart
                        {...getActiveMetricData()}
                        onDataPointClick={handleChartClick}
                        loading={loading}
                    />
                ) : (
                    <div className={styles.chartEmpty}>
                        <div className={styles.emptyIcon}>
                            <BarChart3 size={48} />
                        </div>
                        <h3>No data available</h3>
                        <p>Select a different metric or time period</p>
                    </div>
                )}
            </div>

            {/* Additional Insights */}
            <div className={styles.insightsGrid}>
                <Card
                    title="Top Performing Jobs"
                    subtitle="Highest application rates"
                    className={styles.insightCard}
                >
                    <div className={styles.insightList}>
                        {jobPerformanceData.slice(0, 3).map((job, index) => (
                            <div key={index} className={styles.insightItem}>
                                <div className={styles.insightRank}>
                                    <Badge variant={index === 0 ? "success" : "warning"}>
                                        #{index + 1}
                                    </Badge>
                                </div>
                                <div className={styles.insightContent}>
                                    <span className={styles.insightTitle}>{job.name}</span>
                                    <div className={styles.insightStats}>
                                        <span className={styles.insightStat}>
                                            <Users size={12} />
                                            {job.value} apps
                                        </span>
                                        <span className={styles.insightStat}>
                                            <Target size={12} />
                                            {job.completionRate || 0}% completion
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={styles.insightAction}
                                    onClick={() => setSelectedMetric('jobs')}
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card
                    title="Quick Insights"
                    subtitle="Key takeaways"
                    className={styles.insightCard}
                >
                    <div className={styles.insightList}>
                        <div className={styles.insightItem}>
                            <div className={styles.insightIcon}>
                                <Zap size={20} />
                            </div>
                            <div className={styles.insightContent}>
                                <span className={styles.insightTitle}>LinkedIn drives 35% of applications</span>
                                <p className={styles.insightDesc}>
                                    Focus recruitment marketing efforts on LinkedIn for highest ROI
                                </p>
                            </div>
                        </div>

                        <div className={styles.insightItem}>
                            <div className={styles.insightIcon}>
                                <Clock size={20} />
                            </div>
                            <div className={styles.insightContent}>
                                <span className={styles.insightTitle}>Time to hire improving</span>
                                <p className={styles.insightDesc}>
                                    Average time reduced by 2 days this quarter
                                </p>
                            </div>
                        </div>

                        <div className={styles.insightItem}>
                            <div className={styles.insightIcon}>
                                <Target size={20} />
                            </div>
                            <div className={styles.insightContent}>
                                <span className={styles.insightTitle}>Engineering roles attract most applicants</span>
                                <p className={styles.insightDesc}>
                                    45% of all applications are for technical positions
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card
                    title="Conversion Funnel"
                    subtitle="Recruitment pipeline efficiency"
                    className={styles.insightCard}
                >
                    <div className={styles.funnelVisual}>
                        {(chartData.funnel?.data || []).map((stage, index) => {
                            const percentage = index === 0 ? 100 :
                                (stage.value / chartData.funnel.data[0].value) * 100;

                            return (
                                <div key={index} className={styles.funnelStage}>
                                    <div className={styles.funnelHeader}>
                                        <span className={styles.funnelLabel}>{stage.name}</span>
                                        <span className={styles.funnelValue}>{stage.value}</span>
                                    </div>
                                    <div className={styles.funnelBar}>
                                        <div
                                            className={styles.funnelFill}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className={styles.funnelPercentage}>
                                        {percentage.toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card
                    title="Recommendations"
                    subtitle="Actions to improve performance"
                    className={styles.insightCard}
                >
                    <div className={styles.recommendationList}>
                        <div className={styles.recommendationItem}>
                            <div className={styles.recommendationBadge}>
                                <Badge variant="success">Priority</Badge>
                            </div>
                            <p className={styles.recommendationText}>
                                Optimize job descriptions for SEO to increase visibility
                            </p>
                        </div>

                        <div className={styles.recommendationItem}>
                            <div className={styles.recommendationBadge}>
                                <Badge variant="warning">Medium</Badge>
                            </div>
                            <p className={styles.recommendationText}>
                                Implement automated screening to reduce time-to-hire
                            </p>
                        </div>

                        <div className={styles.recommendationItem}>
                            <div className={styles.recommendationBadge}>
                                <Badge variant="info">Long-term</Badge>
                            </div>
                            <p className={styles.recommendationText}>
                                Build talent pipeline for frequent hiring needs
                            </p>
                        </div>

                        <div className={styles.recommendationItem}>
                            <div className={styles.recommendationBadge}>
                                <Badge variant="success">Quick Win</Badge>
                            </div>
                            <p className={styles.recommendationText}>
                                Add employee referral program to improve quality of applicants
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Summary Footer */}
            <div className={styles.summaryFooter}>
                <div className={styles.summaryLeft}>
                    <div className={styles.summaryStat}>
                        <span className={styles.statLabel}>Data Updated:</span>
                        <span className={styles.statValue}>Just now</span>
                    </div>
                    <div className={styles.summaryStat}>
                        <span className={styles.statLabel}>Next Report:</span>
                        <span className={styles.statValue}>Next week</span>
                    </div>
                </div>

                <div className={styles.summaryRight}>
                    <Badge variant="success">Performance: Excellent</Badge>
                    <Badge variant="info">Trend: Improving</Badge>
                    <Badge variant="warning">Action: Review recommended</Badge>
                </div>
            </div>
        </div>
    );
};

// PropTypes validation
PerformanceAnalytics.propTypes = {
    analyticsData: PropTypes.shape({
        monthlyTrends: PropTypes.shape({
            applications: PropTypes.array,
            hires: PropTypes.array,
            timeToHire: PropTypes.array
        }),
        applicationSources: PropTypes.array,
        jobPerformance: PropTypes.array,
        recruitmentFunnel: PropTypes.shape({
            applications: PropTypes.number,
            screened: PropTypes.number,
            shortlisted: PropTypes.number,
            interviewed: PropTypes.number,
            offered: PropTypes.number,
            hired: PropTypes.number
        }),
        overview: PropTypes.shape({
            totalJobsPosted: PropTypes.number,
            activeJobs: PropTypes.number,
            totalApplications: PropTypes.number,
            avgApplicationsPerJob: PropTypes.number,
            totalHires: PropTypes.number,
            hireRate: PropTypes.number,
            avgTimeToHire: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            applicationCompletionRate: PropTypes.number
        })
    }),
    onPeriodChange: PropTypes.func,
    onExport: PropTypes.func,
    onRefresh: PropTypes.func
};

// Default props
PerformanceAnalytics.defaultProps = {
    analyticsData: {},
    onPeriodChange: () => { },
    onExport: () => { },
    onRefresh: () => { }
};

export default PerformanceAnalytics;