/**
 * @file CompactJobCard.jsx
 * @description Shared compact job card for various dashboards
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */

import PropTypes from "prop-types";
import { Briefcase, MapPin, Users } from "lucide-react";
import Badge from "../ui/Badge";
import styles from "./CompactJobCard.module.css";

/**
 * Compact job card component for displaying job information in limited space
 * @param {Object} props - Component props
 * @param {Object} props.job - Job object containing job details
 * @param {Function} props.onClick - Callback function when card is clicked
 * @returns {JSX.Element} Rendered compact job card component
 */
const CompactJobCard = ({ job, onClick }) => {
    /**
     * Handles card click event
     */
    const handleClick = () => {
        if (onClick && job.id) {
            onClick(job.id);
        }
    };

    /**
     * Handles keyboard events for accessibility
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyPress = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            className={styles.card}
            onClick={handleClick}
            onKeyPress={handleKeyPress}
            role="button"
            tabIndex={0}
            aria-label={`${job.title} job in ${job.location} with ${job.applicants} applicants. Status: ${job.status}. Budget: ${job.budget}`}
            data-testid="compact-job-card"
        >
            <header className={styles.header}>
                <div className={styles.titleContainer}>
                    <Briefcase
                        size={16}
                        className={styles.icon}
                        aria-hidden="true"
                    />
                    <h4 className={styles.title}>{job.title}</h4>
                </div>
                <Badge
                    variant={job.status?.toLowerCase() === "active" ? "active" : "pending"}
                    aria-label={`Job status: ${job.status}`}
                >
                    {job.status}
                </Badge>
            </header>

            <div className={styles.meta}>
                <span className={styles.metaItem} aria-label={`Budget: ${job.budget}`}>
                    {job.budget}
                </span>
                <span className={styles.metaItem} aria-label={`Location: ${job.location}`}>
                    <MapPin
                        size={14}
                        className={styles.metaIcon}
                        aria-hidden="true"
                    />
                    {job.location}
                </span>
                <span className={styles.metaItem} aria-label={`${job.applicants} applicants`}>
                    <Users
                        size={14}
                        className={styles.metaIcon}
                        aria-hidden="true"
                    />
                    {job.applicants} applicants
                </span>
            </div>
        </div>
    );
};

CompactJobCard.propTypes = {
    job: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        budget: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        applicants: PropTypes.number.isRequired,
    }).isRequired,
    onClick: PropTypes.func,
};

CompactJobCard.defaultProps = {
    onClick: null,
};

export default CompactJobCard;