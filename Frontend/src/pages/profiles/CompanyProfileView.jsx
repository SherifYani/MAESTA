/**
 * @file CompanyProfileView.jsx
 * @description Read-only company profile component for viewing a specific company's details.
 * @author Sherif Talaat
 * @date 2026-06-22
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-22
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import profileService from "../../services/profileService";
import "../../styles/profile.css";
import styles from "./CompanyProfileView.module.css";
import { MainLayout } from "../../components/layout";

/**
 * CompanyProfileView Component
 * @description Main component for displaying a specific company's profile information in read-only mode.
 * Includes: company details, team members, job listings, and hiring statistics.
 * Does not include any edit button.
 * @returns {JSX.Element} The rendered read-only company profile page.
 */
export default function CompanyProfileView() {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [error, setError] = useState(null);

    const [profileUnavailable, setProfileUnavailable] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchCompanyProfile = async () => {
            if (!companyId) { setLoading(false); return; }
            setLoading(true);
            setError(null);
            setProfileUnavailable(false);
            try {
                const data = await profileService.getCompanyProfile(companyId);
                if (!cancelled) {
                    const normalizedData = {
                        ...data,
                        name: data.companyName || data.name,
                        websiteUrl: data.website || data.websiteUrl || "",
                        location:
                            data.location ||
                            (data.city
                                ? [data.city, data.country].filter(Boolean).join(", ")
                                : data.address || ""),
                        verificationStatus:
                            data.isVerified != null
                                ? data.isVerified ? "Verified" : "Unverified"
                                : data.verificationStatus || "Unverified",
                        members: (data.members || []).map((m) => ({ id: m.id, name: m.name, role: m.role, avatar: m.avatar })),
                        jobs: (data.jobs || []).map((j) => ({ id: j.id, title: j.title, location: j.location, jobType: j.jobType, status: j.status, postedAt: j.postedAt, applicationsCount: j.applicationsCount })),
                        stats: { totalJobs: data.stats?.totalJobs || 0, activeJobs: data.stats?.activeJobs || 0, totalHires: data.stats?.totalHires || 0, avgTimeToHire: data.stats?.avgTimeToHire || 0 },
                    };
                    setCompanyData(normalizedData);
                }
            } catch (err) {
                if (cancelled) return;
                // 404 = company profile not set up yet — show friendly state, not an error
                const status = err?.response?.status;
                if (status === 404 || status === 400) {
                    setProfileUnavailable(true);
                } else {
                    setError(err.message || "Failed to load company profile");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchCompanyProfile();
        return () => { cancelled = true; };
    }, [companyId]);

    /**
     * Formats a date string to localized date format.
     * @param {string} dateString - ISO date string to format.
     * @returns {string} Formatted date string.
     */
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString();
        } catch (e) {
            return "N/A";
        }
    };

    /**
     * Generates CSS class for status badge based on status value.
     * @param {string} status - Job status (e.g., "Open", "Closed").
     * @returns {string} BEM modifier class for status styling.
     */
    const getStatusClass = (status) => {
        if (!status) return 'profile__status';
        return `profile__status profile__status--${typeof status === 'string' ? status.toLowerCase() : 'unknown'}`;
    };

    /**
     * Generates CSS class for member role badge based on role value.
     * @param {string} role - Team member role (e.g., "Admin", "HR_Manager").
     * @returns {string} BEM modifier class for role styling.
     */
    const getRoleClass = (role) => {
        const normalizedRole = role ? role.toLowerCase().replace(/_/g, "-") : "unknown";
        return `profile__member-role profile__member-role--${normalizedRole}`;
    };

    /**
     * Formats role display text by replacing underscores with spaces.
     * @param {string} role - Role string with underscores.
     * @returns {string} Formatted role string.
     */
    const formatRoleDisplay = (role) => {
        return role.replace("_", " ");
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Loading company profile...</p>
            </div>
        );
    }

    // Company exists on the platform but hasn't set up a public profile yet
    if (profileUnavailable) {
        return (
            <MainLayout>
                <div className={styles.errorContainer}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
                    <h2>{companyData?.name || "Company"}</h2>
                    <p style={{ color: "var(--color-muted-foreground)", margin: "0.5rem 0 1.5rem" }}>
                        This company hasn't set up a public profile yet.
                    </p>
                    <button onClick={() => navigate(-1)} className={styles.backBtn}>
                        ← Go Back
                    </button>
                </div>
            </MainLayout>
        );
    }

    if (error || !companyData) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error Loading Profile</h2>
                <p>{error || "Company profile not found."}</p>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className={`profile ${styles.viewContainer}`}>
                {/* Main Content Area */}
                <main className="profile__content">
                    {/* Back Button */}
                    <button onClick={() => navigate(-1)} className={styles.backTextLink}>
                        ← Back
                    </button>

                    {/* Company Header Section */}
                    <header className="profile__header profile__header--company">
                        <div className="profile__avatar profile__avatar--company">
                            <img
                                src={companyData.logoUrl || "/placeholder.svg"}
                                alt={companyData.name}
                                className="profile__avatar-image"
                                width={120}
                                height={120}
                                loading="lazy"
                            />
                        </div>

                        <div className="profile__info">
                            <h1 className="profile__name" aria-label="Company name">
                                {companyData.name}
                            </h1>

                            <p className="profile__industry" aria-label="Company industry">
                                {companyData.industry}
                            </p>

                            <p className="profile__location" aria-label="Company location">
                                📍 {companyData.location}
                            </p>

                            {/* Company Verification Badges */}
                            <div
                                className="profile__badges"
                                aria-label="Company status badges">
                                {companyData.verificationStatus === "Verified" && (
                                    <span
                                        className="profile__badge profile__badge--verified"
                                        aria-label="Verified company">
                                        Verified Company
                                    </span>
                                )}

                                {companyData.companySize && (
                                    <span
                                        className="profile__badge profile__badge--size"
                                        aria-label={`Company size: ${companyData.companySize}`}>
                                        {companyData.companySize}
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Detailed Information Cards */}
                    <section className="profile__details" aria-label="Company details">
                        {/* About Company Card */}
                        <article className="profile__card">
                            <h2 className="profile__card-title">About</h2>

                            <p className="profile__overview">
                                {companyData.description || "No description provided."}
                            </p>

                            {companyData.websiteUrl && (
                                <div className="profile__detail-row profile__detail-row--website">
                                    <span className="profile__label">Website</span>
                                    <span className="profile__value">
                                        <a
                                            href={companyData.websiteUrl}
                                            className="profile__value--link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Visit ${companyData.name} website (opens in new tab)`}>
                                            {companyData.websiteUrl.replace(/^https?:\/\//, "")}
                                        </a>
                                    </span>
                                </div>
                            )}

                            {companyData.foundedYear && (
                                <div className="profile__detail-row">
                                    <span className="profile__label">Founded</span>
                                    <span className="profile__value">
                                        {companyData.foundedYear}
                                    </span>
                                </div>
                            )}
                        </article>

                        {/* Hiring Statistics Card */}
                        <article className="profile__card profile__card--stats">
                            <h2 className="profile__card-title">Hiring Statistics</h2>

                            <div className="profile__stats-grid">
                                <div
                                    className="profile__stat"
                                    aria-label={`Total jobs posted: ${companyData.stats.totalJobs}`}>
                                    <span className="profile__stat-number">
                                        {companyData.stats.totalJobs}
                                    </span>
                                    <span className="profile__stat-label">Total Jobs</span>
                                </div>

                                <div
                                    className="profile__stat"
                                    aria-label={`Active jobs: ${companyData.stats.activeJobs}`}>
                                    <span className="profile__stat-number">
                                        {companyData.stats.activeJobs}
                                    </span>
                                    <span className="profile__stat-label">Active Jobs</span>
                                </div>

                                <div
                                    className="profile__stat"
                                    aria-label={`Total hires: ${companyData.stats.totalHires}`}>
                                    <span className="profile__stat-number">
                                        {companyData.stats.totalHires}
                                    </span>
                                    <span className="profile__stat-label">Total Hires</span>
                                </div>

                                <div
                                    className="profile__stat"
                                    aria-label={`Average time to hire: ${companyData.stats.avgTimeToHire} days`}>
                                    <span className="profile__stat-number">
                                        {companyData.stats.avgTimeToHire}d
                                    </span>
                                    <span className="profile__stat-label">Avg. Time to Hire</span>
                                </div>
                            </div>
                        </article>
                    </section>

                    {/* Team Members Section */}
                    {companyData.members && companyData.members.length > 0 && (
                        <section
                            className="profile__section"
                            aria-label="Company team members">
                            <h2 className="profile__section-title">Team Members</h2>

                            <div className="profile__members-grid">
                                {companyData.members.map((member) => (
                                    <article
                                        key={member.id}
                                        className="profile__member-card"
                                        aria-label={`Team member: ${member.name}, ${formatRoleDisplay(
                                            member.role,
                                        )}`}>
                                        <img
                                            src={member.avatar || "/placeholder.svg"}
                                            alt={member.name}
                                            className="profile__member-avatar"
                                            width={64}
                                            height={64}
                                            loading="lazy"
                                        />

                                        <div className="profile__member-info">
                                            <h3 className="profile__member-name">{member.name}</h3>

                                            <span
                                                className={getRoleClass(member.role)}
                                                aria-label={`Role: ${formatRoleDisplay(member.role)}`}>
                                                {formatRoleDisplay(member.role)}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Job Listings Section */}
                    {companyData.jobs && companyData.jobs.length > 0 && (
                        <section
                            className="profile__section"
                            aria-label="Company job listings">
                            <h2 className="profile__section-title">Job Listings</h2>

                            <div className="profile__jobs-list">
                                {companyData.jobs.map((job) => (
                                    <article
                                        key={job.id}
                                        className="profile__job-card"
                                        aria-label={`Job listing: ${job.title || 'Untitled Job'}`}>
                                        <div className="profile__job-header">
                                            <h3 className="profile__job-title">{job.title || 'Untitled Job'}</h3>

                                            <span
                                                className={getStatusClass(job.status)}
                                                aria-label={`Job status: ${job.status || 'Unknown'}`}>
                                                {job.status || 'Unknown'}
                                            </span>
                                        </div>

                                        <div className="profile__job-meta">
                                            <span aria-label={`Location: ${job.location || 'Not specified'}`}>
                                                📍 {job.location || 'Not specified'}
                                            </span>

                                            <span aria-label={`Job type: ${job.jobType || 'Not specified'}`}>
                                                💼 {job.jobType || 'Not specified'}
                                            </span>

                                            <span
                                                aria-label={`Posted date: ${formatDate(job.postedAt)}`}>
                                                📅 {formatDate(job.postedAt)}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </MainLayout>
    );
}








