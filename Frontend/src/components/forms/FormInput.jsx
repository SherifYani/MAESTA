/**
 * @file FormInput.jsx
 * @description Reusable form input component with icon support
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 10-10-2025
 */

import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../../styles/components/forms/FormInput.css";
import "../../styles/shared/_form-base.css";

/**
 * FormInput Component
 * @description Renders a styled input field with icon and optional password toggle
 * @param {Object} props - The component props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.type - Input type (text, email, password, url, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change event handler
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.showPasswordToggle - Whether to show password toggle button
 * @param {boolean} props.showPassword - Whether password is visible
 * @param {Function} props.onTogglePassword - Password toggle handler
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.hasError - Whether the input has an error state
 * @returns {JSX.Element} The rendered form input component
 */
function FormInput({
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  className = "",
  hasError = false,
}) {
  const { t } = useTranslation(['common']);
  const containerClass = `form-input__container ${className} ${
    hasError ? "form-input--error" : ""
  }`.trim();

  return (
    <div className={containerClass}>
      <div className="form-input__wrapper">
        <i className={`${icon} form-input__icon`} />
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="form-input__field"
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="form-input__password-toggle"
            aria-label={showPassword ? t('common:actions.hidePassword', "Hide password") : t('common:actions.showPassword', "Show password")}
          >
            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
          </button>
        )}
      </div>
    </div>
  );
}

FormInput.propTypes = {
  icon: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  showPasswordToggle: PropTypes.bool,
  showPassword: PropTypes.bool,
  onTogglePassword: PropTypes.func,
  className: PropTypes.string,
  hasError: PropTypes.bool,
};

export default FormInput;