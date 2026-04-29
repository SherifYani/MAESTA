/**
 * @file StatsGrid.jsx
 * @description Grid layout for displaying stat cards
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import StatCard from "./StatCard";
import styles from "./StatsGrid.module.css";

/**
 * StatsGrid component for displaying metrics in a responsive grid
 * @param {Object} props - Component props
 * @param {Array} props.metrics - Array of metric objects
 * @returns {JSX.Element} The rendered stats grid
 */
const StatsGrid = ({ metrics = [] }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No metrics available</p>
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      {metrics.map((metric, index) => (
        <StatCard
          key={`${metric.title}-${index}`}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
          trendType={metric.trendType}
          description={metric.description}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
