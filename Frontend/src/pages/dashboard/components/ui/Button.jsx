/**
 * @file Button.jsx
 * @description Base button component with variants, sizes, and loading states.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 9
 *
 */

import React from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";

/**
 * Button component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 * @param {React.ReactNode} props.children - Button content
 * @param {LucideIcon} props.icon - Icon component
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Inline styles
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type attribute
 * @param {React.Ref} props.ref - Forwarded ref
 * @returns {JSX.Element} Rendered button component
 */
const Button = React.forwardRef(
  (
    {
      variant = "primary",
      size = "medium",
      children,
      icon: Icon,
      loading = false,
      disabled = false,
      className = "",
      style,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      isDisabled ? styles.disabled : "",
      loading ? styles.loading : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick = (e) => {
      if (!isDisabled && onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        style={style}
        onClick={handleClick}
        disabled={isDisabled}
        type={type}
        aria-busy={loading}
        {...props}>
        {loading && <Loader2 className={styles.loader} size={16} />}

        {!loading && Icon && <Icon className={styles.icon} size={16} />}

        {children && <span className={styles.content}>{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  /** Button variant */
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "ghost",
    "outline",
    "destructive",
  ]),
  /** Button size */
  size: PropTypes.oneOf(["small", "medium", "large", "icon"]),
  /** Button content */
  children: PropTypes.node,
  /** Icon component */
  icon: PropTypes.elementType,
  /** Loading state */
  loading: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button type attribute */
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

Button.defaultProps = {
  variant: "primary",
  size: "medium",
  loading: false,
  disabled: false,
  type: "button",
};

export default Button;

/**
 * @example
 * // Basic button
 * <Button variant="primary">Click me</Button>
 *
 * // Button with icon
 * <Button icon={Plus} variant="secondary">Add Item</Button>
 *
 * // Loading button
 * <Button loading variant="primary">
 *   Processing...
 * </Button>
 *
 * // Icon-only button
 * <Button icon={Settings} size="icon" variant="ghost" />
 *
 * // Destructive button
 * <Button variant="destructive" onClick={handleDelete}>
 *   Delete
 * </Button>
 */
