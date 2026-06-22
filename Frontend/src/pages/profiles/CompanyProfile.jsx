/**
 * @file CompanyProfile.jsx
 * @description Company profile component displaying company information, team, and job listings.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.1.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 * 
 * @update :-
 * - removed navigation section 
 * - edit the link to the edit profile page (because include {profile} and {edit profile} to dashboard)
 */

import React from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import "../../styles/profile.css";

/**
 * CompanyProfile Component
 * @description Main component for displaying company profile information including:
 * company details, team members, job listings, and hiring statistics.
 * Uses BEM CSS methodology and follows accessibility best practices.
 * @returns {JSX.Element} The rendered company profile page with responsive layout.
 */
export default function CompanyProfile() {
  // Custom hook to access company profile data from context
  const { companyData } = useProfile();

  /**
   * Formats a date string to localized date format.
   * @param {string} dateString - ISO date string to format.
   * @returns {string} Formatted date string.
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Generates CSS class for status badge based on status value.
   * @param {string} status - Job status (e.g., "Open", "Closed").
   * @returns {string} BEM modifier class for status styling.
   */
  const getStatusClass = (status) => {
    return `profile__status profile__status--${status.toLowerCase()}`;
  };

  /**
   * Generates CSS class for member role badge based on role value.
   * @param {string} role - Team member role (e.g., "Admin", "HR_Manager").
   * @returns {string} BEM modifier class for role styling.
   */
  const getRoleClass = (role) => {
    const normalizedRole = role.toLowerCase().replace("_", "-");
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

  return (
    <div className="profile">

      {/* Main Content Area */}
      <main className="profile__content">
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
            <div className="profile__badges" aria-label="Company status badges">
              {companyData.verificationStatus === "Verified" && (
                <span
                  className="profile__badge profile__badge--verified"
                  aria-label="Verified company">
                  Verified Company
                </span>
              )}

              <span
                className="profile__badge profile__badge--size"
                aria-label={`Company size: ${companyData.companySize}`}>
                {companyData.companySize}
              </span>
            </div>

            <Link
              to="edit"
              className="profile__edit-btn"
              aria-label="Edit company profile">
              Edit Profile
            </Link>
          </div>
        </header>

        {/* Detailed Information Cards */}
        <section className="profile__details" aria-label="Company details">
          {/* About Company Card */}
          <article className="profile__card">
            <h2 className="profile__card-title">About</h2>

            <p className="profile__overview">{companyData.description}</p>

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

            <div className="profile__detail-row">
              <span className="profile__label">Registration ID</span>
              <span className="profile__value">
                {companyData.commercialRegistrationID}
              </span>
            </div>
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
        <section className="profile__section" aria-label="Company team members">
          <h2 className="profile__section-title">Team Members</h2>

          <div className="profile__members-grid">
            {companyData.members.map((member) => (
              <article
                key={member.id}
                className="profile__member-card"
                aria-label={`Team member: ${member.name}, ${formatRoleDisplay(
                  member.role
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

        {/* Job Listings Section */}
        <section className="profile__section" aria-label="Company job listings">
          <h2 className="profile__section-title">Job Listings</h2>

          <div className="profile__jobs-list">
            {companyData.jobs.map((job) => (
              <article
                key={job.id}
                className="profile__job-card"
                aria-label={`Job listing: ${job.title}`}>
                <div className="profile__job-header">
                  <h3 className="profile__job-title">{job.title}</h3>

                  <span
                    className={getStatusClass(job.status)}
                    aria-label={`Job status: ${job.status}`}>
                    {job.status}
                  </span>
                </div>

                <div className="profile__job-meta">
                  <span aria-label={`Location: ${job.location}`}>
                    📍 {job.location}
                  </span>

                  <span aria-label={`Job type: ${job.jobType}`}>
                    💼 {job.jobType}
                  </span>

                  <span aria-label={`Posted date: ${formatDate(job.postedAt)}`}>
                    📅 {formatDate(job.postedAt)}
                  </span>
                </div>

                <div className="profile__job-stats">
                  <span
                    className="profile__applications-count"
                    aria-label={`${job.applicationsCount} applications received`}>
                    {job.applicationsCount} applications
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
