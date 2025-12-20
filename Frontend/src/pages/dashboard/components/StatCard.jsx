/**
 * @file StatCard.jsx
 * @description Reusable stat card component for displaying metrics with trends
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './StatCard.module.css';

/**
 * StatCard component for displaying metrics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.change - Change text (e.g., "+12 today")
 * @param {string} props.icon - Icon to display
 * @param {string} props.trendType - Type of trend ('positive', 'negative', 'neutral')
 * @param {string} [props.description] - Optional description
 * @returns {JSX.Element} The rendered stat card
 */
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trendType = 'positive',
  description 
}) => {
  /**
   * Get trend icon based on trend type
   * @param {string} type - Trend type
   * @returns {JSX.Element} Trend icon
   */
  const getTrendIcon = (type) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className={styles.trendIconPositive} size={16} />;
      case 'negative':
        return <TrendingDown className={styles.trendIconNegative} size={16} />;
      default:
        return <Minus className={styles.trendIconNeutral} size={16} />;
    }
  };

  return (
    <div className={styles.statCard}>
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{icon}</span>
        </div>
        <div className={styles.trendIndicator}>
          {getTrendIcon(trendType)}
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.valueContainer}>
          <span className={styles.cardValue}>{value}</span>
          <span className={`${styles.changeText} ${styles[`change${trendType}`]}`}>
            {change}
          </span>
        </div>
        
        {description && (
          <p className={styles.cardDescription}>{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;