/**
 * @file RoleCard.jsx
 * @description Role selection card component
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 10-10-2025
 */

import PropTypes from "prop-types";
import "../styles/form-components.css";

/**
 * RoleCard Component
 * @description Renders a selectable role card with icon, title, and description
 * @param {Object} props - The component props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.title - Role title
 * @param {boolean} props.isSelected - Whether this role is currently selected
 * @param {Function} props.onClick - Click event handler
 * @param {string} props.className - Additional CSS class names
 * @returns {JSX.Element} The rendered role card component
 */
function RoleCard({ icon, title, isSelected, onClick, className = "" }) {
  const cardClass = `role-card ${isSelected ? "role-card--selected" : ""} ${className}`.trim();

  return (
    <div
      className={cardClass}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-pressed={isSelected}
      aria-label={`Select ${title} role`}
    >
      <i className={`${icon} role-card__icon`} />
      <h3 className="role-card__title">{title}</h3>
    </div>
  );
}

RoleCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default RoleCard;