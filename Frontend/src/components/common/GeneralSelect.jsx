/**
 * @file GeneralSelect.jsx
 * @description A modern, accessible, and themeable select component built with React.
 *              Follows BEM naming for styles and uses global CSS variables.
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 2025-03-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-03-16
 */

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Trophy } from "lucide-react";
import styles from "./GeneralSelect.module.css";

/**
 * ModernSelect – A custom select dropdown with keyboard navigation and theming.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string|number} props.value - Currently selected value
 * @param {Function} props.onChange - Callback when selection changes (receives value)
 * @param {Array<{value: string|number, label: string}>} props.options - Array of options
 * @param {string} props.label - Header label inside dropdown
 * @param {React.ElementType} [props.icon=Trophy] - Icon component to display in button
 * @param {string} [props.placeholder="Select an option..."] - Placeholder text when no value
 * @param {boolean} [props.disabled=false] - Whether the select is disabled
 * @returns {JSX.Element} The rendered component
 */
function GeneralSelect({
  value,
  onChange,
  options,
  label,
  icon: Icon = Trophy,
  showIcon = true,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Reset highlighted index when options change or dropdown opens
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = options.findIndex(opt => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, options, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = e => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (options[highlightedIndex]) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleOptionClick = optionValue => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`${styles["modern-select"]}${isOpen ? ` ${styles["modern-select--open"]}` : ""}${className ? ` ${className}` : ""}`}>
      {/* Select Button */}
      <button
        ref={selectRef}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        className={`${styles["modern-select__button"]} ${disabled ? styles["modern-select__button--disabled"] : ""
          }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        type="button"
      >
        <span className={styles["modern-select__button-content"]}>
          {showIcon && Icon && Icon !== "" && (
            typeof Icon === 'string' ? (
              <i className={`${Icon} ${styles["modern-select__icon"]}`} />
            ) : (
              <Icon className={styles["modern-select__icon"]} />
            )
          )}
          <span className={styles["modern-select__text"]}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`${styles["modern-select__chevron"]} ${isOpen ? styles["modern-select__chevron--open"] : ""
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className={styles["modern-select__dropdown"]}
          role="listbox"
        >

          {/* Options List */}
          <div className={styles["modern-select__options-container"]}>
            {options.length > 0 ? (
              options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`${styles["modern-select__option"]} ${value === option.value
                    ? styles["modern-select__option--selected"]
                    : ""
                    } ${highlightedIndex === index
                      ? styles["modern-select__option--highlighted"]
                      : ""
                    }`}
                  role="option"
                  aria-selected={value === option.value}
                  type="button"
                >
                  {/* Background gradient for selected state */}
                  <div className={styles["modern-select__option-bg"]} />

                  {/* Content */}
                  <div className={styles["modern-select__option-content"]}>
                    <div className={styles["modern-select__option-left"]}>
                      {value === option.value && (
                        <div className={styles["modern-select__option-indicator"]}>
                          <div className={styles["modern-select__option-dot"]} />
                        </div>
                      )}
                      <span className={styles["modern-select__option-label"]}>
                        {option.label}
                      </span>
                    </div>
                    {value === option.value && (
                      <div className={styles["modern-select__option-checkmark"]}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Hover indicator line */}
                  <div className={styles["modern-select__option-line"]} />
                </button>
              ))
            ) : (
              <div className={styles["modern-select__empty"]}>
                No options available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden native select for accessibility and form submission */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={styles["modern-select__hidden"]}
        aria-hidden="true"
        tabIndex={-1}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default GeneralSelect;