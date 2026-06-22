/**
 * @file AdminPageHeader.jsx
 * @description Standardized header component for all admin pages
 * Features: Title, description, breadcrumb, and action buttons
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import styles from './AdminPageHeader.module.css';

/**
 * AdminPageHeader Component
 * Provides consistent header structure across all admin pages
 * 
 * @param {Object} props Component props
 * @param {string} props.title Page title
 * @param {string} [props.description] Page description/subtitle
 * @param {React.ReactNode} [props.actions] Action buttons to display
 * @param {Array<{label: string, href: string}>} [props.breadcrumb] Breadcrumb navigation
 * @param {React.ReactNode} [props.badge] Status badge or additional info
 * @param {string} [props.className] Additional CSS class
 * @returns {JSX.Element} Rendered header component
 */
const AdminPageHeader = ({
    title,
    description,
    actions,
    breadcrumb,
    badge,
    className = ''
}) => {
    return (
        <header className={`${styles.header} ${className}`}>
            {/* Breadcrumb Navigation */}
            {breadcrumb && breadcrumb.length > 0 && (
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <ol className={styles.breadcrumb__list}>
                        {breadcrumb.map((item, index) => (
                            <li key={index} className={styles.breadcrumb__item}>
                                {index < breadcrumb.length - 1 ? (
                                    <>
                                        <a
                                            href={item.href}
                                            className={styles.breadcrumb__link}
                                            aria-label={`Navigate to ${item.label}`}
                                        >
                                            {item.label}
                                        </a>
                                        <ChevronRight
                                            size={14}
                                            className={styles.breadcrumb__separator}
                                            aria-hidden="true"
                                        />
                                    </>
                                ) : (
                                    <span className={styles.breadcrumb__current} aria-current="page">
                                        {item.label}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Main Header Row */}
            <div className={styles.header__row}>
                <div className={styles.header__content}>
                    <div className={styles.title__wrapper}>
                        <h1 className={styles.title}>{title}</h1>
                        {badge && <div className={styles.badge}>{badge}</div>}
                    </div>
                    {description && (
                        <p className={styles.description}>{description}</p>
                    )}
                </div>

                {actions && (
                    <div className={styles.header__actions}>
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};

AdminPageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    actions: PropTypes.node,
    breadcrumb: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired,
        })
    ),
    badge: PropTypes.node,
    className: PropTypes.string,
};

export default AdminPageHeader;
