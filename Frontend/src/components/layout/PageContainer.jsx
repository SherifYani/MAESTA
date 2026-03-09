/**
 * @file PageContainer.jsx
 * @description Global layout container for standardizing max-widths and margins across non-dashboard pages
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 08-03-2026
*/

import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageContainer.module.css';

/**
 * A standard page container to enforce consistent max-widths and responsive padding.
 * Designed to be used directly inside `MainLayout` or standard `<main>` tags.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='lg'] - Max-width variant. sm=800px, md=1000px, lg=1200px, xl=1400px, full=100%
 * @param {string} [props.className=''] - Additional class names
 * @param {React.ElementType} [props.as='div'] - HTML element to render (e.g., 'main', 'section', 'div')
 * @returns {JSX.Element}
 */
const PageContainer = ({
    children,
    size = 'lg',
    className = '',
    as: Component = 'div',
    ...rest
}) => {
    // Determine the size class
    const sizeClass = styles[`container--${size}`] || styles['container--lg'];

    return (
        <Component
            className={`${styles.container} ${sizeClass} ${className}`}
            {...rest}
        >
            {children}
        </Component>
    );
};

PageContainer.propTypes = {
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    className: PropTypes.string,
    as: PropTypes.elementType,
};

PageContainer.defaultProps = {
    size: 'lg',
    className: '',
    as: 'div',
};

export default PageContainer;
