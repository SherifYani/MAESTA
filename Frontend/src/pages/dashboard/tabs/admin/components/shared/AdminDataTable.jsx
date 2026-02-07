/**
 * @file AdminDataTable.jsx
 * @description Reusable data table component for admin dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './AdminDataTable.module.css';

/**
 * Admin Data Table Component with search, filter, and pagination.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.columns - Column definitions.
 * @param {Array<Object>} props.data - Data array.
 * @param {function} [props.onRowClick] - Callback for row click.
 * @param {string} [props.title] - Table title.
 * @param {boolean} [props.searchable] - Enable search functionality.
 * @param {boolean} [props.filterable] - Enable filter functionality.
 * @param {boolean} [props.pagination] - Enable pagination.
 * @param {number} [props.pageSize] - Number of rows per page.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} Rendered data table component.
 */
const AdminDataTable = ({
    columns,
    data,
    onRowClick,
    title = 'Data Table',
    searchable = true,
    filterable = true,
    pagination = true,
    pageSize = 10,
    className = '',
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    /**
     * Handles search input changes.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
     */
    const handleSearchChange = useCallback((event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset to first page on search
    }, []);

    /**
     * Handles column sorting.
     * @param {string} key - The column accessor key to sort by.
     */
    const handleSort = useCallback((key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    /**
     * Handles row click events.
     * @param {Object} row - The clicked row data.
     */
    const handleRowClick = useCallback((row) => {
        if (onRowClick) {
            onRowClick(row);
        }
    }, [onRowClick]);

    /**
     * Filters and sorts data based on search term and sort configuration.
     * @type {Array<Object>}
     */
    const filteredAndSortedData = useMemo(() => {
        let result = [...data];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(row =>
                columns.some(col => {
                    const value = col.accessor ? row[col.accessor] : '';
                    return String(value).toLowerCase().includes(searchLower);
                })
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, sortConfig, columns]);

    /**
     * Paginates data if pagination is enabled.
     * @type {Object}
     */
    const paginatedData = useMemo(() => {
        if (!pagination) {
            return { data: filteredAndSortedData, totalPages: 1 };
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginated = filteredAndSortedData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

        return { data: paginated, totalPages };
    }, [filteredAndSortedData, currentPage, pageSize, pagination]);

    /**
     * Handles page navigation.
     * @param {number} page - The page number to navigate to.
     */
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= paginatedData.totalPages) {
            setCurrentPage(page);
        }
    }, [paginatedData.totalPages]);

    /**
     * Renders a table header cell with sorting capability.
     * @param {Object} column - The column definition.
     * @param {number} index - The column index.
     * @returns {JSX.Element} The table header cell.
     */
    const renderHeaderCell = (column, index) => {
        const isSortable = column.accessor && column.sortable !== false;
        const isSorted = sortConfig.key === column.accessor;
        const sortIcon = isSorted
            ? (sortConfig.direction === 'asc' ? '↑' : '↓')
            : '↕';

        return (
            <th
                key={index}
                className={styles.table__headerCell}
                onClick={isSortable ? () => handleSort(column.accessor) : undefined}
                role={isSortable ? 'button' : undefined}
                tabIndex={isSortable ? 0 : undefined}
                onKeyPress={isSortable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(column.accessor);
                    }
                } : undefined}
                aria-label={isSortable ? `Sort by ${column.header} ${isSorted ? `(${sortConfig.direction})` : ''}` : undefined}
            >
                <div className={styles.headerCellContent}>
                    <span>{column.header}</span>
                    {isSortable && (
                        <span
                            className={`${styles.sortIndicator} ${isSorted ? styles.sortIndicatorActive : ''}`}
                            aria-hidden="true"
                        >
                            {sortIcon}
                        </span>
                    )}
                </div>
            </th>
        );
    };

    /**
     * Renders a table data cell.
     * @param {Object} row - The row data.
     * @param {Object} column - The column definition.
     * @param {number} colIndex - The column index.
     * @returns {JSX.Element} The table data cell.
     */
    const renderDataCell = (row, column, colIndex) => {
        const cellValue = column.render ? column.render(row) : row[column.accessor];

        return (
            <td key={colIndex} className={styles.table__cell}>
                {cellValue}
            </td>
        );
    };

    /**
     * Renders pagination controls.
     * @returns {JSX.Element} The pagination controls.
     */
    const renderPagination = () => {
        if (!pagination || paginatedData.totalPages <= 1) {
            return null;
        }

        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, filteredAndSortedData.length);
        const totalItems = filteredAndSortedData.length;

        return (
            <footer className={styles.pagination}>
                <div className={styles.pagination__info}>
                    Showing {startIndex} to {endIndex} of {totalItems} entries
                </div>
                <nav className={styles.pagination__controls} aria-label="Table navigation">
                    <button
                        className={styles.pagination__button}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                    </button>

                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                        let pageNum;
                        if (paginatedData.totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= paginatedData.totalPages - 2) {
                            pageNum = paginatedData.totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                className={`${styles.pagination__button} ${currentPage === pageNum ? styles.pagination__buttonActive : ''}`}
                                onClick={() => handlePageChange(pageNum)}
                                aria-label={`Page ${pageNum}`}
                                aria-current={currentPage === pageNum ? 'page' : undefined}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        className={styles.pagination__button}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === paginatedData.totalPages}
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </nav>
            </footer>
        );
    };

    // Render empty state if no data
    if (!data || data.length === 0) {
        return (
            <div className={`${styles.emptyState} ${className}`}>
                <div className={styles.emptyState__content}>
                    <h3 className={styles.emptyState__title}>No data available</h3>
                    <p className={styles.emptyState__description}>
                        There are no records to display at the moment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${className}`}>
            {(title || searchable || filterable) && (
                <header className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}

                    <div className={styles.controls}>
                        {searchable && (
                            <div className={styles.search}>
                                <Search
                                    size={20}
                                    className={styles.search__icon}
                                    aria-hidden="true"
                                />
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    className={styles.search__input}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    aria-label="Search table"
                                />
                            </div>
                        )}

                        {filterable && (
                            <button
                                className={styles.filterButton}
                                aria-label="Filter results"
                                title="Filter results"
                            >
                                <Filter size={20} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </header>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.table__head}>
                        <tr>{columns.map(renderHeaderCell)}</tr>
                    </thead>
                    <tbody className={styles.table__body}>
                        {paginatedData.data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={`${styles.table__row} ${onRowClick ? styles.table__rowClickable : ''}`}
                                onClick={() => onRowClick && handleRowClick(row)}
                                onKeyPress={(e) => {
                                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        handleRowClick(row);
                                    }
                                }}
                                tabIndex={onRowClick ? 0 : undefined}
                                role={onRowClick ? 'button' : 'row'}
                                aria-label={onRowClick ? `View details for row ${rowIndex + 1}` : undefined}
                            >
                                {columns.map((column, colIndex) =>
                                    renderDataCell(row, column, colIndex)
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );
};

AdminDataTable.propTypes = {
    /** Column definitions for the table */
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            header: PropTypes.string.isRequired,
            accessor: PropTypes.string,
            render: PropTypes.func,
            sortable: PropTypes.bool,
        })
    ).isRequired,
    /** Data to display in the table */
    data: PropTypes.array.isRequired,
    /** Callback function when a row is clicked */
    onRowClick: PropTypes.func,
    /** Table title */
    title: PropTypes.string,
    /** Enable search functionality */
    searchable: PropTypes.bool,
    /** Enable filter functionality */
    filterable: PropTypes.bool,
    /** Enable pagination */
    pagination: PropTypes.bool,
    /** Number of rows per page */
    pageSize: PropTypes.number,
    /** Additional CSS classes */
    className: PropTypes.string,
};

export default AdminDataTable;