/**
 * @file ClientProfile.jsx
 * @description Client profile component displaying personal information, statistics, and projects.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.0.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-16
 */

import { Link } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import "../../styles/profile.css";

/**
 * ClientProfile Component
 * @description Main component for displaying client profile information including:
 * personal details, project statistics, and posted projects.
 * Uses BEM CSS methodology and follows accessibility best practices.
 * @returns {JSX.Element} The rendered client profile page with responsive layout.
 */
export default function ClientProfile() {
  // Custom hook to access client profile data from context
  const { clientData } = useProfile();

  /**
   * Formats a date string to localized date format.
   * @param {string} dateString - ISO date string to format.
   * @returns {string} Formatted date string.
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Formats currency amount to display in thousands (K) format.
   * @param {number} amount - Amount to format.
   * @returns {string} Formatted currency string (e.g., "$85K").
   */
  const formatCurrency = (amount) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  /**
   * Generates CSS class for project status badge based on status value.
   * @param {string} status - Project status (e.g., "Open", "In Progress", "Completed").
   * @returns {string} BEM modifier class for status styling.
   */
  const getStatusClass = (status) => {
    const normalizedStatus = status.toLowerCase().replace(" ", "-");
    return `profile__status profile__status--${normalizedStatus}`;
  };

  return (
    <div className="profile">
      {/* Navigation Section */}
      <nav className="profile__nav" aria-label="Profile navigation">
        <Link to="/" className="profile__logo" aria-label="MAESTA homepage">
          MAESTA
        </Link>
        
        <div className="profile__nav-links">
          <Link to="/profile/client" aria-current="page">
            Client
          </Link>
          <Link to="/profile/freelancer" aria-label="Freelancer profile">
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
              src={clientData.profilePictureUrl || "/placeholder.svg"}
              alt={`Profile picture of ${clientData.fullName}`}
              className="profile__avatar-image"
              width={120}
              height={120}
              loading="lazy"
            />
          </div>
          
          <div className="profile__info">
            <h1 className="profile__name" aria-label="Client full name">
              {clientData.fullName}
            </h1>
            
            <p className="profile__role" aria-label="User role">
              Client
            </p>
            
            {/* Verification Badges */}
            <div className="profile__badges" aria-label="Verification status">
              {clientData.isEmailVerified && (
                <span 
                  className="profile__badge profile__badge--verified"
                  aria-label="Email verified"
                >
                  Email Verified
                </span>
              )}
              
              {clientData.isPhoneVerified && (
                <span 
                  className="profile__badge profile__badge--verified"
                  aria-label="Phone verified"
                >
                  Phone Verified
                </span>
              )}
            </div>
            
            <Link 
              to="/edit/client" 
              className="profile__edit-btn"
              aria-label="Edit client profile"
            >
              Edit Profile
            </Link>
          </div>
        </header>

        {/* Detailed Information Cards */}
        <section className="profile__details" aria-label="Client details">
          {/* Contact Information Card */}
          <article className="profile__card">
            <h2 className="profile__card-title">Contact Information</h2>
            
            <div className="profile__detail-row">
              <span className="profile__label">Email</span>
              <span className="profile__value">
                <a 
                  href={`mailto:${clientData.email}`}
                  className="profile__email-link"
                >
                  {clientData.email}
                </a>
              </span>
            </div>
            
            <div className="profile__detail-row">
              <span className="profile__label">Phone</span>
              <span className="profile__value">
                <a 
                  href={`tel:${clientData.phoneNumber.replace(/\D/g, '')}`}
                  className="profile__phone-link"
                >
                  {clientData.phoneNumber}
                </a>
              </span>
            </div>
            
            <div className="profile__detail-row">
              <span className="profile__label">Member Since</span>
              <span className="profile__value">
                {formatDate(clientData.createdAt)}
              </span>
            </div>
          </article>

          {/* Statistics Card */}
          <article className="profile__card profile__card--stats">
            <h2 className="profile__card-title">Project Statistics</h2>
            
            <div className="profile__stats-grid">
              <div className="profile__stat" aria-label="Total projects count">
                <span className="profile__stat-number">
                  {clientData.stats.totalProjects}
                </span>
                <span className="profile__stat-label">Total Projects</span>
              </div>
              
              <div className="profile__stat" aria-label="Active projects count">
                <span className="profile__stat-number">
                  {clientData.stats.activeProjects}
                </span>
                <span className="profile__stat-label">Active</span>
              </div>
              
              <div className="profile__stat" aria-label="Completed projects count">
                <span className="profile__stat-number">
                  {clientData.stats.completedProjects}
                </span>
                <span className="profile__stat-label">Completed</span>
              </div>
              
              <div className="profile__stat" aria-label="Total spent amount">
                <span className="profile__stat-number">
                  {formatCurrency(clientData.stats.totalSpent)}
                </span>
                <span className="profile__stat-label">Total Spent</span>
              </div>
            </div>
          </article>
        </section>

        {/* Projects Section */}
        <section className="profile__section" aria-label="Posted projects">
          <h2 className="profile__section-title">Posted Projects</h2>
          
          <div className="profile__projects-list">
            {clientData.projects.map((project) => (
              <article 
                key={project.id} 
                className="profile__project-card"
                aria-label={`Project: ${project.title}`}
              >
                <div className="profile__project-header">
                  <h3 className="profile__project-title">{project.title}</h3>
                  
                  <span 
                    className={getStatusClass(project.status)}
                    aria-label={`Project status: ${project.status}`}
                  >
                    {project.status}
                  </span>
                </div>
                
                <p className="profile__project-desc">
                  {project.description}
                </p>
                
                <div className="profile__project-meta">
                  <span 
                    className="profile__budget"
                    aria-label={`Project budget: $${project.budget.toLocaleString()}`}
                  >
                    ${project.budget.toLocaleString()}
                  </span>
                  
                  <span 
                    className="profile__date"
                    aria-label={`Posted on: ${formatDate(project.postedAt)}`}
                  >
                    Posted: {formatDate(project.postedAt)}
                  </span>
                </div>
                
                {/* Skills Required */}
                <div 
                  className="profile__skills"
                  aria-label="Required skills for this project"
                >
                  {project.requiredSkills.map((skill) => (
                    <span 
                      key={skill} 
                      className="profile__skill-tag"
                      aria-label={`Required skill: ${skill}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}