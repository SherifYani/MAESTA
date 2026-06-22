/**
 * @file AdminDataTable.jsx
 * @description Reusable controlled data table component for admin dashboard.
 *   All filtering, sorting, and pagination logic is delegated to the parent.
 *   The component is purely presentational – it renders the `data` prop as-is.
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-08
 * @changes:
 * - Removed internal searchTerm, currentPage, sortConfig state
 * - Removed useMemo filtering / sorting / pagination logic
 * - Added controlled props: searchTerm, onSearchChange, currentPage, totalPages,
 *   onPageChange, sortConfig, onSort, totalItems
 * - Filter button now toggles a placeholder panel (future use)
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './AdminDataTable.module.css';

/**
 * Controlled Admin Data Table Component.
 *
 * The parent is responsible for all data transformations (filter, sort, paginate).
 * This component receives the already-processed current page of data and renders it.
 *
 * @param {Object}   props
 * @param {Array}    props.columns           – Column definitions.
 * @param {Array}    props.data              – Current page of data to render (pre-filtered/sorted/paginated by parent).
 * @param {string}   [props.searchTerm]      – Controlled search input value.
 * @param {Function} [props.onSearchChange]  – Called with new string when user types in search.
 * @param {number}   [props.currentPage]     – Current active page number (1-based).
 * @param {number}   [props.totalPages]      – Total number of pages.
 * @param {Function} [props.onPageChange]    – Called with new page number when user navigates.
 * @param {Object}   [props.sortConfig]      – Active sort state: { key: string, direction: 'asc'|'desc' }.
 * @param {Function} [props.onSort]          – Called with the column accessor string when header clicked.
 * @param {number}   [props.totalItems]      – Total item count (after filtering) for pagination info text.
 * @param {Function} [props.onRowClick]      – Callback when a row is clicked.
 * @param {string}   [props.title]           – Table title displayed in the header.
 * @param {boolean}  [props.searchable]      – Show the search input.
 * @param {boolean}  [props.filterable]      – Show the filter button.
 * @param {boolean}  [props.pagination]      – Show pagination controls.
 * @param {number}   [props.pageSize]        – Rows per page (used only for display info text).
 * @param {string}   [props.className]       – Extra CSS class for the outer container.
 */
const AdminDataTable = ({
    columns,
    data,
    // Controlled search
    searchTerm = '',
    onSearchChange = () => { },
    // Controlled pagination
    currentPage = 1,
    totalPages = 1,
    onPageChange = () => { },
    // Controlled sort
    sortConfig = { key: null, direction: 'asc' },
    onSort = () => { },
    // Total for display ("Showing X to Y of Z")
    totalItems = 0,
    // Existing props (unchanged)
    onRowClick,
    title = 'Data Table',
    searchable = true,
    filterable = true,
    pagination = true,
    pageSize = 10,
    className = '',
}) => {
    // Local UI state – only for the filter placeholder panel toggle
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    const handleRowClick = useCallback((row) => {
        if (onRowClick) onRowClick(row);
    }, [onRowClick]);

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    /**
     * Renders a sortable / non-sortable table header cell.
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
                onClick={isSortable ? () => onSort(column.accessor) : undefined}
                role={isSortable ? 'button' : undefined}
                tabIndex={isSortable ? 0 : undefined}
                onKeyPress={isSortable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSort(column.accessor);
                    }
                } : undefined}
                aria-label={isSortable
                    ? `Sort by ${column.header}${isSorted ? ` (${sortConfig.direction})` : ''}`
                    : undefined}
                aria-sort={isSortable && isSorted
                    ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending')
                    : undefined}
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
     * Renders a single table data cell.
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
     * Renders pagination footer with Prev / page buttons / Next and entry info.
     */
    const renderPagination = () => {
        if (!pagination || totalPages <= 1) return null;

        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, totalItems);

        // Build visible page button numbers (window of 5 around current page)
        const windowSize = Math.min(5, totalPages);
        let startPage;
        if (totalPages <= 5) {
            startPage = 1;
        } else if (currentPage <= 3) {
            startPage = 1;
        } else if (currentPage >= totalPages - 2) {
            startPage = totalPages - 4;
        } else {
            startPage = currentPage - 2;
        }

        const pageNumbers = Array.from({ length: windowSize }, (_, i) => startPage + i);

        return (
            <footer className={styles.pagination}>
                <div className={styles.pagination__info}>
                    Showing {startIndex}–{endIndex} of {totalItems} entries
                </div>
                <nav className={styles.pagination__controls} aria-label="Table navigation">
                    <button
                        className={styles.pagination__button}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                    </button>

                    {pageNumbers.map((pageNum) => (
                        <button
                            key={pageNum}
                            className={`${styles.pagination__button} ${currentPage === pageNum ? styles.pagination__buttonActive : ''}`}
                            onClick={() => onPageChange(pageNum)}
                            aria-label={`Page ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        className={styles.pagination__button}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </nav>
            </footer>
        );
    };

    // -------------------------------------------------------------------------
    // Empty state
    // -------------------------------------------------------------------------

    if (!data || data.length === 0) {
        return (
            <div className={`${styles.emptyState} ${className}`}>
                <div className={styles.emptyState__content}>
                    <h3 className={styles.emptyState__title}>No data available</h3>
                    <p className={styles.emptyState__description}>
                        {searchTerm
                            ? `No results found for "${searchTerm}". Try adjusting your search or filters.`
                            : 'There are no records to display at the moment.'}
                    </p>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // Main render
    // -------------------------------------------------------------------------

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Header: title + search + filter button */}
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
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    aria-label="Search table"
                                />
                            </div>
                        )}

                        {filterable && (
                            <button
                                className={styles.filterButton}
                                onClick={() => setShowFilterPanel((prev) => !prev)}
                                aria-label={showFilterPanel ? 'Close filter panel' : 'Open filter panel'}
                                aria-expanded={showFilterPanel}
                                title="Filter results"
                            >
                                {showFilterPanel
                                    ? <X size={20} aria-hidden="true" />
                                    : <Filter size={20} aria-hidden="true" />}
                            </button>
                        )}
                    </div>
                </header>
            )}

            {/* Filter placeholder panel */}
            {filterable && showFilterPanel && (
                <div
                    className={styles.filterPanel ?? ''}
                    role="region"
                    aria-label="Filter panel"
                    style={{
                        padding: 'var(--space-4) var(--space-6)',
                        borderBottom: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-muted-foreground)',
                        background: 'var(--color-muted)',
                    }}
                >
                    🔧 Advanced filter panel — coming soon.
                </div>
            )}

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.table__head}>
                        <tr>{columns.map(renderHeaderCell)}</tr>
                    </thead>
                    <tbody className={styles.table__body}>
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row.id ?? rowIndex}
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

// -----------------------------------------------------------------------------
// PropTypes
// -----------------------------------------------------------------------------

AdminDataTable.propTypes = {
    /** Column definitions */
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            header: PropTypes.string.isRequired,
            accessor: PropTypes.string,
            render: PropTypes.func,
            sortable: PropTypes.bool,
        })
    ).isRequired,
    /** Current page of data to render (parent-provided, already processed) */
    data: PropTypes.array.isRequired,

    // ── Controlled search ──────────────────────────────────────────────────
    /** Controlled search string value */
    searchTerm: PropTypes.string,
    /** Called with the new string when the user changes the search input */
    onSearchChange: PropTypes.func,

    // ── Controlled pagination ──────────────────────────────────────────────
    /** Current page number (1-based) */
    currentPage: PropTypes.number,
    /** Total number of pages */
    totalPages: PropTypes.number,
    /** Called with the new page number when the user navigates */
    onPageChange: PropTypes.func,
    /** Total filtered item count – used for "Showing X to Y of Z" text */
    totalItems: PropTypes.number,

    // ── Controlled sort ────────────────────────────────────────────────────
    /** Active sort configuration */
    sortConfig: PropTypes.shape({
        key: PropTypes.string,
        direction: PropTypes.oneOf(['asc', 'desc']),
    }),
    /** Called with the column accessor string when a sortable header is clicked */
    onSort: PropTypes.func,

    // ── Existing props (unchanged) ─────────────────────────────────────────
    /** Callback when a table row is clicked */
    onRowClick: PropTypes.func,
    /** Table title */
    title: PropTypes.string,
    /** Show the search input */
    searchable: PropTypes.bool,
    /** Show the filter button */
    filterable: PropTypes.bool,
    /** Show pagination controls */
    pagination: PropTypes.bool,
    /** Rows per page (used only to compute display info text) */
    pageSize: PropTypes.number,
    /** Extra CSS class for the outer container */
    className: PropTypes.string,
};

export default AdminDataTable;