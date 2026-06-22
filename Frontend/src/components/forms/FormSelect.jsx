/**
 * @file FormSelect.jsx
 * @description Reusable form select component with icon support
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 10-10-2025
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import PropTypes from "prop-types";
import GeneralSelect from "../common/GeneralSelect";
import "../../styles/components/form-components.css";

/**
 * FormSelect Component
 * @description Renders a styled select dropdown with icon
 * @param {Object} props - The component props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.name - Select name attribute
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change event handler
 * @param {Array} props.options - Array of option objects with value and label
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.hasError - Whether the select has an error state
 * @returns {JSX.Element} The rendered form select component
 */
function FormSelect({
    icon,
    name,
    value,
    onChange,
    options,
    required = false,
    className = "",
    hasError = false,
}) {
    const containerClass = `form-select__container ${className} ${hasError ? "form-select--error" : ""
        }`.trim();

    return (
        <div className={containerClass}>
            <div className="form-select__wrapper">
                <GeneralSelect
                    name={name}
                    value={value}
                    onChange={(selectedValue) => {
                        // Synthesize a DOM-event-like object so handlers that
                        // use e.target.name / e.target.value still work.
                        onChange({ target: { name, value: selectedValue } });
                    }}
                    options={options}
                    icon={icon}
                    className="form-select__field"
                />
            </div>
        </div>
    );
}

FormSelect.propTypes = {
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    required: PropTypes.bool,
    className: PropTypes.string,
    hasError: PropTypes.bool,
};

export default FormSelect;