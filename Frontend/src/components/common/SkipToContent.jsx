/**
 * @file SkipToContent.jsx
 * @description Accessible skip link component for keyboard users
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './SkipToContent.module.css';

const SkipToContent = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className={styles.skipLink}
            type="button"
        >
            Skip to content
        </button>
    );
};

SkipToContent.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default SkipToContent;
