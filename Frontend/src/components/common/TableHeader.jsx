/**
 * @file TableHeader.jsx
 * @description Table header component with optional sorting.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './DataTable.module.css';

export const TableHeader = ({ columns, sortColumn, sortDirection, onSort }) => {
  const handleSort = (col) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  return (
    <thead className={styles.header}>
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className={`${styles.headerCell} ${col.sortable ? styles.sortable : ''}`}
            onClick={() => handleSort(col)}
            style={{ width: col.width }}
          >
            <div className={styles.headerContent}>
              {col.label}
              {col.sortable && sortColumn === col.key && (
                <span className={styles.sortIcon}>
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

TableHeader.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
};