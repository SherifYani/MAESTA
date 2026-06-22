/**
 * @file ReadReceipt.jsx
 * @description Message read status indicator (sent, delivered, read) (FR-601.6)
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React from "react";
import PropTypes from "prop-types";
import { Check, CheckCheck } from "lucide-react";
import styles from "./ReadReceipt.module.css";

/**
 * Read receipt component for displaying message status
 * @param {Object} props - Component props
 * @param {string} props.status - Message status: 'sent', 'delivered', or 'read'
 * @returns {JSX.Element} Rendered read receipt component
 */
const ReadReceipt = ({ status = "sent" }) => {
    /**
     * Gets the appropriate icon based on status
     * @returns {JSX.Element} Icon element for the current status
     */
    const getIcon = () => {
        switch (status) {
            case "read":
                return <CheckCheck className={`${styles.icon} ${styles.read}`} aria-hidden="true" />;
            case "delivered":
                return <CheckCheck className={`${styles.icon} ${styles.delivered}`} aria-hidden="true" />;
            case "sent":
            default:
                return <Check className={`${styles.icon} ${styles.sent}`} aria-hidden="true" />;
        }
    };

    /**
     * Gets status description for screen readers
     * @returns {string} Accessible status description
     */
    const getStatusDescription = () => {
        switch (status) {
            case "read":
                return "Message read";
            case "delivered":
                return "Message delivered";
            case "sent":
            default:
                return "Message sent";
        }
    };

    return (
        <span
            className={styles.container}
            title={getStatusDescription()}
            role="status"
            aria-label={getStatusDescription()}
        >
            {getIcon()}
            <span className="visually-hidden">{getStatusDescription()}</span>
        </span>
    );
};

ReadReceipt.propTypes = {
    status: PropTypes.oneOf(["sent", "delivered", "read"]),
};

ReadReceipt.defaultProps = {
    status: "sent",
};

export default ReadReceipt;