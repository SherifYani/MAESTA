/**
 * @file MyInterviewsPage.jsx
 * @description Job Seeker: view all scheduled, upcoming, and past interviews.
 *              Fetches from GET /api/Interviews (role-aware on the backend).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, User, RefreshCw, ExternalLink } from 'lucide-react';
import { getMyInterviews } from '../../../../services/interviewService';
import styles from './MyInterviewsPage.module.css';

/* ─── helpers ──────────────────────────────────────────────────────────── */

const STATUS_LABELS = {
    scheduled:   'Scheduled',
    rescheduled: 'Rescheduled',
    completed:   'Completed',
    cancelled:   'Cancelled',
    rejected:    'Rejected',
};

const formatDate = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (raw) => {
    if (!raw) return '';
    const d = new Date(raw);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const normalizeInterview = (i) => ({
    id:            i.interviewId ?? i.id,
    title:         i.title || 'Interview',
    employerName:  i.employerName || 'Employer',
    jobTitle:      i.jobTitle || i.title || '',
    scheduledAt:   i.scheduledAt ?? i.ScheduledAt,
    duration:      i.durationMinutes || 30,
    meetingLink:   i.meetingLink || i.MeetingLink || null,
    location:      i.location || i.Location || null,
    status:        (i.status || i.Status || 'scheduled').toLowerCase(),
    notes:         i.description || i.notes || '',
});

/* ─── component ────────────────────────────────────────────────────────── */

const FILTERS = ['all', 'scheduled', 'rescheduled', 'completed', 'cancelled'];

const MyInterviewsPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [filter, setFilter]         = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyInterviews(1, 50);
            const raw = Array.isArray(data) ? data : data?.items || data?.interviews || [];
            setInterviews(raw.map(normalizeInterview));
        } catch (err) {
            console.error('Failed to load interviews:', err);
            setError('Failed to load your interviews. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* filter */
    const visible = filter === 'all'
        ? interviews
        : interviews.filter(i => i.status === filter);

    /* stats */
    const stats = {
        total:      interviews.length,
        upcoming:   interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length,
        completed:  interviews.filter(i => i.status === 'completed').length,
        cancelled:  interviews.filter(i => i.status === 'cancelled' || i.status === 'rejected').length,
    };

    /* ── render states ── */
    if (loading) return (
        <div className={styles.container}>
            <div className={styles.loadingWrapper}>
                {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <div className={styles.error}>
                <p>{error}</p>
                <button className={styles.retryBtn} onClick={load}>
                    <RefreshCw size={14} style={{ marginRight: 6 }} />
                    Retry
                </button>
            </div>
        </div>
    );

    /* ── main render ── */
    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>My Interviews</h1>
                <p className={styles.subtitle}>Track all your scheduled and past interviews</p>
            </header>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.total}</span>
                    <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.upcoming}</span>
                    <span className={styles.statLabel}>Upcoming</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.completed}</span>
                    <span className={styles.statLabel}>Completed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.cancelled}</span>
                    <span className={styles.statLabel}>Cancelled</span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* List */}
            {visible.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📅</div>
                    <h2 className={styles.emptyTitle}>No interviews found</h2>
                    <p className={styles.emptyText}>
                        {filter === 'all'
                            ? "You don't have any interviews yet. Apply to jobs and get noticed!"
                            : `No ${filter} interviews to show.`}
                    </p>
                    {filter === 'all' && (
                        <Link to="/jobs" className={styles.browsBtn}>Browse Jobs</Link>
                    )}
                </div>
            ) : (
                <div className={styles.list}>
                    {visible.map(interview => (
                        <InterviewCard key={interview.id} interview={interview} />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── interview card ────────────────────────────────────────────────────── */

const InterviewCard = ({ interview }) => {
    const statusClass = styles[`status_${interview.status}`] || styles.status_scheduled;

    return (
        <div className={styles.card}>
            {/* Icon */}
            <div className={styles.cardIcon}>
                <Calendar size={22} />
            </div>

            {/* Body */}
            <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{interview.title}</h3>
                    <span className={`${styles.statusBadge} ${statusClass}`}>
                        {STATUS_LABELS[interview.status] || interview.status}
                    </span>
                </div>

                <div className={styles.cardMeta}>
                    {interview.employerName && (
                        <span className={styles.metaItem}>
                            <User size={14} />
                            {interview.employerName}
                        </span>
                    )}
                    {interview.scheduledAt && (
                        <span className={styles.metaItem}>
                            <Calendar size={14} />
                            {formatDate(interview.scheduledAt)}
                        </span>
                    )}
                    {interview.scheduledAt && (
                        <span className={styles.metaItem}>
                            <Clock size={14} />
                            {formatTime(interview.scheduledAt)} · {interview.duration} min
                        </span>
                    )}
                    {interview.location && !interview.meetingLink && (
                        <span className={styles.metaItem}>
                            <MapPin size={14} />
                            {interview.location}
                        </span>
                    )}
                    {interview.meetingLink && (
                        <span className={styles.metaItem}>
                            <Video size={14} />
                            Video Call
                        </span>
                    )}
                </div>

                {interview.notes && (
                    <p className={styles.cardNotes}>{interview.notes}</p>
                )}

                {/* Join button for upcoming video interviews */}
                {interview.meetingLink &&
                    (interview.status === 'scheduled' || interview.status === 'rescheduled') && (
                    <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.joinLink}
                    >
                        <ExternalLink size={14} />
                        Join Meeting
                    </a>
                )}
            </div>
        </div>
    );
};

export default MyInterviewsPage;
