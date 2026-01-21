/**
 * @file ProfileSummary.jsx
 * @description Profile summary component for job seekers showing user profile with completion percentage
 * @version 1.0.0
 * @date 2025-12-23
 *
 * @requirements FR-701.2: ملخص الملف الشخصي
 */

import React from "react";
import PropTypes from "prop-types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  CheckCircle,
  Award,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import styles from "./ProfileSummary.module.css";

/**
 * ProfileSummary component for displaying user profile information
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @returns {JSX.Element} Rendered profile summary component
 */
const ProfileSummary = ({ user }) => {
  // Fallback data if user is not provided
  const userData = user || {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    avatar: null,
    completionPercentage: 78,
    title: "Senior Frontend Developer",
    status: "active",
    skills: ["React", "TypeScript", "Next.js", "UI/UX"],
    verified: true,
  };

  return (
    <Card className={styles.profileSummary} padding={true}>
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className={styles.avatarImage}
              />
            ) : (
              <User size={48} className={styles.avatarPlaceholder} />
            )}
            {userData.verified && (
              <div className={styles.verifiedBadge}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>

          <div className={styles.userInfo}>
            <h3 className={styles.userName}>{userData.name}</h3>
            <p className={styles.userTitle}>{userData.title}</p>
            <div className={styles.statusContainer}>
              <Badge
                variant={userData.status === "active" ? "success" : "warning"}
                rounded={true}>
                {userData.status === "active" ? "Active" : "Pending"}
              </Badge>
              <span className={styles.memberSince}>Member since 2024</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="small"
          icon={Edit2}
          className={styles.editButton}>
          Edit Profile
        </Button>
      </div>

      {/* Profile Completion Progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Profile Completion</span>
          <span className={styles.progressPercentage}>
            {userData.completionPercentage}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${userData.completionPercentage}%` }}
          />
        </div>
        <p className={styles.progressHint}>
          Complete your profile to increase job match rate
        </p>
      </div>

      {/* Contact Information */}
      <div className={styles.contactSection}>
        <div className={styles.contactItem}>
          <Mail size={16} className={styles.contactIcon} />
          <span className={styles.contactText}>{userData.email}</span>
        </div>
        <div className={styles.contactItem}>
          <Phone size={16} className={styles.contactIcon} />
          <span className={styles.contactText}>{userData.phone}</span>
        </div>
        <div className={styles.contactItem}>
          <MapPin size={16} className={styles.contactIcon} />
          <span className={styles.contactText}>{userData.location}</span>
        </div>
      </div>

      {/* Skills Summary */}
      {userData.skills && userData.skills.length > 0 && (
        <div className={styles.skillsSection}>
          <div className={styles.skillsHeader}>
            <Award size={18} />
            <h4 className={styles.skillsTitle}>Top Skills</h4>
          </div>
          <div className={styles.skillsList}>
            {userData.skills.slice(0, 4).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={styles.skillBadge}>
                {skill}
              </Badge>
            ))}
            {userData.skills.length > 4 && (
              <Badge variant="outline" className={styles.moreSkills}>
                +{userData.skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

ProfileSummary.propTypes = {
  /** User data object */
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    location: PropTypes.string,
    avatar: PropTypes.string,
    completionPercentage: PropTypes.number,
    title: PropTypes.string,
    status: PropTypes.oneOf(["active", "pending", "inactive"]),
    skills: PropTypes.arrayOf(PropTypes.string),
    verified: PropTypes.bool,
  }),
};

export default ProfileSummary;
