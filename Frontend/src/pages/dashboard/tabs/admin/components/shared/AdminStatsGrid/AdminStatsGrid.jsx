/**
 * @file AdminStatsGrid.jsx
 * @description Grid container for AdminStatsCard components
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React from 'react';
import PropTypes from 'prop-types';
import AdminStatsCard from '../AdminStatsCard';
import styles from './AdminStatsGrid.module.css';

/**
 * AdminStatsGrid Component
 * Displays stats cards in a responsive grid layout
 * 
 * @param {Object} props Component props
 * @param {Array<Object>} props.stats Array of stat objects
 * @param {number} [props.columns] Number of columns (1-4)
 * @param {string} [props.className] Additional CSS class
 * @returns {JSX.Element} Rendered stats grid
 */
const AdminStatsGrid = ({
    stats = [],
    columns = 4,
    className = ''
}) => {
    if (!stats || stats.length === 0) {
        return null;
    }

    const gridClassName = `${styles.grid} ${styles[`grid--col${columns}`]} ${className}`;

    return (
        <div className={gridClassName}>
            {stats.map((stat, index) => (
                <AdminStatsCard
                    key={stat.id || index}
                    {...stat}
                />
            ))}
        </div>
    );
};

AdminStatsGrid.propTypes = {
    stats: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            icon: PropTypes.elementType,
            change: PropTypes.string,
            trend: PropTypes.oneOf(['up', 'down', 'neutral']),
            description: PropTypes.string,
        })
    ).isRequired,
    columns: PropTypes.oneOf([1, 2, 3, 4]),
    className: PropTypes.string,
};

export default AdminStatsGrid;
