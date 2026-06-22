/**
 * @file Input.jsx
 * @description A reusable input field component.
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
 * A reusable input field component.
 * @param {Object} props - The component props.
 * @param {string} [props.type='text'] - The input type.
 * @param {string} [props.placeholder] - The input placeholder.
 * @param {string|number} [props.value] - The input value.
 * @param {function} props.onChange - The change handler function.
 * @param {boolean} [props.disabled] - Whether the input is disabled.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {Object} [props.rest] - Additional HTML input attributes.
 * @returns {JSX.Element} The rendered input component.
 */
export const Input = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled = false,
    className = '',
    ...rest
}) => {
    // Generate a unique ID for accessibility if label is provided
    const inputId = rest.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Handle input change
    const handleChange = (event) => {
        if (onChange) {
            onChange(event);
        }
    };

    return (
        <input
            id={inputId}
            type={type}
            className={`${styles.input} ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-disabled={disabled}
            {...rest}
        />
    );
};

Input.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string
};