/**
 * @file StatisticsDashboard.jsx
 * @description Statistics Dashboard for Admin with interactive charts and analytics
 * @author Sherif Talaat
 * @date 2026-02-06
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Calendar, Users, Briefcase } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import adminService from '../../../../../../services/adminService';
import styles from './StatisticsDashboard.module.css';

/**
 * Statistics Dashboard component for platform analytics and metrics visualization.
 * Follows analytical page pattern with charts and time range selector.
 * @returns {JSX.Element} The rendered statistics dashboard.
 */
const StatisticsDashboard = () => {
    const [timeRange, setTimeRange] = useState('6m');
    const [userGrowth, setUserGrowth] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [jobPostings, setJobPostings] = useState([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
        adminService.getMonthlyAnalytics(months).then((result) => {
            setUserGrowth(result.data?.userGrowth || []);
            setRevenue(result.data?.revenue || []);
            setJobPostings(result.data?.jobPostings || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [timeRange]);

    const filterDataByTimeRange = useCallback((data) => {
        switch (timeRange) {
            case '3m':
                return data.slice(-3);
            case '6m':
                return data.slice(-6);
            case '1y':
                return data;
            default:
                return data;
        }
    }, [timeRange]);

    const filteredUserData = useMemo(() => filterDataByTimeRange(userGrowth), [filterDataByTimeRange, userGrowth]);
    const filteredJobData = useMemo(() => filterDataByTimeRange(jobPostings), [filterDataByTimeRange, jobPostings]);
    const filteredRevenueData = useMemo(() => filterDataByTimeRange(revenue), [filterDataByTimeRange, revenue]);

    /**
     * Custom tooltip component for charts.
     */
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltip__label}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className={styles.tooltip__item}>
                            <span
                                className={styles.tooltip__dot}
                                style={{ backgroundColor: entry.color || entry.fill }}
                            />
                            {entry.dataKey}: <strong>{entry.value.toLocaleString()}</strong>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Analytics Dashboard"
                description="View comprehensive platform statistics, trends, and performance metrics."
            />

            <AdminToolbar
                showSearch={false}
                filters={
                    <div className={styles.timeRangeSelector}>
                        <Calendar size={18} className={styles.timeRangeSelector__icon} />
                        <GeneralSelect
                            value={timeRange}
                            onChange={setTimeRange}
                            options={[
                                { value: "3m", label: "Last 3 Months" },
                                { value: "6m", label: "Last 6 Months" },
                                { value: "1y", label: "Last Year" },
                            ]}
                        />
                    </div>
                }
            />

            <main className={styles.content}>
                {/* User Growth Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartCard__header}>
                        <div className={styles.chartCard__title}>
                            <Users size={20} className={styles.chartCard__icon} />
                            <h3>User Growth</h3>
                        </div>
                        <span className={styles.chartCard__subtitle}>
                            {filteredUserData[filteredUserData.length - 1]?.users.toLocaleString()} total users
                        </span>
                    </div>
                    <div className={styles.chartCard__body}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={filteredUserData}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                                <YAxis stroke="var(--color-muted-foreground)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="var(--color-chart-1)"
                                    fill="url(#userGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartCard__header}>
                        <div className={styles.chartCard__title}>
                            <Calendar size={20} className={styles.chartCard__icon} />
                            <h3>Monthly Revenue</h3>
                        </div>
                        <span className={styles.chartCard__subtitle}>
                            ${filteredRevenueData.reduce((sum, d) => sum + Number(d.netRevenue || 0), 0).toLocaleString()} net revenue
                        </span>
                    </div>
                    <div className={styles.chartCard__body}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={filteredRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                                <YAxis stroke="var(--color-muted-foreground)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="netRevenue" stroke="var(--color-chart-2)" fill="var(--color-radial-pink-2)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Job Postings Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartCard__header}>
                        <div className={styles.chartCard__title}>
                            <Briefcase size={20} className={styles.chartCard__icon} />
                            <h3>Job Postings</h3>
                        </div>
                        <span className={styles.chartCard__subtitle}>
                            {filteredJobData.reduce((sum, d) => sum + d.jobs, 0).toLocaleString()} total postings
                        </span>
                    </div>
                    <div className={styles.chartCard__body}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={filteredJobData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                                <YAxis stroke="var(--color-muted-foreground)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="jobs"
                                    stroke="var(--color-chart-3)"
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--color-chart-3)', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatisticsDashboard;
