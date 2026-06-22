/**
 * @file Pagination.jsx
 * @description Pagination controls with page size selector.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Pagination.module.css';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  showTotal = true,
  totalItems,
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });
    return rangeWithDots;
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (totalPages <= 1 && !showTotal) return null;

  return (
    <div className={styles.pagination}>
      <div className={styles.controls}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ←
        </button>
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        <button
          className={styles.navButton}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          →
        </button>
      </div>
      {onPageSizeChange && (
        <div className={styles.pageSize}>
          <label>
            Show
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={styles.pageSizeSelect}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            per page
          </label>
        </div>
      )}
      {showTotal && totalItems !== undefined && (
        <div className={styles.total}>
          Total: {totalItems} items
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageSizeChange: PropTypes.func,
  showTotal: PropTypes.bool,
  totalItems: PropTypes.number,
};