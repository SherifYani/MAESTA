/**
 * @file FormTextarea.jsx
 * @description Reusable form textarea component with icon support
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 10-10-2025
 */

import PropTypes from "prop-types";
import "../styles/form-components.css";

/**
 * FormTextarea Component
 * @description Renders a styled textarea field with icon
 * @param {Object} props - The component props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.name - Textarea name attribute
 * @param {string} props.placeholder - Textarea placeholder text
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change event handler
 * @param {number} props.rows - Number of visible text rows
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.hasError - Whether the textarea has an error state
 * @returns {JSX.Element} The rendered form textarea component
 */
function FormTextarea({
  icon,
  name,
  placeholder,
  value,
  onChange,
  rows = 4,
  required = false,
  className = "",
  hasError = false,
}) {
  const containerClass = `form-textarea__container ${className} ${
    hasError ? "form-textarea--error" : ""
  }`.trim();

  return (
    <div className={containerClass}>
      <div className="form-textarea__wrapper">
        <i className={`${icon} form-textarea__icon`} />
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          className="form-textarea__field"
        />
      </div>
    </div>
  );
}

FormTextarea.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  rows: PropTypes.number,
  required: PropTypes.bool,
  className: PropTypes.string,
  hasError: PropTypes.bool,
};

export default FormTextarea;