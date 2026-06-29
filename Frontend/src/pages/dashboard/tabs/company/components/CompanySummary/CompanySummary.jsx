/**
 * @file CompanySummary.jsx
 * @description Displays comprehensive company profile summary with stats and hiring team
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2026-01-22
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-01-28
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Building,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  ExternalLink,
  Briefcase,
  Target,
  Clock,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import styles from "./CompanySummary.module.css";
import { useNavigate } from "react-router-dom";

/**
 * Company Summary Component
 * @param {Object} props - Component props
 * @param {Object} props.profile - Company profile data from dashboard.config.js
 * @param {Function} props.onEditProfile - Callback for editing profile
 * @param {Function} props.onViewAnalytics - Callback for viewing analytics
 * @returns {JSX.Element} The rendered company summary
 */
const CompanySummary = ({ profile, onEditProfile, onViewAnalytics }) => {
  const navigate = useNavigate();
  if (!profile) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading company profile...</p>
      </div>
    );
  }

  // Event handlers
  const handleEditProfile = () => {
    navigate("/dashboard/profile/edit");
  };

  const handleViewAnalytics = () => {
    navigate("/dashboard/performance-analytics");
  };

  const handleSocialClick = (platform, url) => {
    console.log(`Opening ${platform}: ${url}`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.companySummary}>
      {/* Company Header Section */}
      <div className={styles.companyHeader}>
        <div className={styles.logoContainer}>
          <img
            src={profile.logo}
            alt={`${profile.name} logo`}
            className={styles.companyLogo}
          />
          {profile.verification?.verified && (
            <div className={styles.verifiedBadge}>
              <CheckCircle size={16} />
              <span>
                {profile.verification.verificationBadge || "Verified"}
              </span>
            </div>
          )}
        </div>

        <div className={styles.companyInfo}>
          <h2 className={styles.companyName}>{profile.name}</h2>
          <p className={styles.companyTagline}>{profile.tagline}</p>
          <div className={styles.companyMeta}>
            <span className={styles.metaItem}>
              <Building size={16} />
              {profile.industry}
            </span>
            <span className={styles.metaItem}>
              <MapPin size={16} />
              {profile.location}
            </span>
            <span className={styles.metaItem}>
              <Users size={16} />
              {profile.size}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={16} />
              Founded {profile.founded}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" size="medium" onClick={handleEditProfile}>
            Edit Profile
          </Button>
          <Button variant="primary" size="medium" onClick={handleViewAnalytics}>
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};

CompanySummary.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    tagline: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    established: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    location: PropTypes.string,
    industry: PropTypes.string,
    employees: PropTypes.string,
    description: PropTypes.string,
    verification: PropTypes.shape({
      email: PropTypes.bool,
      company: PropTypes.bool
    }),
    team: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      role: PropTypes.string,
      email: PropTypes.string
    }))
  }).isRequired,
  onEditProfile: PropTypes.func.isRequired,
  onViewAnalytics: PropTypes.func.isRequired
};

export default CompanySummary;