/**
 * @file LoadingSpinner.jsx
 * @description A reusable loading spinner component.
 * @author Sherif Talaat
 * @date 2024-01-15
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2024-01-20
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './Common.module.css';

/**
 * A reusable loading spinner component.
 * @param {Object} props - The component props.
 * @param {string} [props.size='medium'] - The spinner size.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.label='Loading...'] - Accessible label for screen readers.
 * @returns {JSX.Element} The rendered loading spinner component.
 */
export const LoadingSpinner = ({
    size = 'medium',
    className = '',
    label = 'Loading...'
}) => {
    return (
        <div
            className={`${styles.spinnerContainer} ${className}`}
            role="status"
            aria-live="polite"
        >
            <div
                className={`${styles.spinner} ${styles[size]}`}
                aria-hidden="true"
            />
            <span className={styles.visuallyHidden}>
                {label}
            </span>
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    className: PropTypes.string,
    label: PropTypes.string
};