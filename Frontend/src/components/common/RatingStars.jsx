/**
 * @file RatingStars.jsx
 * @description Star rating component.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './RatingStars.module.css';

export const RatingStars = ({ rating, onRate, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = (value) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  const getStarClass = (starValue) => {
    const filled = (hoverRating || rating) >= starValue;
    return `${styles.star} ${filled ? styles.filled : ''} ${styles[size]}`;
  };

  return (
    <div className={styles.container}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={getStarClass(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => handleRate(star)}
          role={!readonly ? 'button' : undefined}
          tabIndex={!readonly ? 0 : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.number,
  onRate: PropTypes.func,
  readonly: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};