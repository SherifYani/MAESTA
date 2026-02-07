/**
 * @file Alert.jsx
 * @description A reusable alert component for displaying status messages.
 * @author Sherif Talaat
 * @date 2024-01-15
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2024-01-20
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './Common.module.css';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

/**
 * A reusable alert component for displaying status messages.
 * @param {Object} props - The component props.
 * @param {string} [props.type='info'] - The alert type.
 * @param {string} props.message - The alert message.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered alert component.
 */
export const Alert = ({ type = 'info', message, className = '' }) => {
    // Icon mapping based on alert type
    const icons = {
        info: <Info aria-hidden="true" />,
        success: <CheckCircle aria-hidden="true" />,
        warning: <AlertCircle aria-hidden="true" />,
        error: <XCircle aria-hidden="true" />
    };

    // ARIA role based on alert type
    const alertRoles = {
        info: 'status',
        success: 'status',
        warning: 'alert',
        error: 'alert'
    };

    // ARIA live regions based on importance
    const liveRegions = {
        info: 'polite',
        success: 'polite',
        warning: 'assertive',
        error: 'assertive'
    };

    return (
        <div
            className={`${styles.alert} ${styles[type]} ${className}`}
            role={alertRoles[type]}
            aria-live={liveRegions[type]}
            aria-atomic="true"
        >
            <span className={styles.alertIcon}>
                {icons[type]}
            </span>
            <span className={styles.alertMessage}>
                {message}
            </span>
        </div>
    );
};

Alert.propTypes = {
    type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
    message: PropTypes.string.isRequired,
    className: PropTypes.string
};