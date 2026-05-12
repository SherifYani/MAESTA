/**
 * @file JobSeekerProfile.jsx
 * @description Job seeker profile component displaying personal info, skills, experience, and job applications.
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
 * JobSeekerProfile Component
 * @description Main component for displaying job seeker profile information including:
 * personal details, skills, work experience, education, and job applications.
 * Uses BEM CSS methodology and follows accessibility best practices.
 * @returns {JSX.Element} The rendered job seeker profile page with responsive layout.
 */
export default function JobSeekerProfile() {
  // Custom hook to access job seeker profile data from context
  const { jobSeekerData } = useProfile();

  /**
   * Formats a date string to short month/year format.
   * @param {string} dateString - ISO date string to format.
   * @returns {string} Formatted date string (e.g., "Jan 2023").
   */
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Formats a date string to full localized date format.
   * @param {string} dateString - ISO date string to format.
   * @returns {string} Formatted date string.
   */
  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Generates CSS class for proficiency level badge.
   * @param {string} proficiencyLevel - Proficiency level (e.g., "Beginner", "Intermediate", "Expert").
   * @returns {string} BEM modifier class for proficiency styling.
   */
  const getProficiencyClass = (proficiencyLevel) => {
    const normalizedLevel = proficiencyLevel.toLowerCase();
    return `profile__proficiency profile__proficiency--${normalizedLevel}`;
  };

  /**
   * Generates CSS class for application status badge.
   * @param {string} status - Application status (e.g., "Applied", "Under Review", "Interviewing").
   * @returns {string} BEM modifier class for status styling.
   */
  const getStatusClass = (status) => {
    const normalizedStatus = status.toLowerCase().replace(" ", "-");
    return `profile__status profile__status--${normalizedStatus}`;
  };

  /**
   * Generates date range string for experience display.
   * @param {string} startDate - Start date string.
   * @param {string|null} endDate - End date string (null for current position).
   * @returns {string} Formatted date range string.
   */
  const getExperienceDateRange = (startDate, endDate) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = endDate ? formatDate(endDate) : "Present";

    return `${formattedStartDate} - ${formattedEndDate}`;
  };

  /**
   * Generates year range string for education display.
   * @param {number} startYear - Start year.
   * @param {number|null} endYear - End year (null for ongoing).
   * @returns {string} Formatted year range string.
   */
  const getEducationYearRange = (startYear, endYear) => {
    return `${startYear} - ${endYear || "Present"}`;
  };

  return (
    <div className="profile">

      {/* Main Content Area */}
      <main className="profile__content">
        {/* Profile Header Section */}
        <header className="profile__header">
          <div className="profile__avatar">
            <img
              src={jobSeekerData.profilePictureUrl || "/placeholder.svg"}
              alt={jobSeekerData.fullName}
              className="profile__avatar-image"
              width={120}
              height={120}
              loading="lazy"
            />
          </div>

          <div className="profile__info">
            <h1 className="profile__name" aria-label="Job seeker full name">
              {jobSeekerData.fullName}
            </h1>

            <p className="profile__headline" aria-label="Professional headline">
              {jobSeekerData.profile.headline}
            </p>

            <p className="profile__location" aria-label="Location">
              📍 {jobSeekerData.profile.location}
            </p>

            {/* Verification Badges */}
            <div
              className="profile__badges"
              aria-label="Verification and status badges">
              {jobSeekerData.profile.identityVerificationStatus ===
                "Verified" && (
                  <span
                    className="profile__badge profile__badge--verified"
                    aria-label="Identity verified">
                    Identity Verified
                  </span>
                )}

              {jobSeekerData.isEmailVerified && (
                <span
                  className="profile__badge profile__badge--verified"
                  aria-label="Email verified">
                  Email Verified
                </span>
              )}

              {jobSeekerData.profile.resumeUrl && (
                <span
                  className="profile__badge profile__badge--resume"
                  aria-label="Resume available">
                  📄 Resume Available
                </span>
              )}
            </div>

            <Link
              to="edit"
              className="profile__edit-btn"
              aria-label="Edit job seeker profile">
              Edit Profile
            </Link>
          </div>
        </header>

        {/* Detailed Information Cards */}
        <section className="profile__details" aria-label="Job seeker details">
          {/* Summary Card */}
          <article className="profile__card">
            <h2 className="profile__card-title">Professional Summary</h2>
            <p className="profile__overview">{jobSeekerData.profile.summary}</p>
          </article>

          {/* Contact Information Card */}
          <article className="profile__card">
            <h2 className="profile__card-title">Contact Information</h2>

            <div className="profile__detail-row">
              <span className="profile__label">Email</span>
              <span className="profile__value">
                <a
                  href={`mailto:${jobSeekerData.email}`}
                  className="profile__email-link">
                  {jobSeekerData.email}
                </a>
              </span>
            </div>

            <div className="profile__detail-row">
              <span className="profile__label">Phone</span>
              <span className="profile__value">
                <a
                  href={`tel:${jobSeekerData.phoneNumber.replace(/\D/g, "")}`}
                  className="profile__phone-link">
                  {jobSeekerData.phoneNumber}
                </a>
              </span>
            </div>
          </article>
        </section>

        {/* Skills Section */}
        <section className="profile__section" aria-label="Professional skills">
          <h2 className="profile__section-title">Skills</h2>

          <div className="profile__skills-grid">
            {jobSeekerData.skills.map((skill) => (
              <article
                key={skill.name}
                className="profile__skill-card"
                aria-label={`Skill: ${skill.name}, Proficiency: ${skill.proficiencyLevel}`}>
                <span className="profile__skill-name">{skill.name}</span>

                <span
                  className={getProficiencyClass(skill.proficiencyLevel)}
                  aria-label={`Proficiency level: ${skill.proficiencyLevel}`}>
                  {skill.proficiencyLevel}
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="profile__section" aria-label="Work experience">
          <h2 className="profile__section-title">Professional Experience</h2>

          <div className="profile__experience-list">
            {jobSeekerData.experiences.map((experience) => (
              <article
                key={experience.id}
                className="profile__experience-card"
                aria-label={`Experience at ${experience.companyName} as ${experience.jobTitle}`}>
                <div className="profile__exp-header">
                  <h3 className="profile__exp-title">{experience.jobTitle}</h3>

                  <span
                    className="profile__exp-company"
                    aria-label={`Company: ${experience.companyName}`}>
                    {experience.companyName}
                  </span>
                </div>

                <p
                  className="profile__exp-dates"
                  aria-label={`Employment period: ${getExperienceDateRange(
                    experience.startDate,
                    experience.endDate
                  )}`}>
                  {getExperienceDateRange(
                    experience.startDate,
                    experience.endDate
                  )}
                </p>

                <p className="profile__exp-desc">{experience.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="profile__section" aria-label="Education background">
          <h2 className="profile__section-title">Education</h2>

          <div className="profile__education-list">
            {jobSeekerData.education.map((edu) => (
              <article
                key={edu.id}
                className="profile__education-card"
                aria-label={`Education at ${edu.institutionName}`}>
                <h3 className="profile__edu-institution">
                  {edu.institutionName}
                </h3>

                <p
                  className="profile__edu-degree"
                  aria-label={`Degree: ${edu.degree} in ${edu.fieldOfStudy}`}>
                  {edu.degree} in {edu.fieldOfStudy}
                </p>

                <p
                  className="profile__edu-years"
                  aria-label={`Study period: ${getEducationYearRange(
                    edu.startYear,
                    edu.endYear
                  )}`}>
                  {getEducationYearRange(edu.startYear, edu.endYear)}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Job Applications Section */}
        <section className="profile__section" aria-label="Job applications">
          <h2 className="profile__section-title">Job Applications</h2>

          {jobSeekerData.applications.length === 0 ? (
            <div className="profile__empty-state">
              <p>No job applications submitted yet.</p>
            </div>
          ) : (
            <div className="profile__applications-list">
              {jobSeekerData.applications.map((application) => (
                <article
                  key={application.id}
                  className="profile__application-card"
                  aria-label={`Application for ${application.jobTitle} at ${application.company}`}>
                  <div className="profile__app-header">
                    <h3 className="profile__app-title">
                      {application.jobTitle}
                    </h3>

                    <span
                      className={getStatusClass(application.status)}
                      aria-label={`Application status: ${application.status}`}>
                      {application.status}
                    </span>
                  </div>

                  <p
                    className="profile__app-company"
                    aria-label={`Company: ${application.company}`}>
                    {application.company}
                  </p>

                  <div className="profile__app-meta">
                    <span
                      className="profile__app-date"
                      aria-label={`Applied on: ${formatFullDate(
                        application.appliedAt
                      )}`}>
                      Applied: {formatFullDate(application.appliedAt)}
                    </span>

                    <span
                      className="profile__match-score"
                      aria-label={`Match score: ${application.matchScore}%`}>
                      Match: {application.matchScore}%
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
