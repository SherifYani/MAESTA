/**
 * @file TypingIndicator.jsx
 * @description Animated typing indicator for chat (FR-601.5)
 * @author Sherif Talaat
 * @date 2026-02-06
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React from "react";
import PropTypes from "prop-types";
import styles from "./TypingIndicator.module.css";

/**
 * Typing indicator component for showing when someone is typing
 * @param {Object} props - Component props
 * @param {string} props.label - Optional label for the typing indicator
 * @returns {JSX.Element} Rendered typing indicator component
 */
const TypingIndicator = ({ label = "typing" }) => {
    return (
        <div
            className={styles.container}
            role="status"
            aria-label={`${label} indicator`}
            aria-live="polite"
        >
            <div className={styles.dots}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span className="visually-hidden">Someone is typing...</span>
        </div>
    );
};

TypingIndicator.propTypes = {
    label: PropTypes.string,
};

TypingIndicator.defaultProps = {
    label: "typing",
};

export default TypingIndicator;