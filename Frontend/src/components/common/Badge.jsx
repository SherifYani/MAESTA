/**
 * @file Badge.jsx
 * @description Badge for status, priority, type indicators.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Badge.module.css';

export const Badge = ({ variant = 'default', children, className = '' }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info', 'pending', 'approved', 'rejected', 'high', 'medium', 'low']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};