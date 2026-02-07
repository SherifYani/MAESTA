/**
 * @file Button.jsx
 * @description A reusable button component with multiple variants and sizes.
 * @author Sherif Talaat
 * @date 2024-01-15
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2024-01-20
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './Common.module.css';

/**
 * A reusable button component with multiple variants and sizes.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The button content.
 * @param {string} [props.variant='primary'] - The button variant.
 * @param {string} [props.size='medium'] - The button size.
 * @param {string} [props.type='button'] - The button type attribute.
 * @param {function} [props.onClick] - The click handler function.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {Object} [props.rest] - Additional HTML button attributes.
 * @returns {JSX.Element} The rendered button component.
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    type = 'button',
    onClick,
    disabled = false,
    className = '',
    ...rest
}) => {
    // Combine class names
    const buttonClasses = [
        styles.button,
        styles[variant],
        styles[size],
        className
    ].filter(Boolean).join(' ');

    // Handle button click
    const handleClick = (event) => {
        if (!disabled && onClick) {
            onClick(event);
        }
    };

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled}
            aria-disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string
};