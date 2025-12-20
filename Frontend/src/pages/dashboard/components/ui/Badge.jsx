/**
 * @file Badge.jsx
 * @description Status badge component with variants for different states.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 *
 */

import React from "react";
import PropTypes from "prop-types";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import styles from "./Badge.module.css";

/**
 * Variant configuration
 */
const VARIANT_CONFIG = {
  default: {
    className: styles.default,
    icon: null,
  },
  primary: {
    className: styles.primary,
    icon: null,
  },
  secondary: {
    className: styles.secondary,
    icon: null,
  },
  success: {
    className: styles.success,
    icon: CheckCircle,
  },
  warning: {
    className: styles.warning,
    icon: AlertCircle,
  },
  error: {
    className: styles.error,
    icon: XCircle,
  },
  info: {
    className: styles.info,
    icon: null,
  },
  outline: {
    className: styles.outline,
    icon: null,
  },
  active: {
    className: styles.active,
    icon: CheckCircle,
  },
  pending: {
    className: styles.pending,
    icon: Clock,
  },
  completed: {
    className: styles.completed,
    icon: CheckCircle,
  },
  review: {
    className: styles.review,
    icon: AlertCircle,
  },
};

/**
 * Badge component
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge variant
 * @param {React.ReactNode} props.children - Badge content
 * @param {LucideIcon} props.icon - Custom icon component
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.rounded - Whether badge is fully rounded
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Rendered badge component
 */
const Badge = ({
  variant = "default",
  children,
  icon: IconProp,
  className = "",
  style,
  rounded = false,
  onClick,
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  const IconComponent = IconProp || config.icon;

  const badgeClasses = [
    styles.badge,
    config.className,
    rounded ? styles.rounded : "",
    onClick ? styles.clickable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={badgeClasses}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}>
      {IconComponent && <IconComponent className={styles.icon} size={12} />}
      <span className={styles.content}>{children}</span>
    </span>
  );
};

Badge.propTypes = {
  /** Badge variant */
  variant: PropTypes.oneOf([
    "default",
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "info",
    "outline",
    "active",
    "pending",
    "completed",
    "review",
  ]),
  /** Badge content */
  children: PropTypes.node.isRequired,
  /** Custom icon component */
  icon: PropTypes.elementType,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object,
  /** Whether badge is fully rounded */
  rounded: PropTypes.bool,
  /** Click handler */
  onClick: PropTypes.func,
};

Badge.defaultProps = {
  variant: "default",
  rounded: false,
};

export default Badge;

/**
 * @example
 * // Basic usage
 * <Badge variant="success">Active</Badge>
 *
 * // With icon
 * <Badge variant="pending" icon={Clock}>Processing</Badge>
 *
 * // Rounded badge
 * <Badge variant="primary" rounded>New</Badge>
 *
 * // Clickable badge
 * <Badge variant="outline" onClick={() => console.log('Clicked')}>
 *   Clickable
 * </Badge>
 */
