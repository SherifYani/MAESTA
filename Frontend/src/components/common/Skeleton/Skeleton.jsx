import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: borderRadius || 'var(--radius-md)',
  };

  return <div className={`${styles.skeleton} ${className}`} style={style} />;
};

export default Skeleton;
