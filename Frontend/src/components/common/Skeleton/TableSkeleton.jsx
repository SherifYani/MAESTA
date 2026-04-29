import React from 'react';
import Skeleton from './Skeleton';
import styles from './TableSkeleton.module.css';

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className={styles.tableSkeleton}>
      <div className={styles.tableSkeleton__header}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="2rem" />
        ))}
      </div>
      <div className={styles.tableSkeleton__body}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={styles.tableSkeleton__row}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} height="1.5rem" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
