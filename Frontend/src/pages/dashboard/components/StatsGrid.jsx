/**
 * @file StatsGrid.jsx
 * @description Grid container for stat cards
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import StatCard from "./StatCard";
import styles from "./StatsGrid.module.css";

/**
 * StatsGrid component for displaying multiple stat cards in a grid
 * @param {Object} props - Component props
 * @param {Array} props.metrics - Array of metric objects
 * @param {number} [props.columns] - Number of columns (default: auto-fit)
 * @returns {JSX.Element} The rendered stats grid
 */
const StatsGrid = ({ metrics, columns }) => {
  const gridStyle = columns
    ? {
        gridTemplateColumns: `repeat(${columns}, minmax(240px, 1fr))`,
      }
    : {};

  return (
    <div className={styles.statsGrid} style={gridStyle}>
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
