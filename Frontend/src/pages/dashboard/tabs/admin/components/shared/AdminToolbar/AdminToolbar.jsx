/**
 * @file AdminToolbar.jsx
 * @description Standardized toolbar component for search and filters
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Search, Filter } from 'lucide-react';
import styles from './AdminToolbar.module.css';

/**
 * AdminToolbar Component
 * Provides consistent search and filter UI across admin pages
 * 
 * @param {Object} props Component props
 * @param {string} [props.searchPlaceholder] Search input placeholder
 * @param {string} [props.searchValue] Search input value
 * @param {Function} [props.onSearchChange] Search change handler
 * @param {React.ReactNode} [props.filters] Filter components
 * @param {React.ReactNode} [props.actions] Additional action buttons
 * @param {boolean} [props.showSearch] Show search input
 * @param {string} [props.className] Additional CSS class
 * @returns {JSX.Element} Rendered toolbar component
 */
const AdminToolbar = ({
    searchPlaceholder = 'Search...',
    searchValue = '',
    onSearchChange,
    filters,
    actions,
    showSearch = true,
    className = ''
}) => {
    return (
        <div className={`${styles.toolbar} ${className}`}>
            <div className={styles.toolbar__left}>
                {showSearch && (
                    <div className={styles.search}>
                        <Search size={18} className={styles.search__icon} aria-hidden="true" />
                        <input
                            type="text"
                            className={styles.search__input}
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={onSearchChange}
                            aria-label="Search"
                        />
                    </div>
                )}

                {filters && (
                    <div className={styles.filters}>
                        {filters}
                    </div>
                )}
            </div>

            {actions && (
                <div className={styles.toolbar__right}>
                    {actions}
                </div>
            )}
        </div>
    );
};

AdminToolbar.propTypes = {
    searchPlaceholder: PropTypes.string,
    searchValue: PropTypes.string,
    onSearchChange: PropTypes.func,
    filters: PropTypes.node,
    actions: PropTypes.node,
    showSearch: PropTypes.bool,
    className: PropTypes.string,
};

export default AdminToolbar;
