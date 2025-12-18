/**
 * @file FreelancerProfile.jsx
 * @description Freelancer profile component displaying skills, experience, and portfolio items.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.0.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-16
 */

import React from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import "../../styles/profile.css";

/**
 * FreelancerProfile Component
 * @description Main component for displaying freelancer profile information including:
 * personal details, skills, work experience, portfolio, and professional statistics.
 * Uses BEM CSS methodology and follows accessibility best practices.
 * @returns {JSX.Element} The rendered freelancer profile page with responsive layout.
 */
export default function FreelancerProfile() {
  // Custom hook to access freelancer profile data from context
  const { freelancerData } = useProfile();

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
   * Formats currency amount to display in thousands (K) format.
   * @param {number} amount - Amount to format.
   * @returns {string} Formatted currency string (e.g., "$125K").
   */
  const formatCurrency = (amount) => {
    return `$${(amount / 1000).toFixed(0)}K`;
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
   * Generates date range string for experience display.
   * @param {string} startDate - Start date string.
   * @param {string|null} endDate - End date string (null for current position).
   * @returns {string} Formatted date range string.
   */
  const getDateRange = (startDate, endDate) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = endDate ? formatDate(endDate) : "Present";

    return `${formattedStartDate} - ${formattedEndDate}`;
  };

  return (
    <div className="profile">
      {/* Navigation Section */}
      <nav className="profile__nav" aria-label="Profile navigation">
        <Link to="/" className="profile__logo" aria-label="MAESTA homepage">
          MAESTA
        </Link>

        <div className="profile__nav-links">
          <Link to="/profile/client" aria-label="Client profile">
            Client
          </Link>
          <Link
            to="/profile/freelancer"
            aria-label="Freelancer profile"
            aria-current="page">
            Freelancer
          </Link>
          <Link to="/profile/jobseeker" aria-label="Job seeker profile">
            Job Seeker
          </Link>
          <Link to="/profile/company" aria-label="Company profile">
            Company
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="profile__content">
        {/* Profile Header Section */}
        <header className="profile__header">
          <div className="profile__avatar">
            <img
              src={freelancerData.profilePictureUrl || "/placeholder.svg"}
              alt={`Profile picture of ${freelancerData.fullName}`}
              className="profile__avatar-image"
              width={120}
              height={120}
              loading="lazy"
            />
          </div>

          <div className="profile__info">
            <h1 className="profile__name" aria-label="Freelancer full name">
              {freelancerData.fullName}
            </h1>

            <p className="profile__headline" aria-label="Professional headline">
              {freelancerData.profile.headline}
            </p>

            {/* Professional Badges */}
            <div className="profile__badges" aria-label="Professional badges">
              {freelancerData.profile.identityVerificationStatus ===
                "Verified" && (
                <span
                  className="profile__badge profile__badge--verified"
                  aria-label="Identity verified">
                  Identity Verified
                </span>
              )}

              <span
                className="profile__badge profile__badge--rating"
                aria-label={`Average rating: ${freelancerData.profile.averageRating} stars`}>
                ⭐ {freelancerData.profile.averageRating}
              </span>

              <span
                className="profile__badge profile__badge--rate"
                aria-label={`Hourly rate: $${freelancerData.profile.hourlyRate} per hour`}>
                ${freelancerData.profile.hourlyRate}/hr
              </span>
            </div>

            <Link
              to="/edit/freelancer"
              className="profile__edit-btn"
              aria-label="Edit freelancer profile">
              Edit Profile
            </Link>
          </div>
        </header>

        {/* Detailed Information Cards */}
        <section className="profile__details" aria-label="Freelancer details">
          {/* About Card */}
          <article className="profile__card">
            <h2 className="profile__card-title">About</h2>
            <p className="profile__overview">
              {freelancerData.profile.overview}
            </p>
          </article>

          {/* Statistics Card */}
          <article className="profile__card profile__card--stats">
            <h2 className="profile__card-title">Professional Statistics</h2>

            <div className="profile__stats-grid">
              <div
                className="profile__stat"
                aria-label={`${freelancerData.stats.completedProjects} completed projects`}>
                <span className="profile__stat-number">
                  {freelancerData.stats.completedProjects}
                </span>
                <span className="profile__stat-label">Projects Done</span>
              </div>

              <div
                className="profile__stat"
                aria-label={`Total earnings: ${formatCurrency(
                  freelancerData.stats.totalEarnings
                )}`}>
                <span className="profile__stat-number">
                  {formatCurrency(freelancerData.stats.totalEarnings)}
                </span>
                <span className="profile__stat-label">Earned</span>
              </div>

              <div
                className="profile__stat"
                aria-label={`${freelancerData.stats.repeatClients} repeat clients`}>
                <span className="profile__stat-number">
                  {freelancerData.stats.repeatClients}
                </span>
                <span className="profile__stat-label">Repeat Clients</span>
              </div>
            </div>
          </article>
        </section>

        {/* Skills Section */}
        <section className="profile__section" aria-label="Professional skills">
          <h2 className="profile__section-title">Skills</h2>

          <div className="profile__skills-grid">
            {freelancerData.skills.map((skill) => (
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
            {freelancerData.experiences.map((experience) => (
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
                  aria-label={`Employment period: ${getDateRange(
                    experience.startDate,
                    experience.endDate
                  )}`}>
                  {getDateRange(experience.startDate, experience.endDate)}
                </p>

                <p className="profile__exp-desc">{experience.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Portfolio Section */}
        <section className="profile__section" aria-label="Portfolio">
          <h2 className="profile__section-title">Portfolio</h2>

          <div className="profile__portfolio-grid">
            {freelancerData.portfolio.map((item) => (
              <article
                key={item.id}
                className="profile__portfolio-card"
                aria-label={`Portfolio item: ${item.title}`}>
                <img
                  src={item.itemUrl || "/placeholder.svg"}
                  alt={`Screenshot of ${item.title}`}
                  className="profile__portfolio-img"
                  loading="lazy"
                  width={400}
                  height={300}
                />

                <div className="profile__portfolio-info">
                  <h3 className="profile__portfolio-title">{item.title}</h3>

                  <p className="profile__portfolio-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
