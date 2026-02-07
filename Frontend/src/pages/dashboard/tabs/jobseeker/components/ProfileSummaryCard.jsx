/**
 * @file ProfileSummaryCard.jsx
 * @description Profile summary with completion progress
 * @author Sherif Talaat
 */
import React from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import styles from '../JobseekerDashboard.module.css';

const ProfileCompletion = ({ progress }) => (
    <div className={styles.profileCompletion}>
        <div className={styles.progressLabel}>
            <span>Profile Completion</span>
            <span className={styles.progressPercentage}>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
            <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

const ProfileSummaryCard = ({ profile, onEdit }) => {
    // Construct profile view data
    const profileView = {
        name: profile.name || "Sherif Talaat",
        email: profile.email || "sherif.talaat@example.com",
        title: profile.headline || "Senior Frontend Developer | React & TypeScript Expert",
        avatar: profile.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ST",
        completionPercentage: profile.completionPercentage || 85,
        verified: profile.verification?.email || false,
    };

    return (
        <Card
            title="Profile Summary"
            subtitle="Complete your profile to get better matches"
            className={styles.statusCard}
            variant="glass"
            action={
                <Button
                    variant="ghost"
                    size="small"
                    onClick={onEdit}
                    className={styles.viewAllBtn}
                >
                    Edit Profile <ArrowUpRight size={14} />
                </Button>
            }
        >
            <div className={styles.profileSummary}>
                <div className={styles.avatarSection}>
                    <img
                        src={profileView.avatar}
                        alt={profileView.name}
                        className={styles.avatar}
                    />
                    <div className={styles.profileInfo}>
                        <h4>{profileView.name}</h4>
                        <p>{profileView.email}</p>
                        <p className={styles.profileTitle}>{profileView.title}</p>
                        <div className={styles.verificationStatus}>
                            {profileView.verified && (
                                <Badge variant="success" size="sm">
                                    <Check size={12} /> Verified
                                </Badge>
                            )}
                            <Badge variant="outline" size="sm">
                                Member since 2024
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className={styles.completionSection}>
                    <ProfileCompletion progress={profileView.completionPercentage} />
                    <Button
                        variant="primary"
                        onClick={onEdit}
                        className={styles.editProfileBtn}
                        fullWidth
                    >
                        Complete Profile ({profileView.completionPercentage}%)
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ProfileSummaryCard;
