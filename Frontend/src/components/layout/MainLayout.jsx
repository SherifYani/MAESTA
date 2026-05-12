/**
 * @file MainLayout.jsx
 * @description Main layout component for public pages with responsive design and accessibility features
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import SkipToContent from '../common/SkipToContent';
import styles from './MainLayout.module.css';

/**
 * Main layout component for public pages (Jobs, Gigs, AI).
 * Provides consistent structure with header, main content area, and footer.
 * Includes skip navigation links, loading states, and theme management.
 * @param {Object} props - Component props
 * @param {boolean} props.showHeader - Whether to show the header
 * @param {boolean} props.showFooter - Whether to show the footer
 * @param {boolean} props.isLoading - Whether the layout is in loading state
 * @param {React.ReactNode} props.children - Optional children to render
 * @returns {JSX.Element} Rendered main layout component
 */
const MainLayout = ({
    showHeader = true,
    showFooter = true,
    isLoading = false,
    children = null,
}) => {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);

    /**
     * Handle route transitions
     */
    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 300);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    /**
     * Handle skip to content click
     */
    const handleSkipToContent = () => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /**
     * Get page title based on current route
     */
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/jobs')) return 'Jobs';
        if (path.includes('/gigs')) return 'Gigs';
        if (path.includes('/ai')) return 'AI Assistant';
        return 'Home';
    };

    return (
        <>
            {/* Skip Navigation Link for Accessibility */}
            <SkipToContent onClick={handleSkipToContent} />

            <div className={styles.layoutContainer}>
                {/* Site Header */}
                {showHeader && (
                    <header className={styles.header} role="banner">
                        <Header />
                    </header>
                )}

                {/* Main Content Area */}
                <main
                    id="main-content"
                    className={`${styles.mainContent} ${isTransitioning ? styles.contentTransitioning : ''
                        }`}
                    role="main"
                    aria-label={`${getPageTitle()} page content`}
                    tabIndex={-1}
                >
                    {/* Loading State */}
                    {isLoading ? (
                        <div className={styles.loadingContainer} role="status" aria-live="polite">
                            <LoadingSpinner size="large" label={`Loading ${getPageTitle()} content...`} />
                        </div>
                    ) : (
                        <>
                            {/* Page Transition Overlay */}
                            {isTransitioning && (
                                <div
                                    className={styles.transitionOverlay}
                                    role="presentation"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Page Content */}
                            {children || <Outlet />}
                        </>
                    )}
                </main>

                {/* Site Footer */}
                {showFooter && (
                    <footer className={styles.footer} role="contentinfo">
                        <Footer />
                    </footer>
                )}
            </div>
        </>
    );
};

MainLayout.propTypes = {
    /**
     * Whether to show the header
     */
    showHeader: PropTypes.bool,
    /**
     * Whether to show the footer
     */
    showFooter: PropTypes.bool,
    /**
     * Whether the layout is in loading state
     */
    isLoading: PropTypes.bool,
    /**
     * Optional children to render instead of Outlet
     */
    children: PropTypes.node,
    /**
     * Additional CSS class for the layout container
     */
    className: PropTypes.string,
};

MainLayout.defaultProps = {
    showHeader: true,
    showFooter: true,
    isLoading: false,
    children: null,
    className: '',
};

export default MainLayout;