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

      {/* Main Content - Single Column Layout */}
      <div className={styles.contentGrid}>
        {/* Description & Contact Info */}
        <div className={styles.leftColumn}>
          <div className={styles.descriptionCard}>
            <h3 className={styles.sectionTitle}>About Company</h3>
            <p className={styles.companyDescription}>{profile.description}</p>

            <div className={styles.contactInfo}>
              <h4 className={styles.contactTitle}>Contact Information</h4>
              <div className={styles.contactDetails}>
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className={styles.contactItem}>
                  <Mail size={16} />
                  {profile.contactEmail}
                </a>
                <a
                  href={`tel:${profile.contactPhone}`}
                  className={styles.contactItem}>
                  <Phone size={16} />
                  {profile.contactPhone}
                </a>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactItem}>
                  <Globe size={16} />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
                <span className={styles.contactItem}>
                  <MapPin size={16} />
                  {profile.headquarters}
                </span>
              </div>
            </div>
          </div>

          {/* Hiring Team */}
          <div className={styles.hiringTeamCard}>
            <h3 className={styles.sectionTitle}>Hiring Team</h3>
            <p className={styles.sectionSubtitle}>
              Primary contacts for recruitment
            </p>

            <div className={styles.teamList}>
              {profile.hiringTeam?.map((member) => (
                <div key={member.id} className={styles.teamMember}>
                  <div className={styles.memberAvatar}>
                    {member.name.charAt(0)}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberRole}>{member.role}</span>
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className={styles.memberEmail}>
                    <Mail size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Social Media + Quick Stats (2 columns) */}
        <div className={styles.rightColumn}>

          {/* Quick Stats */}
          <div className={styles.quickStatsCard}>
            <h3 className={styles.sectionTitle}>Quick Stats</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statKey}>Total Jobs Posted</span>
                <span className={styles.statValue}>
                  {profile.stats?.totalJobsPosted || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statKey}>Open Positions</span>
                <span className={styles.statValue}>
                  {profile.stats?.openPositions || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statKey}>Interview Rate</span>
                <span className={styles.statValue}>
                  {profile.stats?.interviewRate || 0}%
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statKey}>Total Hires</span>
                <Badge variant="success">
                  {profile.stats?.hireRate || 0}% success
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySummary;