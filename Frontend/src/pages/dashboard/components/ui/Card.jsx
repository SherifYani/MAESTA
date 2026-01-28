/**
 * @file Card.jsx
 * @description Base card component with header, content, and footer slots.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 *
 */

import React from "react";
import PropTypes from "prop-types";
import styles from "./Card.module.css";

/**
 * Card component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS class
 * @param {React.ReactNode} props.header - Header content (optional)
 * @param {string} props.title - Card title (optional, alternative to header)
 * @param {string} props.subtitle - Card subtitle (optional)
 * @param {React.ReactNode} props.action - Action content for header (optional)
 * @param {React.ReactNode} props.footer - Footer content (optional)
 * @param {boolean} props.padding - Whether to apply padding (default: true)
 * @param {Object} props.style - Inline styles (optional)
 * @param {Function} props.onClick - Click handler (optional)
 * @returns {JSX.Element} Rendered card component
 */
const Card = ({
  children,
  className = "",
  header,
  title,
  subtitle,
  action,
  footer,
  padding = true,
  style,
  onClick,
}) => {
  const cardClasses = [
    styles.card,
    padding ? styles.withPadding : "",
    onClick ? styles.clickable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasHeader = header || title || subtitle;

  return (
    <div
      className={cardClasses}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}>
      {hasHeader && (
        <div className={styles.header}>
          {header ? (
            header
          ) : (
            <>
              <div className={styles.headerContent}>
                {title && <h3 className={styles.title}>{title}</h3>}
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>
              {action && <div className={styles.headerAction}>{action}</div>}
            </>
          )}
        </div>
      )}

      <div className={styles.content}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  /** Card content */
  children: PropTypes.node,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Custom header content (overrides title/subtitle) */
  header: PropTypes.node,
  /** Card title */
  title: PropTypes.string,
  /** Card subtitle */
  subtitle: PropTypes.string,
  /** Action content for header (e.g., buttons) */
  action: PropTypes.node,
  /** Footer content */
  footer: PropTypes.node,
  /** Whether to apply padding */
  padding: PropTypes.bool,
  /** Inline styles */
  style: PropTypes.object,
  /** Click handler */
  onClick: PropTypes.func,
};

export default Card;

/**
 * @example
 * // Basic usage with title
 * <Card title="Dashboard" subtitle="Overview">
 *   <p>Card content goes here</p>
 * </Card>
 *
 * // With custom header and footer
 * <Card
 *   header={<h2>Custom Header</h2>}
 *   footer={<button>Action</button>}
 * >
 *   Content
 * </Card>
 *
 * // Clickable card
 * <Card
 *   title="Clickable Card"
 *   onClick={() => console.log('Clicked')}
 * >
 *   Click me!
 * </Card>
 */
